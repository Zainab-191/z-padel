using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage;
using ZPadel.Domain.Entities;

namespace ZPadel.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Court> Courts { get; }
    DbSet<PricingTier> PricingTiers { get; }
    DbSet<ClosureRule> ClosureRules { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<BookingSlot> BookingSlots { get; }
    DbSet<AdminUser> AdminUsers { get; }
    ChangeTracker ChangeTracker { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}
