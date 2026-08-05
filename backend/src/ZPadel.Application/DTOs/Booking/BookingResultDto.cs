using ZPadel.Domain.Enums;

namespace ZPadel.Application.DTOs.Booking;

public record BookingResultDto(
    string Reference,
    BookingStatus Status,
    PaymentMethod PaymentMethod,
    decimal TotalAmount,
    DateTime? ExpiresAt,
    List<BookingSlotSummaryDto> Slots);
