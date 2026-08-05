namespace ZPadel.Application.DTOs.Admin;

public record ClosureRuleDto(
    Guid Id,
    Guid? CourtId,
    string? CourtName,
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    string? Reason);

/// <summary>CourtIds null/empty = close ALL courts. Multiple ids = close each of those courts.</summary>
public record CreateClosureRuleDto(
    List<Guid>? CourtIds,
    DateOnly StartDate,
    DateOnly EndDate,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    string? Reason);
