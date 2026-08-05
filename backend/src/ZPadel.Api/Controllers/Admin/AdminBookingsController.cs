using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Application.Services.Admin;
using ZPadel.Domain.Enums;

namespace ZPadel.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/bookings")]
[Authorize]
public class AdminBookingsController : ControllerBase
{
    private readonly IAdminBookingService _bookings;

    public AdminBookingsController(IAdminBookingService bookings)
    {
        _bookings = bookings;
    }

    [HttpGet]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] Guid? courtId,
        [FromQuery] DateOnly? date,
        [FromQuery] BookingStatus? status,
        [FromQuery] PaymentMethod? paymentMethod,
        [FromQuery] string? phone,
        CancellationToken ct)
    {
        var filter = new AdminBookingFilterDto(courtId, date, status, paymentMethod, phone);
        return Ok(await _bookings.GetFilteredAsync(filter, ct));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _bookings.CancelAsync(id, ct);
        return NoContent();
    }
}
