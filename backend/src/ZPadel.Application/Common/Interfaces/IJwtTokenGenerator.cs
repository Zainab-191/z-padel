using ZPadel.Domain.Entities;

namespace ZPadel.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(AdminUser admin);
}
