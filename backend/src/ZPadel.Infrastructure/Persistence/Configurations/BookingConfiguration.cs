using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Reference).IsRequired().HasMaxLength(20);
        builder.HasIndex(b => b.Reference).IsUnique();
        builder.Property(b => b.GuestPhone).IsRequired().HasMaxLength(20);
        builder.HasIndex(b => b.GuestPhone);
        builder.Property(b => b.GuestName).HasMaxLength(100);
        builder.Property(b => b.GuestEmail).HasMaxLength(200);
        builder.Property(b => b.TotalAmount).HasColumnType("decimal(10,3)");
        builder.Property(b => b.ThawaniSessionId).HasMaxLength(100);
        builder.HasIndex(b => b.ThawaniSessionId);
        builder.HasIndex(b => new { b.Status, b.ExpiresAt });

        builder.HasMany(b => b.Slots)
            .WithOne(s => s.Booking)
            .HasForeignKey(s => s.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
