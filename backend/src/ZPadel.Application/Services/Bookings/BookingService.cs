using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ZPadel.Application.Common;
using ZPadel.Application.Common.Exceptions;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Application.DTOs.Booking;
using ZPadel.Domain.Entities;
using ZPadel.Domain.Enums;

namespace ZPadel.Application.Services.Bookings;

public class BookingService : IBookingService
{
    private readonly IApplicationDbContext _db;
    private readonly IThawaniPaymentService _thawani;
    private readonly ILogger<BookingService> _logger;

    public BookingService(IApplicationDbContext db, IThawaniPaymentService thawani, ILogger<BookingService> logger)
    {
        _db = db;
        _thawani = thawani;
        _logger = logger;
    }

    public async Task<BookingQuoteResponseDto> QuoteAsync(BookingQuoteRequestDto request, CancellationToken ct = default)
    {
        ValidateSlotShape(request.Slots);
        var totalHours = request.Slots.Count;

        var courts = await _db.Courts.Where(c => c.IsActive).Include(c => c.PricingTiers).AsNoTracking().ToListAsync(ct);
        var closures = await _db.ClosureRules.AsNoTracking().ToListAsync(ct);
        var dates = request.Slots.Select(s => s.Date).Distinct().ToList();
        var bookedSlots = await _db.BookingSlots.Where(s => dates.Contains(s.Date) && s.ReleasedAt == null)
            .Select(s => new { s.CourtId, s.Date, s.StartTime }).AsNoTracking().ToListAsync(ct);
        var bookedSet = bookedSlots.Select(s => (s.CourtId, s.Date, s.StartTime)).ToHashSet();

        var summaries = new List<BookingSlotSummaryDto>();
        decimal total = 0;
        foreach (var slot in request.Slots)
        {
            var hourEnd = slot.StartTime.AddHours(1);
            var eligible = courts.Where(c =>
                c.IsOpenDuring(slot.StartTime, hourEnd) &&
                !bookedSet.Contains((c.Id, slot.Date, slot.StartTime)) &&
                !closures.Any(r => (r.CourtId == null || r.CourtId == c.Id) && r.AppliesTo(slot.Date, slot.StartTime, hourEnd)))
                .ToList();

            if (eligible.Count == 0)
                throw new BookingConflictException(new[] { new BookingConflictException.UnavailableSlot(slot.Date, slot.StartTime) });

            var price = eligible.Min(c => PricingCalculator.PricePerHourFor(c, totalHours));
            summaries.Add(new BookingSlotSummaryDto(slot.Date, slot.StartTime, hourEnd, price));
            total += price;
        }

        return new BookingQuoteResponseDto(total, summaries);
    }

