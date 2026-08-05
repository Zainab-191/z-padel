using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence.Configurations;

public class BookingSlotConfiguration : IEntityTypeConfiguration<BookingSlot>
{
    public void Configure(EntityTypeBuilder<BookingSlot> builder)
    {
        builder.ToTable("BookingSlots");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Price).HasColumnType("decimal(10,3)");

        // The real guard against double-booking a court's hour — enforced by the database itself,
        // not just application logic. Insert races are caught and retried in BookingService.
        // Filtered on ReleasedAt IS NULL so a cancelled/expired slot frees the hour back up while
        // the row itself survives for admin history (see BookingSlot.ReleasedAt).
        builder.HasIndex(s => new { s.CourtId, s.Date, s.StartTime })
            .IsUnique()
            .HasFilter("[ReleasedAt] IS NULL")
            .HasDatabaseName("UQ_BookingSlots_Court_Date_StartTime");

        builder.HasIndex(s => new { s.Date, s.CourtId });
    }
}
