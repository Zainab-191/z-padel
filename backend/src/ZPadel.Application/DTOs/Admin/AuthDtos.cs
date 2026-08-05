namespace ZPadel.Application.DTOs.Admin;

public record LoginRequestDto(string Username, string Password);

public record LoginResponseDto(string Token, DateTime ExpiresAtUtc, string Username);
