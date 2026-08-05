using System.Net;
using System.Text.Json;
using ZPadel.Application.Common.Exceptions;

namespace ZPadel.Api.Middleware;

/// <summary>Converts every exception into one consistent ProblemDetails shape — a booking-conflict
/// message can never leak out for an unrelated admin-CRUD conflict, since each exception type maps
/// to its own status/title independently.</summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception ex)
    {
        var (status, title) = ex switch
        {
            NotFoundException => (HttpStatusCode.NotFound, "Not Found"),
            BookingConflictException => (HttpStatusCode.Conflict, "Booking Conflict"),
            ConflictException => (HttpStatusCode.Conflict, "Conflict"),
            BadRequestException => (HttpStatusCode.BadRequest, "Bad Request"),
            UnauthorizedAppException => (HttpStatusCode.Unauthorized, "Unauthorized"),
            _ => (HttpStatusCode.InternalServerError, "Internal Server Error")
        };

        if (status == HttpStatusCode.InternalServerError)
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            _logger.LogWarning("{ExceptionType} on {Method} {Path}: {Message}", ex.GetType().Name, context.Request.Method, context.Request.Path, ex.Message);

        var problem = new Dictionary<string, object?>
        {
            ["type"] = $"https://httpstatuses.io/{(int)status}",
            ["title"] = title,
            ["status"] = (int)status,
            ["detail"] = status == HttpStatusCode.InternalServerError ? "An unexpected error occurred." : ex.Message,
            ["traceId"] = context.TraceIdentifier
        };

        if (ex is BookingConflictException bce)
        {
            problem["unavailableSlots"] = bce.UnavailableSlots.Select(s => new { date = s.Date, startTime = s.StartTime });
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)status;
        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
