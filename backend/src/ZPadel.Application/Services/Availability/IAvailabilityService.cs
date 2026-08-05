using ZPadel.Application.DTOs.Availability;

namespace ZPadel.Application.Services.Availability;

public interface IAvailabilityService
{
    Task<List<AvailableHourDto>> GetAvailabilityForDateAsync(DateOnly date, CancellationToken ct = default);
    Task<List<AvailableHourDto>> GetAvailabilityForRangeAsync(DateOnly from, DateOnly to, CancellationToken ct = default);
}
