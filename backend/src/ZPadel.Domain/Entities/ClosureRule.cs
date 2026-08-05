using ZPadel.Domain.Common;

namespace ZPadel.Domain.Entities;

/// <summary>Closes one court (CourtId set) or all courts (CourtId null) for a date range, optionally a partial-day time window.</summary>
public class ClosureRule : BaseEntity
{
    public Guid? CourtId { get; set; }
    public Court? Court { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Reason { get; set; }

    public bool AppliesTo(DateOnly date, TimeOnly hourStart, TimeOnly hourEnd)
    {
        if (date < StartDate || date > EndDate) return false;
        if (StartTime is null || EndTime is null) return true;
        return hourStart < EndTime.Value && hourEnd > StartTime.Value;
    }
}
