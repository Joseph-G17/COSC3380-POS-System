namespace GenData.Data;

public class Employee : Person
{
    public readonly DateOnly BirthDate;
    public readonly DateOnly HireDate;

    public Employee(string firstName, string lastName, string email, DateOnly birthDate, DateOnly hireDate) : base(firstName, lastName, email)
    {
        BirthDate = birthDate;
        HireDate = hireDate;
    }

    public Employee()
    {
        // Get a random birthdate 18-80 years ago
        DateTime birthDate = RandomHelper.GetRandomDateTime(DateTime.Now.AddYears(-80), DateTime.Now.AddYears(-18));
        BirthDate = DateOnly.FromDateTime(birthDate);

        // Get a random hiredate 0-(birthdate + 18) years ago
        HireDate = DateOnly.FromDateTime(RandomHelper.GetRandomDateTime(DateTime.Now, birthDate.AddYears(18)));
    }
}