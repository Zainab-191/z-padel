using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ZPadel.Application.Services.Bookings;

namespace ZPadel.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IBookingService _bookings;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IBookingService bookings, ILogger<PaymentsController> logger)
    {
        _bookings = bookings;
        _logger = logger;
    }

    /// <summary>Thawani webhook target. The payload only tells us which session to look at — we never
    /// trust its claimed status, we always call back into Thawani to verify the real paid amount
    /// (see BookingService.ConfirmThawaniPaymentAsync/VerifyAndFinalizeThawaniPaymentAsync).</summary>
    [HttpPost("thawani/webhook")]
    public async Task<IActionResult> ThawaniWebhook([FromQuery] string? sessionId, CancellationToken ct)
    {
        var resolvedSessionId = sessionId;

        if (string.IsNullOrEmpty(resolvedSessionId) && Request.ContentLength > 0)
        {
            using var reader = new StreamReader(Request.Body);
            var raw = await reader.ReadToEndAsync(ct);
            resolvedSessionId = TryExtractSessionId(raw);
        }

        if (string.IsNullOrEmpty(resolvedSessionId))
        {
            _logger.LogWarning("Thawani webhook received with no resolvable session id");
            return Ok();
        }

        await _bookings.HandleThawaniWebhookAsync(resolvedSessionId, ct);
        return Ok();
    }

    private static string? TryExtractSessionId(string rawJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawJson);
            var root = doc.RootElement;

            if (root.TryGetProperty("session_id", out var direct)) return direct.GetString();
            if (root.TryGetProperty("data", out var data) && data.TryGetProperty("session_id", out var nested)) return nested.GetString();
            return null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
