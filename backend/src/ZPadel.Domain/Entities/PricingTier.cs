using ZPadel.Domain.Common;

namespace ZPadel.Domain.Entities;

/// <summary>Tiered price per hour once the whole booking request reaches MinHours (e.g. 1h=10, 2h+=8).</summary>
public class PricingTier : BaseEntity
{
    public Guid CourtId { get; set; }
    public Court? Court { get; set; }
    public int MinHours { get; set; }
    public decimal PricePerHour { get; set; }
}
