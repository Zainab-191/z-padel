namespace ZPadel.Application.DTOs.Availability;

/// <summary>Aggregated view — deliberately has no court id/name. Available means >=1 court is free at this hour.</summary>
public record AvailableHourDto(DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, decimal EstimatedPricePerHour);
