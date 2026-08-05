namespace ZPadel.Application.DTOs.Booking;

/// <summary>No CourtId/CourtName here on purpose — never leak the assigned court to the guest.</summary>
public record BookingSlotSummaryDto(DateOnly Date, TimeOnly StartTime, TimeOnly EndTime, decimal Price);
