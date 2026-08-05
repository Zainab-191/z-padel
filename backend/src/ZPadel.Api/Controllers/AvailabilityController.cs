using Microsoft.AspNetCore.Mvc;
using ZPadel.Application.Services.Availability;

namespace ZPadel.Api.Controllers;

[ApiController]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availability;

    public AvailabilityController(IAvailabilityService availability)
    {
        _availability = availability;
    }

    /// <summary>Aggregated available hours for one date. Never returns which court is behind a slot.</summary>
    [HttpGet]
    public async Task<IActionResult> GetForDate([FromQuery] DateOnly date, CancellationToken ct)
    {
        var result = await _availability.GetAvailabilityForDateAsync(date, ct);
        return Ok(result);
    }

    [HttpGet("range")]
    public async Task<IActionResult> GetForRange([FromQuery] DateOnly from, [FromQuery] DateOnly to, CancellationToken ct)
    {
        var result = await _availability.GetAvailabilityForRangeAsync(from, to, ct);
        return Ok(result);
    }
}
