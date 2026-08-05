using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Services.Admin;

public interface IAdminAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
}
