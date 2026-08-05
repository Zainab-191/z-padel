using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Application.Services.Admin;

namespace ZPadel.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/courts")]
[Authorize]
public class AdminCourtsController : ControllerBase
{
    private readonly IAdminCourtService _courts;

    public AdminCourtsController(IAdminCourtService courts)
    {
        _courts = courts;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) => Ok(await _courts.GetAllAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourtDto dto, CancellationToken ct)
    {
        var result = await _courts.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourtDto dto, CancellationToken ct) =>
        Ok(await _courts.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _courts.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/pricing-tiers")]
    public async Task<IActionResult> SetPricingTiers(Guid id, [FromBody] SetPricingTiersDto dto, CancellationToken ct) =>
        Ok(await _courts.SetPricingTiersAsync(id, dto, ct));
}
