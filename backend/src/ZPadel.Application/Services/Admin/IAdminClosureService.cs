using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Services.Admin;

public interface IAdminClosureService
{
    Task<List<ClosureRuleDto>> GetAllAsync(CancellationToken ct = default);
    Task<List<ClosureRuleDto>> CreateAsync(CreateClosureRuleDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
