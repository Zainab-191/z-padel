using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ZPadel.Application.Common.Exceptions;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Domain.Enums;

namespace ZPadel.Application.Services.Admin;

public class AdminBookingService : IAdminBookingService
{
    private readonly IApplicationDbContext _db;
    private readonly ILogger<AdminBookingService> _logger;

    public AdminBookingService(IApplicationDbContext db, ILogger<AdminBookingService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<AdminBookingSlotRowDto>> GetFilteredAsync(AdminBookingFilterDto filter, CancellationToken ct = default)
    {
        var query = _db.BookingSlots.Include(s => s.Booking).Include(s => s.Court).AsNoTracking().AsQueryable();

        if (filter.CourtId is not null) query = query.Where(s => s.CourtId == filter.CourtId);
        if (filter.Date is not null) query = query.Where(s => s.Date == filter.Date);
        if (filter.Status is not null) query = query.Where(s => s.Booking!.Status == filter.Status);
        if (filter.PaymentMethod is not null) query = query.Where(s => s.Booking!.PaymentMethod == filter.PaymentMethod);
        if (!string.IsNullOrWhiteSpace(filter.Phone)) query = query.Where(s => s.Booking!.GuestPhone.Contains(filter.Phone));

        var rows = await query
            .OrderByDescending(s => s.Date).ThenBy(s => s.StartTime)
            .Select(s => new AdminBookingSlotRowDto(
                s.BookingId, s.Booking!.Reference, s.CourtId, s.Court!.Name, s.Date, s.StartTime, s.EndTime, s.Price,
                s.Booking.Status, s.Booking.PaymentMethod, s.Booking.GuestPhone, s.Booking.GuestName, s.Booking.CreatedAt))
            .ToListAsync(ct);

        return rows;
    }

    public async Task CancelAsync(Guid bookingId, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.Include(b => b.Slots).FirstOrDefaultAsync(b => b.Id == bookingId, ct)
            ?? throw new NotFoundException("Booking", bookingId);

        if (booking.Status is BookingStatus.CancelledByAdmin or BookingStatus.Expired)
            throw new ConflictException($"Booking is already {booking.Status}.");

        // Release (not delete) the slots — the filtered unique index frees those hours back up
        // immediately, while the rows stay for admin history/reporting.
        var now = DateTime.UtcNow;
        foreach (var slot in booking.Slots)
            slot.ReleasedAt = now;
        booking.Status = BookingStatus.CancelledByAdmin;
        booking.CancelledAt = now;

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin cancelled booking {Reference}", booking.Reference);
    }
}