    public async Task<BookingResultDto> CreateBookingAsync(CreateBookingRequestDto request, CancellationToken ct = default)
    {
        ValidateSlotShape(request.Slots);
        var totalHours = request.Slots.Count;
        var now = DateTime.Now;

        foreach (var slot in request.Slots)
        {
            var slotStartLocal = slot.Date.ToDateTime(slot.StartTime);
            if (slotStartLocal <= now)
                throw new BadRequestException($"Cannot book a past time: {slot.Date:yyyy-MM-dd} {slot.StartTime}.");
            if (slot.Date > DateOnly.FromDateTime(now).AddDays(BookingRules.MaxAdvanceDays))
                throw new BadRequestException($"Cannot book more than {BookingRules.MaxAdvanceDays} days in advance.");
        }

        await using var transaction = await _db.BeginTransactionAsync(ct);

        var courts = await _db.Courts.Where(c => c.IsActive).Include(c => c.PricingTiers).ToListAsync(ct);
        var closures = await _db.ClosureRules.ToListAsync(ct);
        var dates = request.Slots.Select(s => s.Date).Distinct().ToList();
        var alreadyBooked = (await _db.BookingSlots.Where(s => dates.Contains(s.Date) && s.ReleasedAt == null)
            .Select(s => new { s.CourtId, s.Date, s.StartTime }).ToListAsync(ct))
            .Select(s => (s.CourtId, s.Date, s.StartTime)).ToHashSet();

        // The Booking row must exist before any BookingSlot can reference it (FK), so it's created
        // up front, inside the same still-open transaction — a rollback below undoes it too.
        var booking = new Booking
        {
            Reference = await GenerateUniqueReferenceAsync(ct),
            GuestPhone = request.GuestPhone,
            GuestName = request.GuestName,
            GuestEmail = request.GuestEmail,
            PaymentMethod = request.PaymentMethod,
            TotalAmount = 0,
            Status = request.PaymentMethod == PaymentMethod.OnArrival ? BookingStatus.Confirmed : BookingStatus.PendingPayment,
            ExpiresAt = request.PaymentMethod == PaymentMethod.Thawani
                ? DateTime.UtcNow.AddMinutes(BookingRules.PendingPaymentExpiryMinutes)
                : null
        };
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        var unavailable = new List<BookingConflictException.UnavailableSlot>();
        var assignedSlots = new List<BookingSlot>();
        var rng = Random.Shared;

        foreach (var slot in request.Slots)
        {
            var hourEnd = slot.StartTime.AddHours(1);
            var candidates = courts.Where(c =>
                c.IsOpenDuring(slot.StartTime, hourEnd) &&
                !alreadyBooked.Contains((c.Id, slot.Date, slot.StartTime)) &&
                !closures.Any(r => (r.CourtId == null || r.CourtId == c.Id) && r.AppliesTo(slot.Date, slot.StartTime, hourEnd)))
                .OrderBy(_ => rng.Next())
                .ToList();

            var reserved = false;
            foreach (var court in candidates)
            {
                var price = PricingCalculator.PricePerHourFor(court, totalHours);
                var bookingSlot = new BookingSlot
                {
                    BookingId = booking.Id,
                    CourtId = court.Id,
                    Date = slot.Date,
                    StartTime = slot.StartTime,
                    EndTime = hourEnd,
                    Price = price
                };

                _db.BookingSlots.Add(bookingSlot);
                try
                {
                    await _db.SaveChangesAsync(ct);
                    assignedSlots.Add(bookingSlot);
                    alreadyBooked.Add((court.Id, slot.Date, slot.StartTime));
                    reserved = true;
                    break;
                }
                catch (DbUpdateException ex) when (IsUniqueViolation(ex))
                {
                    _db.ChangeTracker.Entries().First(e => ReferenceEquals(e.Entity, bookingSlot)).State = EntityState.Detached;
                }
            }

            if (!reserved)
                unavailable.Add(new BookingConflictException.UnavailableSlot(slot.Date, slot.StartTime));
        }

        if (unavailable.Count > 0)
        {
            await transaction.RollbackAsync(ct);
            throw new BookingConflictException(unavailable);
        }

        booking.TotalAmount = assignedSlots.Sum(s => s.Price);
        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        _logger.LogInformation("Booking {Reference} created with {Count} slot(s), total {Total}, status {Status}",
            booking.Reference, assignedSlots.Count, booking.TotalAmount, booking.Status);

        return ToResultDto(booking, assignedSlots);
    }

    public async Task<BookingResultDto> GetByReferenceAsync(string reference, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.Include(b => b.Slots)
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Reference == reference, ct)
            ?? throw new NotFoundException("Booking", reference);

