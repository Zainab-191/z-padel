using ZPadel.Domain.Enums;

namespace ZPadel.Application.DTOs.Admin;

/// <summary>One row per booked hour — admin is allowed to see the court, unlike the guest-facing DTOs.</summary>
public record AdminBookingSlotRowDto(
    Guid BookingId,
    string Reference,
    Guid CourtId,
    string CourtName,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    decimal Price,
    BookingStatus Status,
    PaymentMethod PaymentMethod,
    string GuestPhone,
    string? GuestName,
    DateTime CreatedAt);

public record AdminBookingFilterDto(
    Guid? CourtId,
    DateOnly? Date,
    BookingStatus? Status,
    PaymentMethod? PaymentMethod,
    string? Phone);
