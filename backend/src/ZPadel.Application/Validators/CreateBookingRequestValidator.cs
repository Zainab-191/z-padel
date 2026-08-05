using FluentValidation;
using ZPadel.Application.Common;
using ZPadel.Application.DTOs.Booking;

namespace ZPadel.Application.Validators;

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequestDto>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.GuestPhone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?[0-9]{7,15}$").WithMessage("Phone number must be 7-15 digits, optionally starting with +.");

        RuleFor(x => x.GuestEmail)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.GuestEmail))
            .WithMessage("Email is not valid.");

        RuleFor(x => x.PaymentMethod).IsInEnum();

        RuleFor(x => x.Slots)
            .NotEmpty().WithMessage("At least one time slot is required.")
            .Must(s => s.Count <= BookingRules.MaxHoursPerRequest)
            .WithMessage($"A single booking cannot exceed {BookingRules.MaxHoursPerRequest} hours.");

        RuleForEach(x => x.Slots).ChildRules(slot =>
        {
            slot.RuleFor(s => s.StartTime.Minute).Equal(0).WithMessage("Times must be aligned to the top of the hour.");
            slot.RuleFor(s => s.StartTime.Second).Equal(0).WithMessage("Times must be aligned to the top of the hour.");
        });
    }
}