        return ToResultDto(booking, booking.Slots.ToList());
    }

    public async Task<ThawaniPaymentInitDto> InitiateThawaniPaymentAsync(string reference, string successUrl, string cancelUrl, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Reference == reference, ct)
            ?? throw new NotFoundException("Booking", reference);

        if (booking.PaymentMethod != PaymentMethod.Thawani)
            throw new BadRequestException("This booking is not set up for online payment.");
        if (booking.Status != BookingStatus.PendingPayment)
            throw new ConflictException($"Booking is already {booking.Status}.");

        var session = await _thawani.CreateCheckoutSessionAsync(booking.Reference, booking.TotalAmount, successUrl, cancelUrl, ct);
        booking.ThawaniSessionId = session.SessionId;
        await _db.SaveChangesAsync(ct);

        return new ThawaniPaymentInitDto(session.CheckoutUrl);
    }

    public async Task HandleThawaniWebhookAsync(string sessionId, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.Include(b => b.Slots)
            .FirstOrDefaultAsync(b => b.ThawaniSessionId == sessionId, ct);

        if (booking is null)
        {
            _logger.LogWarning("Thawani webhook received for unknown session {SessionId}", sessionId);
            return;
        }

        await VerifyAndFinalizeThawaniPaymentAsync(booking, ct);
    }

    public async Task<BookingResultDto> ConfirmThawaniPaymentAsync(string reference, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.Include(b => b.Slots)
            .FirstOrDefaultAsync(b => b.Reference == reference, ct)
            ?? throw new NotFoundException("Booking", reference);

        if (booking.PaymentMethod != PaymentMethod.Thawani || string.IsNullOrEmpty(booking.ThawaniSessionId))
            throw new BadRequestException("This booking has no pending Thawani payment to confirm.");

        if (booking.Status == BookingStatus.PendingPayment)
            await VerifyAndFinalizeThawaniPaymentAsync(booking, ct);

        return ToResultDto(booking, booking.Slots.ToList());
    }

    /// <summary>Never trusts the caller's claim of success — always re-verifies the actual paid amount directly with Thawani.</summary>
    private async Task VerifyAndFinalizeThawaniPaymentAsync(Booking booking, CancellationToken ct)
    {
        if (booking.Status != BookingStatus.PendingPayment)
        {
            _logger.LogInformation("Thawani verification for {Reference} skipped, already {Status}", booking.Reference, booking.Status);
            return;
        }

        var status = await _thawani.GetSessionPaymentStatusAsync(booking.ThawaniSessionId!, ct);

        if (status.IsPaid && status.PaidAmount == booking.TotalAmount)
        {
            booking.Status = BookingStatus.Confirmed;
            booking.ExpiresAt = null;
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Booking {Reference} confirmed via Thawani payment of {Amount}", booking.Reference, status.PaidAmount);
        }
        else
        {
            _logger.LogWarning("Booking {Reference} payment failed or amount mismatch (expected {Expected}, got {Actual}); releasing slots",
                booking.Reference, booking.TotalAmount, status.PaidAmount);
            ReleaseSlots(booking, BookingStatus.PaymentFailed);
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<int> ExpireStaleBookingsAsync(CancellationToken ct = default)
    {
        var expired = await _db.Bookings.Include(b => b.Slots)
            .Where(b => b.Status == BookingStatus.PendingPayment && b.ExpiresAt != null && b.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var booking in expired)
        {
            ReleaseSlots(booking, BookingStatus.Expired);
            _logger.LogInformation("Expired pending booking {Reference} released (never paid within {Minutes} min)",
                booking.Reference, BookingRules.PendingPaymentExpiryMinutes);
        }

        if (expired.Count > 0)
            await _db.SaveChangesAsync(ct);

        return expired.Count;
    }

    /// <summary>Frees every slot's (CourtId, Date, StartTime) back up for re-booking while keeping the
    /// rows (and the parent Booking) intact for admin history — see BookingSlot.ReleasedAt.</summary>
    private static void ReleaseSlots(Booking booking, BookingStatus finalStatus)
    {
        var now = DateTime.UtcNow;
        foreach (var slot in booking.Slots)
            slot.ReleasedAt = now;
        booking.Status = finalStatus;
        booking.ExpiresAt = null;
    }

    private async Task<string> GenerateUniqueReferenceAsync(CancellationToken ct)
    {
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var code = ReferenceCodeGenerator.Generate();
            if (!await _db.Bookings.AnyAsync(b => b.Reference == code, ct))
                return code;
        }
        throw new InvalidOperationException("Failed to generate a unique booking reference.");
    }

    private static void ValidateSlotShape(List<BookingSlotRequestDto> slots)
    {
        if (slots.Count == 0)
            throw new BadRequestException("At least one time slot is required.");
        if (slots.Count > BookingRules.MaxHoursPerRequest)
            throw new BadRequestException($"A single booking cannot exceed {BookingRules.MaxHoursPerRequest} hours.");
        if (slots.Any(s => s.StartTime.Minute != 0 || s.StartTime.Second != 0))
            throw new BadRequestException("Times must be aligned to the top of the hour.");
        if (slots.Select(s => (s.Date, s.StartTime)).Distinct().Count() != slots.Count)
            throw new BadRequestException("The request contains duplicate/overlapping time slots.");
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) == true;

    private static BookingResultDto ToResultDto(Booking booking, List<BookingSlot> slots) => new(
        booking.Reference,
        booking.Status,
        booking.PaymentMethod,
        booking.TotalAmount,
        booking.ExpiresAt,
        slots.OrderBy(s => s.Date).ThenBy(s => s.StartTime)
            .Select(s => new BookingSlotSummaryDto(s.Date, s.StartTime, s.EndTime, s.Price)).ToList());
}
