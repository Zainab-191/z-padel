using ZPadel.Domain.Common;

namespace ZPadel.Domain.Entities;

/// <summary>One booked hour on one physical court. Unique (CourtId, Date, StartTime) at the DB level is the real double-booking guard.</summary>
public class BookingSlot : BaseEntity
{
    public Guid BookingId { get; set; }
    public Booking? Booking { get; set; }
    public Guid CourtId { get; set; }
    public Court? Court { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public decimal Price { get; set; }

    /// <summary>Set when this specific hour is freed back up (cancelled/expired/payment failed). The DB
    /// unique index is filtered on this being null, so a released slot never blocks re-booking that
    /// hour — while the row itself survives for admin history/reporting.</summary>
    public DateTime? ReleasedAt { get; set; }
}
