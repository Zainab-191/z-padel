using ZPadel.Domain.Common;
using ZPadel.Domain.Enums;

namespace ZPadel.Domain.Entities;

public class Booking : BaseEntity
{
    public string Reference { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public string? ThawaniSessionId { get; set; }
    public DateTime? CancelledAt { get; set; }

    public ICollection<BookingSlot> Slots { get; set; } = new List<BookingSlot>();
}
