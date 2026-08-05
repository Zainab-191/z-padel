using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence.Configurations;

public class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> builder)
    {
        builder.ToTable("AdminUsers");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Username).IsRequired().HasMaxLength(50);
        builder.HasIndex(a => a.Username).IsUnique();
        builder.Property(a => a.PasswordHash).IsRequired().HasMaxLength(200);
    }
}
