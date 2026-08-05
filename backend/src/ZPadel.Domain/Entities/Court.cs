using ZPadel.Domain.Common;

namespace ZPadel.Domain.Entities;

public class Court : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TimeOnly OpeningTime { get; set; }
    public TimeOnly ClosingTime { get; set; }
    public decimal BasePricePerHour { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<PricingTier> PricingTiers { get; set; } = new List<PricingTier>();
    public ICollection<ClosureRule> ClosureRules { get; set; } = new List<ClosureRule>();
    public ICollection<BookingSlot> BookingSlots { get; set; } = new List<BookingSlot>();

    public bool IsOpenDuring(TimeOnly start, TimeOnly end) => start >= OpeningTime && end <= ClosingTime;
}
