namespace GenData.Data;

public readonly struct Address
{
    public static readonly string[] AddressTypes = ["Billing", "Shipping", "Both"];

    public readonly string Country; // TODO: Non-nullable
    public readonly string? State; // TODO: Remove
    public readonly string City; // TODO: Non-nullable
    public readonly string? Zip; // TODO: Change to vchar in db, Non-nullable
    public readonly string HouseNumber;
    public readonly string Street;
    public readonly string Type;

    public Address()
    {
        do
            Country = RandomHelper.GetRandomCountry();
        while (Country.Length > 37);

        City = RandomHelper.GetRandomCity();
        Zip = RandomHelper.GetRandomInt(10000, 100000).ToString();
        HouseNumber = RandomHelper.GetRandomInt(1, 10000).ToString();
        Street = RandomHelper.GetRandomStreet();
        Type = AddressTypes[RandomHelper.GetRandomInt(0, 3)];
    }

    public override string ToString() => $"{HouseNumber} {Street}, {City}, {Country}";
}