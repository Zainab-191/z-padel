using ZPadel.Application.Services.Bookings;

namespace ZPadel.Api.BackgroundServices;

/// <summary>Sweeps every minute for PendingPayment bookings whose 10-minute window has lapsed and
/// hard-deletes them (booking + slots), so an abandoned online-payment attempt doesn't hold a court
/// hostage forever.</summary>
public class PendingBookingExpiryService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PendingBookingExpiryService> _logger;

    public PendingBookingExpiryService(IServiceScopeFactory scopeFactory, ILogger<PendingBookingExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var bookingService = scope.ServiceProvider.GetRequiredService<IBookingService>();
                var count = await bookingService.ExpireStaleBookingsAsync(stoppingToken);
                if (count > 0)
                    _logger.LogInformation("Pending-booking sweep released {Count} expired booking(s)", count);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Pending-booking expiry sweep failed");
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
