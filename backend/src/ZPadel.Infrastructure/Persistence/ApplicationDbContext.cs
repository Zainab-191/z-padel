using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ZPadel.Application.Common.Interfaces;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Court> Courts { get; set; } = default!;
    public DbSet<PricingTier> PricingTiers { get; set; } = default!;
    public DbSet<ClosureRule> ClosureRules { get; set; } = default!;
    public DbSet<Booking> Bookings { get; set; } = default!;
    public DbSet<BookingSlot> BookingSlots { get; set; } = default!;
    public DbSet<AdminUser> AdminUsers { get; set; } = default!;

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        Database.BeginTransactionAsync(cancellationToken);

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(builder);
    }
}
