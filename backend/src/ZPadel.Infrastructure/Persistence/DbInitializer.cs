using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence;

public static class DbInitializer
{
    public const string DefaultAdminUsername = "admin";
    public const string DefaultAdminPassword = "ZPadel@Admin123";

    public static async Task SeedAsync(ApplicationDbContext db, IPasswordHasher hasher, ILogger logger)
    {
        await db.Database.MigrateAsync();

        if (!await db.AdminUsers.AnyAsync())
        {
            db.AdminUsers.Add(new AdminUser
            {
                Username = DefaultAdminUsername,
                PasswordHash = hasher.Hash(DefaultAdminPassword)
            });
            logger.LogInformation("Seeded default admin user '{Username}'", DefaultAdminUsername);
        }

        if (!await db.Courts.AnyAsync())
        {
            var courts = new[]
            {
                new Court { Name = "ملعب 1", OpeningTime = new TimeOnly(8, 0), ClosingTime = new TimeOnly(23, 0), BasePricePerHour = 10m },
                new Court { Name = "ملعب 2", OpeningTime = new TimeOnly(8, 0), ClosingTime = new TimeOnly(23, 0), BasePricePerHour = 10m },
                new Court { Name = "ملعب 3", OpeningTime = new TimeOnly(8, 0), ClosingTime = new TimeOnly(23, 0), BasePricePerHour = 10m }
            };
            db.Courts.AddRange(courts);
            await db.SaveChangesAsync();

            foreach (var court in courts)
            {
                db.PricingTiers.AddRange(
                    new PricingTier { CourtId = court.Id, MinHours = 1, PricePerHour = 10m },
                    new PricingTier { CourtId = court.Id, MinHours = 2, PricePerHour = 8m });
            }
            logger.LogInformation("Seeded {Count} sample courts with tiered pricing", courts.Length);
        }

        await db.SaveChangesAsync();
    }
}
