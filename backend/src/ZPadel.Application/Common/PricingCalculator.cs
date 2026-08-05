using ZPadel.Domain.Entities;

namespace ZPadel.Application.Common;

public static class PricingCalculator
{
    /// <summary>Price per hour for this court once the whole request totals <paramref name="totalHours"/> hours.
    /// Picks the highest-MinHours tier the request qualifies for; falls back to the court's base price.</summary>
    public static decimal PricePerHourFor(Court court, int totalHours)
    {
        var tier = court.PricingTiers
            .Where(t => t.MinHours <= totalHours)
            .OrderByDescending(t => t.MinHours)
            .FirstOrDefault();

        return tier?.PricePerHour ?? court.BasePricePerHour;
    }
}
