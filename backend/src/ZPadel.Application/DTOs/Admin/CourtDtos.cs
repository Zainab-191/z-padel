namespace ZPadel.Application.DTOs.Admin;

public record PricingTierDto(Guid? Id, int MinHours, decimal PricePerHour);

public record CourtDto(
    Guid Id,
    string Name,
    string? Description,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    decimal BasePricePerHour,
    bool IsActive,
    List<PricingTierDto> PricingTiers);

public record CreateCourtDto(
    string Name,
    string? Description,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    decimal BasePricePerHour);

public record UpdateCourtDto(
    string Name,
    string? Description,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    decimal BasePricePerHour,
    bool IsActive);

public record SetPricingTiersDto(List<PricingTierDto> Tiers);
