using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence.Configurations;

public class CourtConfiguration : IEntityTypeConfiguration<Court>
{
    public void Configure(EntityTypeBuilder<Court> builder)
    {
        builder.ToTable("Courts");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.BasePricePerHour).HasColumnType("decimal(10,3)");

        builder.HasMany(c => c.PricingTiers)
            .WithOne(t => t.Court)
            .HasForeignKey(t => t.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.ClosureRules)
            .WithOne(r => r.Court)
            .HasForeignKey(r => r.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.BookingSlots)
            .WithOne(s => s.Court)
            .HasForeignKey(s => s.CourtId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
