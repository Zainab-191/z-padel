using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ZPadel.Application.Common.Exceptions;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Services.Admin;

public class AdminAuthService : IAdminAuthService
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenGenerator _jwt;
    private readonly ILogger<AdminAuthService> _logger;

    public AdminAuthService(IApplicationDbContext db, IPasswordHasher hasher, IJwtTokenGenerator jwt, ILogger<AdminAuthService> logger)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Username == request.Username, ct);

        if (admin is null || !_hasher.Verify(request.Password, admin.PasswordHash))
        {
            _logger.LogWarning("Failed admin login attempt for username {Username}", request.Username);
            throw new UnauthorizedAppException("Invalid username or password.");
        }

        var (token, expiresAt) = _jwt.GenerateToken(admin);
        _logger.LogInformation("Admin {Username} logged in", admin.Username);
        return new LoginResponseDto(token, expiresAt, admin.Username);
    }
}
