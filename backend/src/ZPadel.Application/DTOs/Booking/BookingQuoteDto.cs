namespace ZPadel.Application.DTOs.Booking;

public record BookingQuoteRequestDto(List<BookingSlotRequestDto> Slots);

public record BookingQuoteResponseDto(decimal EstimatedTotal, List<BookingSlotSummaryDto> Slots);
