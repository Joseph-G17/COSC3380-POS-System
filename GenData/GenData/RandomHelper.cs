using PasswordGenerator;
using RandomDataGenerator.FieldOptions;
using RandomDataGenerator.Randomizers;

namespace GenData;

public static class RandomHelper
{
    // Names
    private static readonly IRandomizerString _randomName = RandomizerFactory.GetRandomizer(new FieldOptionsFullName() { UseNullValues = false });
#pragma warning disable CS8602 // This should never be null, if it is then shit...
    public static string[] GetRandomName() => _randomName.Generate().Split(' ');
#pragma warning restore CS8602

    // Emails
    private static readonly string[] _emailProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "protonmail.com", "proton.me", "tutamail.com", "keemail.me", "tutanota.com", "tuta.io", "tuta.com", "mail.com"];
    private static readonly string[] _emailUsernameFormats = ["{0}{1}", "{0}_{1}", "{0}-{1}"];
    private static readonly string[] _emailIdentifiers = ["", ".SaveSo", ".saveso", ".shopping", ".Shopping"];
    private static readonly Dictionary<string, int> _emailCollisions = [];
    public static string FormatRandomEmail(string firstName, string lastName)
    {
        string emailUsername = string.Format(_emailUsernameFormats[_random.Next(0, _emailUsernameFormats.Length)], firstName, lastName);
        string emailIdentifier = _emailIdentifiers[_random.Next(0, _emailIdentifiers.Length)];
        string emailProvider = _emailProviders[_random.Next(0, _emailProviders.Length)];
        string emailWithoutIdentifier = string.Format("{0}{1}@{2}", emailUsername, "{0}{1}", emailProvider).EnsureUnqiue(_emailCollisions);
        return string.Format(emailWithoutIdentifier, emailIdentifier);
    }

    // Phone Numbers
    private static readonly IRandomizerString _randomPhoneNumber = RandomizerFactory.GetRandomizer(new FieldOptionsTextRegex() { UseNullValues = false, Pattern = "^[0-9]{10}$" });
    private static readonly HashSet<string> _phoneNumberCollisions = [];
    public static string GetRandomPhoneNumber()
    {
        string phoneNumber;
#pragma warning disable CS8600, CS8604 // This should never be null, if it is then shit...
        do
            phoneNumber = _randomPhoneNumber.Generate();
        while (_phoneNumberCollisions.Contains(phoneNumber));
#pragma warning restore CS8600, CS8604

        _phoneNumberCollisions.Add(phoneNumber);
        return phoneNumber;
    }

    // Addresses
    private static readonly IRandomizerString _randomCountry = RandomizerFactory.GetRandomizer(new FieldOptionsCountry() { UseNullValues = false });
    private static readonly IRandomizerString _randomCity = RandomizerFactory.GetRandomizer(new FieldOptionsCity() { UseNullValues = false });
    private static readonly IRandomizerString _randomStreetName = RandomizerFactory.GetRandomizer(new FieldOptionsTextWords() { UseNullValues = false, Min = 1, Max = 1 });
    private static readonly string[] _streetTypes = ["Street", "Road", "Bulevard", "Drive", "Cutoff"];
#pragma warning disable CS8603
    public static string GetRandomCountry() => _randomCountry.Generate();
    public static string GetRandomCity() => _randomCity.Generate();
    public static string GetRandomStreet() => $"{_randomStreetName.Generate()} {_streetTypes[_random.Next(0, _streetTypes.Length)]}";
#pragma warning restore CS8603

    // Passwords
    private static readonly IPasswordGenerator _randomPassword = PasswordGenerator.Password.ForMemorable();
    public static string GetRandomPassword() => _randomPassword.Next();

    // Random misc.
    public static bool GetRandomBool() => _random.Next(0, 2) == 1;
    public static int GetRandomInt(int min = 0, int max = int.MaxValue) => _random.Next(min, max);
    public static int GetRandomPositiveNeagitive() => (_random.Next(0, 2) * 2) - 1;
    public static DateTime GetRandomDateTime(DateTime min, DateTime max) => min.AddSeconds((max - min).TotalSeconds * _random.NextDouble());

    /// <summary>
    /// Seeds a new random.
    /// </summary>
    private static Random _random => new(DateTime.Now.Microsecond);
}