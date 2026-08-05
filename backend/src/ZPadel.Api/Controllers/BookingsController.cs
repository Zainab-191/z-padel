using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ZPadel.Api.Settings;
using ZPadel.Application.DTOs.Booking;
using ZPadel.Application.Services.Bookings;

namespace ZPadel.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookings;
    private readonly AppUrlSettings _urls;

    public BookingsController(IBookingService bookings, IOptions<AppUrlSettings> urls)
    {
        _bookings = bookings;
        _urls = urls.Value;
    }

    [HttpPost("quote")]
    [EnableRateLimiting("booking")]
    public async Task<IActionResult> Quote([FromBody] BookingQuoteRequestDto request, CancellationToken ct)
    {
        var result = await _bookings.QuoteAsync(request, ct);
        return Ok(result);
    }

    /// <summary>The only place a court is ever assigned — randomly, and only once payment method/details are confirmed.</summary>
    [HttpPost]
    [EnableRateLimiting("booking")]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequestDto request, CancellationToken ct)
    {
        var result = await _bookings.CreateBookingAsync(request, ct);
        return CreatedAtAction(nameof(GetByReference), new { reference = result.Reference }, result);
    }

    [HttpGet("{reference}")]
    public async Task<IActionResult> GetByReference(string reference, CancellationToken ct)
    {
        var result = await _bookings.GetByReferenceAsync(reference, ct);
        return Ok(result);
    }

    [HttpPost("{reference}/pay/thawani")]
    [EnableRateLimiting("booking")]
    public async Task<IActionResult> InitiateThawaniPayment(string reference, CancellationToken ct)
    {
        var successUrl = $"{_urls.CustomerWebBaseUrl}/booking/{reference}/success";
        var cancelUrl = $"{_urls.CustomerWebBaseUrl}/booking/{reference}/cancelled";
        var result = await _bookings.InitiateThawaniPaymentAsync(reference, successUrl, cancelUrl, ct);
        return Ok(result);
    }

    /// <summary>Called by the customer-web "success" return page. Re-verifies the payment with Thawani
    /// server-side (never trusts the redirect alone) — the same check the webhook performs, exposed here
    /// too since a real Thawani webhook needs a public callback URL a local dev/eval setup won't have.</summary>
    [HttpPost("{reference}/confirm-thawani-payment")]
    public async Task<IActionResult> ConfirmThawaniPayment(string reference, CancellationToken ct)
    {
        var result = await _bookings.ConfirmThawaniPaymentAsync(reference, ct);
        return Ok(result);
    }
}
