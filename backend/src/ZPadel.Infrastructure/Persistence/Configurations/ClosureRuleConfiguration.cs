using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ZPadel.Domain.Entities;

namespace ZPadel.Infrastructure.Persistence.Configurations;

public class ClosureRuleConfiguration : IEntityTypeConfiguration<ClosureRule>
{
    public void Configure(EntityTypeBuilder<ClosureRule> builder)
    {
        builder.ToTable("ClosureRules");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Reason).HasMaxLength(300);
        builder.HasIndex(r => new { r.StartDate, r.EndDate });
    }
}
