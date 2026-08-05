namespace ZPadel.Application.Common.Exceptions;

/// <summary>Thrown when one or more requested hours have no court left to assign. Carries the exact hours so the client can refresh availability.</summary>
public class BookingConflictException : Exception
{
    public IReadOnlyList<UnavailableSlot> UnavailableSlots { get; }

    public BookingConflictException(IReadOnlyList<UnavailableSlot> unavailableSlots)
        : base("One or more requested times are no longer available.")
    {
        UnavailableSlots = unavailableSlots;
    }

    public record UnavailableSlot(DateOnly Date, TimeOnly StartTime);
}
