using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ZPadel.Application.Common.Interfaces;

namespace ZPadel.Infrastructure.Payments;

public class ThawaniPaymentService : IThawaniPaymentService
{
    private readonly HttpClient _http;
    private readonly ThawaniSettings _settings;
    private readonly ILogger<ThawaniPaymentService> _logger;

    public ThawaniPaymentService(HttpClient http, IOptions<ThawaniSettings> settings, ILogger<ThawaniPaymentService> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;

        _http.BaseAddress = new Uri(_settings.ApiBaseUrl);
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        if (!string.IsNullOrWhiteSpace(_settings.SecretKey))
            _http.DefaultRequestHeaders.Add("thawani-api-key", _settings.SecretKey);
    }

    public async Task<ThawaniCheckoutSession> CreateCheckoutSessionAsync(
        string bookingReference, decimal amount, string successUrl, string cancelUrl, CancellationToken ct = default)
    {
        var request = new CreateSessionRequest(
            ClientReferenceId: bookingReference,
            Mode: "payment",
            Products: new[] { new Product(_settings.ProductName, 1, ToBaisa(amount)) },
            SuccessUrl: successUrl,
            CancelUrl: cancelUrl);

        var response = await _http.PostAsJsonAsync("checkout/session", request, ct);
        var body = await response.Content.ReadFromJsonAsync<ThawaniEnvelope<SessionData>>(cancellationToken: ct);

        if (!response.IsSuccessStatusCode || body?.Data is null)
        {
            _logger.LogError("Thawani session creation failed for booking {Reference}: {Status}", bookingReference, response.StatusCode);
            throw new InvalidOperationException("Failed to create Thawani checkout session.");
        }

        var checkoutUrl = $"{_settings.CheckoutBaseUrl}/{body.Data.SessionId}?key={_settings.PublishableKey}";
        return new ThawaniCheckoutSession(body.Data.SessionId, checkoutUrl);
    }

    public async Task<ThawaniPaymentStatus> GetSessionPaymentStatusAsync(string sessionId, CancellationToken ct = default)
    {
        var response = await _http.GetAsync($"checkout/session/{sessionId}", ct);
        var body = await response.Content.ReadFromJsonAsync<ThawaniEnvelope<SessionData>>(cancellationToken: ct);

        if (!response.IsSuccessStatusCode || body?.Data is null)
        {
            _logger.LogError("Thawani session lookup failed for session {SessionId}: {Status}", sessionId, response.StatusCode);
            return new ThawaniPaymentStatus(false, 0, "lookup_failed");
        }

        var isPaid = string.Equals(body.Data.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase);
        return new ThawaniPaymentStatus(isPaid, FromBaisa(body.Data.TotalAmount), body.Data.PaymentStatus);
    }

    private static long ToBaisa(decimal omr) => (long)Math.Round(omr * 1000m, MidpointRounding.AwayFromZero);
    private static decimal FromBaisa(long baisa) => baisa / 1000m;

    private record CreateSessionRequest(
        [property: JsonPropertyName("client_reference_id")] string ClientReferenceId,
        [property: JsonPropertyName("mode")] string Mode,
        [property: JsonPropertyName("products")] Product[] Products,
        [property: JsonPropertyName("success_url")] string SuccessUrl,
        [property: JsonPropertyName("cancel_url")] string CancelUrl);

    private record Product(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("quantity")] int Quantity,
        [property: JsonPropertyName("unit_amount")] long UnitAmount);

    private record ThawaniEnvelope<T>(
        [property: JsonPropertyName("success")] bool Success,
        [property: JsonPropertyName("code")] int Code,
        [property: JsonPropertyName("description")] string? Description,
        [property: JsonPropertyName("data")] T? Data);

    private record SessionData(
        [property: JsonPropertyName("session_id")] string SessionId,
        [property: JsonPropertyName("payment_status")] string PaymentStatus,
        [property: JsonPropertyName("total_amount")] long TotalAmount);
}
