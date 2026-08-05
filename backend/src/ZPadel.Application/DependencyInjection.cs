using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ZPadel.Application.Services.Admin;
using ZPadel.Application.Services.Availability;
using ZPadel.Application.Services.Bookings;

namespace ZPadel.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining(typeof(DependencyInjection));

        services.AddScoped<IAvailabilityService, AvailabilityService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IAdminCourtService, AdminCourtService>();
        services.AddScoped<IAdminClosureService, AdminClosureService>();
        services.AddScoped<IAdminBookingService, AdminBookingService>();
        services.AddScoped<IAdminAuthService, AdminAuthService>();

        return services;
    }
}
