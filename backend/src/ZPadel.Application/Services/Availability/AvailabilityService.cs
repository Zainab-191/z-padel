using Microsoft.EntityFrameworkCore;
using ZPadel.Application.Common;
using ZPadel.Application.Common.Exceptions;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Application.DTOs.Availability;
using ZPadel.Domain.Entities;

namespace ZPadel.Application.Services.Availability;

public class AvailabilityService : IAvailabilityService
{
    private readonly IApplicationDbContext _db;

    public AvailabilityService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<AvailableHourDto>> GetAvailabilityForDateAsync(DateOnly date, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        if (date < today || date > today.AddDays(BookingRules.MaxAdvanceDays))
            throw new BadRequestException($"Date must be between today and {BookingRules.MaxAdvanceDays} days from now.");

        return await BuildAvailabilityAsync(date, ct);
    }

    public async Task<List<AvailableHourDto>> GetAvailabilityForRangeAsync(DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        if (to < from)
            throw new BadRequestException("Range end date must not be before the start date.");
        if (to.DayNumber - from.DayNumber > BookingRules.MaxAvailabilityRangeDays)
            throw new BadRequestException($"Range must not span more than {BookingRules.MaxAvailabilityRangeDays} days.");

        var today = DateOnly.FromDateTime(DateTime.Now);
        if (from < today || to > today.AddDays(BookingRules.MaxAdvanceDays))
            throw new BadRequestException($"Range must be between today and {BookingRules.MaxAdvanceDays} days from now.");

        var result = new List<AvailableHourDto>();
        for (var date = from; date <= to; date = date.AddDays(1))
            result.AddRange(await BuildAvailabilityAsync(date, ct));

        return result;
    }

    private async Task<List<AvailableHourDto>> BuildAvailabilityAsync(DateOnly date, CancellationToken ct)
    {
        var courts = await _db.Courts
            .Where(c => c.IsActive)
            .Include(c => c.PricingTiers)
            .AsNoTracking()
            .ToListAsync(ct);

        if (courts.Count == 0) return new List<AvailableHourDto>();

        var closures = await _db.ClosureRules
            .Where(r => r.StartDate <= date && r.EndDate >= date)
            .AsNoTracking()
            .ToListAsync(ct);

        var bookedSlots = await _db.BookingSlots
            .Where(s => s.Date == date && s.ReleasedAt == null)
            .Select(s => new { s.CourtId, s.StartTime })
            .AsNoTracking()
            .ToListAsync(ct);
        var bookedSet = bookedSlots.Select(s => (s.CourtId, s.StartTime)).ToHashSet();

        var earliestOpen = courts.Min(c => c.OpeningTime);
        var latestClose = courts.Max(c => c.ClosingTime);
        var now = DateTime.Now;
        var isToday = date == DateOnly.FromDateTime(now);

        var result = new List<AvailableHourDto>();
        for (var hour = earliestOpen; hour < latestClose; hour = hour.AddHours(1))
        {
            var hourEnd = hour.AddHours(1);
            if (isToday && hour <= TimeOnly.FromDateTime(now)) continue;

            var eligible = courts.Where(c =>
                c.IsOpenDuring(hour, hourEnd) &&
                !bookedSet.Contains((c.Id, hour)) &&
                !closures.Any(r => (r.CourtId == null || r.CourtId == c.Id) && r.AppliesTo(date, hour, hourEnd)))
                .ToList();

            if (eligible.Count == 0) continue;

            var estimatedPrice = eligible.Min(c => PricingCalculator.PricePerHourFor(c, 1));
            result.Add(new AvailableHourDto(date, hour, hourEnd, estimatedPrice));
        }

        return result;
    }
}
