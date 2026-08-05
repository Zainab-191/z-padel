using FluentValidation;
using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Validators;

public class CreateCourtValidator : AbstractValidator<CreateCourtDto>
{
    public CreateCourtValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BasePricePerHour).GreaterThan(0);
        RuleFor(x => x.ClosingTime).GreaterThan(x => x.OpeningTime).WithMessage("Closing time must be after opening time.");
    }
}

public class UpdateCourtValidator : AbstractValidator<UpdateCourtDto>
{
    public UpdateCourtValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BasePricePerHour).GreaterThan(0);
        RuleFor(x => x.ClosingTime).GreaterThan(x => x.OpeningTime).WithMessage("Closing time must be after opening time.");
    }
}

public class SetPricingTiersValidator : AbstractValidator<SetPricingTiersDto>
{
    public SetPricingTiersValidator()
    {
        RuleForEach(x => x.Tiers).ChildRules(tier =>
        {
            tier.RuleFor(t => t.MinHours).GreaterThanOrEqualTo(1);
            tier.RuleFor(t => t.PricePerHour).GreaterThan(0);
        });
    }
}
