using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Services.Admin;

public interface IAdminBookingService
{
    Task<List<AdminBookingSlotRowDto>> GetFilteredAsync(AdminBookingFilterDto filter, CancellationToken ct = default);
    Task CancelAsync(Guid bookingId, CancellationToken ct = default);
}
