using FluentValidation;
using ZPadel.Application.DTOs.Admin;

namespace ZPadel.Application.Validators;

public class CreateClosureRuleValidator : AbstractValidator<CreateClosureRuleDto>
{
    public CreateClosureRuleValidator()
    {
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate);
        RuleFor(x => x.Reason).MaximumLength(300);
    }
}
