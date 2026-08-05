using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Services.Admin;

public interface IAdminCourtService
{
    Task<List<CourtDto>> GetAllAsync(CancellationToken ct = default);
    Task<CourtDto> CreateAsync(CreateCourtDto dto, CancellationToken ct = default);
    Task<CourtDto> UpdateAsync(Guid id, UpdateCourtDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<CourtDto> SetPricingTiersAsync(Guid id, SetPricingTiersDto dto, CancellationToken ct = default);
}
