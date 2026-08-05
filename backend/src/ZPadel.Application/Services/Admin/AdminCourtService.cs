using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ZPadel.Application.Common.Exceptions;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Domain.Entities;

namespace ZPadel.Application.Services.Admin;

public class AdminCourtService : IAdminCourtService
{
    private readonly IApplicationDbContext _db;
    private readonly ILogger<AdminCourtService> _logger;

    public AdminCourtService(IApplicationDbContext db, ILogger<AdminCourtService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<CourtDto>> GetAllAsync(CancellationToken ct = default)
    {
        var courts = await _db.Courts.Include(c => c.PricingTiers).AsNoTracking()
            .OrderBy(c => c.Name).ToListAsync(ct);
        return courts.Select(ToDto).ToList();
    }

    public async Task<CourtDto> CreateAsync(CreateCourtDto dto, CancellationToken ct = default)
    {
        if (dto.ClosingTime <= dto.OpeningTime)
            throw new BadRequestException("Closing time must be after opening time.");

        var court = new Court
        {
            Name = dto.Name,
            Description = dto.Description,
            OpeningTime = dto.OpeningTime,
            ClosingTime = dto.ClosingTime,
            BasePricePerHour = dto.BasePricePerHour,
            IsActive = true
        };
        _db.Courts.Add(court);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin created court {CourtId} ({Name})", court.Id, court.Name);
        return ToDto(court);
    }

    public async Task<CourtDto> UpdateAsync(Guid id, UpdateCourtDto dto, CancellationToken ct = default)
    {
        if (dto.ClosingTime <= dto.OpeningTime)
            throw new BadRequestException("Closing time must be after opening time.");

        var court = await _db.Courts.Include(c => c.PricingTiers).FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Court", id);

        court.Name = dto.Name;
        court.Description = dto.Description;
        court.OpeningTime = dto.OpeningTime;
        court.ClosingTime = dto.ClosingTime;
        court.BasePricePerHour = dto.BasePricePerHour;
        court.IsActive = dto.IsActive;

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin updated court {CourtId}", court.Id);
        return ToDto(court);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var court = await _db.Courts.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Court", id);

        var hasHistory = await _db.BookingSlots.AnyAsync(s => s.CourtId == id, ct);
        if (hasHistory)
            throw new ConflictException("This court has booking history and cannot be deleted. Deactivate it instead.");

        _db.Courts.Remove(court);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin deleted court {CourtId}", id);
    }

    public async Task<CourtDto> SetPricingTiersAsync(Guid id, SetPricingTiersDto dto, CancellationToken ct = default)
    {
        var court = await _db.Courts.Include(c => c.PricingTiers).FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Court", id);

        if (dto.Tiers.Select(t => t.MinHours).Distinct().Count() != dto.Tiers.Count)
            throw new BadRequestException("Pricing tiers must have distinct MinHours values.");
        if (dto.Tiers.Any(t => t.MinHours < 1 || t.PricePerHour <= 0))
            throw new BadRequestException("MinHours must be >= 1 and PricePerHour must be > 0.");

        _db.PricingTiers.RemoveRange(court.PricingTiers);
        foreach (var t in dto.Tiers)
            _db.PricingTiers.Add(new PricingTier { CourtId = court.Id, MinHours = t.MinHours, PricePerHour = t.PricePerHour });

        await _db.SaveChangesAsync(ct);

        var refreshed = await _db.Courts.Include(c => c.PricingTiers).AsNoTracking().FirstAsync(c => c.Id == id, ct);
        return ToDto(refreshed);
    }

    private static CourtDto ToDto(Court c) => new(
        c.Id, c.Name, c.Description, c.OpeningTime, c.ClosingTime, c.BasePricePerHour, c.IsActive,
        c.PricingTiers.OrderBy(t => t.MinHours).Select(t => new PricingTierDto(t.Id, t.MinHours, t.PricePerHour)).ToList());
}
