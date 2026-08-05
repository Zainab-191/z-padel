namespace ZPadel.Infrastructure.Payments;

public class ThawaniSettings
{
    public const string SectionName = "Thawani";

    /// <summary>Sandbox API base, e.g. https://uatcheckout.thawani.om/api/v1</summary>
    public string ApiBaseUrl { get; set; } = "https://uatcheckout.thawani.om/api/v1";

    /// <summary>Sandbox checkout page base, e.g. https://uatcheckout.thawani.om/pay</summary>
    public string CheckoutBaseUrl { get; set; } = "https://uatcheckout.thawani.om/pay";

    public string PublishableKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string ProductName { get; set; } = "Padel court booking";
}
