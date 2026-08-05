namespace ZPadel.Application.Common;

public static class BookingRules
{
    public const int MaxHoursPerRequest = 12;
    public const int MaxAdvanceDays = 60;
    public const int MaxAvailabilityRangeDays = 31;
    public const int PendingPaymentExpiryMinutes = 10;
}
