namespace ZPadel.Application.Common.Interfaces;

public record ThawaniCheckoutSession(string SessionId, string CheckoutUrl);

public record ThawaniPaymentStatus(bool IsPaid, decimal PaidAmount, string RawStatus);

public interface IThawaniPaymentService
{
    Task<ThawaniCheckoutSession> CreateCheckoutSessionAsync(
        string bookingReference, decimal amount, string successUrl, string cancelUrl, CancellationToken ct = default);

    Task<ThawaniPaymentStatus> GetSessionPaymentStatusAsync(string sessionId, CancellationToken ct = default);
}
