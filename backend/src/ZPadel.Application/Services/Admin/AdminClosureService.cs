using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ZPadel.Application.Common.Exceptions;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Domain.Entities;

namespace ZPadel.Application.Services.Admin;

public class AdminClosureService : IAdminClosureService
{
    private readonly IApplicationDbContext _db;
    private readonly ILogger<AdminClosureService> _logger;

    public AdminClosureService(IApplicationDbContext db, ILogger<AdminClosureService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<ClosureRuleDto>> GetAllAsync(CancellationToken ct = default)
    {
        var rules = await _db.ClosureRules.Include(r => r.Court).AsNoTracking()
            .OrderByDescending(r => r.StartDate).ToListAsync(ct);
        return rules.Select(ToDto).ToList();
    }

    public async Task<List<ClosureRuleDto>> CreateAsync(CreateClosureRuleDto dto, CancellationToken ct = default)
    {
        if (dto.EndDate < dto.StartDate)
            throw new BadRequestException("End date must not be before the start date.");
        if ((dto.StartTime is null) != (dto.EndTime is null))
            throw new BadRequestException("Provide both a start and end time for a partial-day closure, or neither for a full-day closure.");
        if (dto.StartTime is not null && dto.EndTime is not null && dto.EndTime <= dto.StartTime)
            throw new BadRequestException("Closure end time must be after start time.");

        var created = new List<ClosureRule>();

        if (dto.CourtIds is null || dto.CourtIds.Count == 0)
        {
            created.Add(new ClosureRule
            {
                CourtId = null,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Reason = dto.Reason
            });
        }
        else
        {
            var existingIds = await _db.Courts.Where(c => dto.CourtIds.Contains(c.Id)).Select(c => c.Id).ToListAsync(ct);
            var missing = dto.CourtIds.Except(existingIds).ToList();
            if (missing.Count > 0)
                throw new NotFoundException($"Court(s) not found: {string.Join(", ", missing)}");

            foreach (var courtId in dto.CourtIds)
            {
                created.Add(new ClosureRule
                {
                    CourtId = courtId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    Reason = dto.Reason
                });
            }
        }

        _db.ClosureRules.AddRange(created);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin created {Count} closure rule(s) from {Start} to {End}", created.Count, dto.StartDate, dto.EndDate);

        var courtNames = await _db.Courts.AsNoTracking().ToDictionaryAsync(c => c.Id, c => c.Name, ct);
        return created.Select(r => ToDto(r, courtNames)).ToList();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var rule = await _db.ClosureRules.FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new NotFoundException("Closure rule", id);
        _db.ClosureRules.Remove(rule);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Admin removed closure rule {Id}", id);
    }

    private static ClosureRuleDto ToDto(ClosureRule r) =>
        new(r.Id, r.CourtId, r.Court?.Name, r.StartDate, r.EndDate, r.StartTime, r.EndTime, r.Reason);

    private static ClosureRuleDto ToDto(ClosureRule r, Dictionary<Guid, string> courtNames) =>
        new(r.Id, r.CourtId, r.CourtId != null && courtNames.TryGetValue(r.CourtId.Value, out var n) ? n : null,
            r.StartDate, r.EndDate, r.StartTime, r.EndTime, r.Reason);
}
