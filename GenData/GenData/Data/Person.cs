namespace GenData.Data;

public class Person
{
    public readonly string FirstName;
    public readonly string LastName;
    public readonly string Email;

    public Person(string firstName, string lastName, string email)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
    }

    public Person()
    {
        // Get a random name
        string[] firstAndLastName = RandomHelper.GetRandomName();
        FirstName = firstAndLastName[0];
        LastName = firstAndLastName[1];

        // Get a random email
        Email = RandomHelper.FormatRandomEmail(FirstName, LastName);
    }
}