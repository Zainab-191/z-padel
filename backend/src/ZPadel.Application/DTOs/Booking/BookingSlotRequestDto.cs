namespace ZPadel.Application.DTOs.Booking;

public record BookingSlotRequestDto(DateOnly Date, TimeOnly StartTime);
