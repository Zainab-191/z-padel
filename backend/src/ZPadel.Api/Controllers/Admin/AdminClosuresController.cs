using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Application.Services.Admin;

namespace ZPadel.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/closures")]
[Authorize]
public class AdminClosuresController : ControllerBase
{
    private readonly IAdminClosureService _closures;

    public AdminClosuresController(IAdminClosureService closures)
    {
        _closures = closures;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) => Ok(await _closures.GetAllAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClosureRuleDto dto, CancellationToken ct)
    {
        var result = await _closures.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _closures.DeleteAsync(id, ct);
        return NoContent();
    }
}
