using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence.Configurations;

public class PricingTierConfiguration : IEntityTypeConfiguration<PricingTier>
{
    public void Configure(EntityTypeBuilder<PricingTier> builder)
    {
        builder.ToTable("PricingTiers");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.PricePerHour).HasColumnType("decimal(10,3)");
        builder.HasIndex(t => new { t.CourtId, t.MinHours }).IsUnique();
    }
}
