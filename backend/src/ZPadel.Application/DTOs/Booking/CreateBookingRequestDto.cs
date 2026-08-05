using ZPadel.Domain.Enums;

namespace ZPadel.Application.DTOs.Booking;

public record CreateBookingRequestDto(
    string GuestPhone,
    string? GuestName,
    string? GuestEmail,
    PaymentMethod PaymentMethod,
    List<BookingSlotRequestDto> Slots);
