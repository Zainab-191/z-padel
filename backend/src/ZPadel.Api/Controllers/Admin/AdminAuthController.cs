using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ZPadel.Application.DTOs.Admin;
using ZPadel.Application.Services.Admin;

namespace ZPadel.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/auth")]
[EnableRateLimiting("login")]
public class AdminAuthController : ControllerBase
{
    private readonly IAdminAuthService _authService;

    public AdminAuthController(IAdminAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, ct);
        return Ok(result);
    }
}
