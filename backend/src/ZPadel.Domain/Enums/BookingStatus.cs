namespace ZPadel.Domain.Enums;

public enum BookingStatus
{
    PendingPayment = 0,
    Confirmed = 1,
    CancelledByAdmin = 2,
    Expired = 3,
    PaymentFailed = 4
}
