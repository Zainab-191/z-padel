using System.Security.Cryptography;

namespace ZPadel.Application.Common;

public static class ReferenceCodeGenerator
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity

    public static string Generate()
    {
        Span<byte> bytes = stackalloc byte[6];
        RandomNumberGenerator.Fill(bytes);
        var chars = new char[6];
        for (var i = 0; i < 6; i++)
            chars[i] = Alphabet[bytes[i] % Alphabet.Length];
        return $"ZP-{new string(chars)}";
    }
}
