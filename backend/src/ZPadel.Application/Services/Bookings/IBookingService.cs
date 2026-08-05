using ZPadel.Application.DTOs.Booking;

namespace ZPadel.Application.Services.Bookings;

public interface IBookingService
{
    Task<BookingQuoteResponseDto> QuoteAsync(BookingQuoteRequestDto request, CancellationToken ct = default);
    Task<BookingResultDto> CreateBookingAsync(CreateBookingRequestDto request, CancellationToken ct = default);
    Task<BookingResultDto> GetByReferenceAsync(string reference, CancellationToken ct = default);
    Task<ThawaniPaymentInitDto> InitiateThawaniPaymentAsync(string reference, string successUrl, string cancelUrl, CancellationToken ct = default);
    Task HandleThawaniWebhookAsync(string sessionId, CancellationToken ct = default);
    Task<BookingResultDto> ConfirmThawaniPaymentAsync(string reference, CancellationToken ct = default);
    Task<int> ExpireStaleBookingsAsync(CancellationToken ct = default);
}
