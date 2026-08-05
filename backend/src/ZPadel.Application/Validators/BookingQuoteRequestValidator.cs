using FluentValidation;
using ZPadel.Application.Common;
using ZPadel.Application.DTOs.Booking;

namespace ZPadel.Application.Validators;

public class BookingQuoteRequestValidator : AbstractValidator<BookingQuoteRequestDto>
{
    public BookingQuoteRequestValidator()
    {
        RuleFor(x => x.Slots)
            .NotEmpty().WithMessage("At least one time slot is required.")
            .Must(s => s.Count <= BookingRules.MaxHoursPerRequest)
            .WithMessage($"A single booking cannot exceed {BookingRules.MaxHoursPerRequest} hours.");
    }
}
