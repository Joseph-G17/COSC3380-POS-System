namespace GenData.Data;

public class Customer : Person
{
    public readonly string PhoneNumber;
    public readonly DateTime MembershipExpirationDate;
    public readonly Address[] Addresses;

    public Customer(string firstName, string lastName, string email, string phoneNumber, DateTime membershipExpirationDate, Address[] addresses) : base(firstName, lastName, email)
    {
        PhoneNumber = phoneNumber;
        MembershipExpirationDate = membershipExpirationDate;
        Addresses = addresses;
    }

    public Customer()
    {
        // Prevent duplicate phone numbers
        PhoneNumber = RandomHelper.GetRandomPhoneNumber();

        // Get a random expirationdate within a 1 year of this date
        MembershipExpirationDate = RandomHelper.GetRandomDateTime(DateTime.Now.AddYears(-1), DateTime.Now.AddYears(1));

        // Get random addresses
        Addresses = new Address[RandomHelper.GetRandomInt(0, 4)];
        for (int i = 0; i < Addresses.Length; i++)
            Addresses[i] = new();
    }
}