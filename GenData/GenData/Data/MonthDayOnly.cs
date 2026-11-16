namespace GenData.Data;

public readonly struct MonthDayOnly
{
    private readonly DateOnly _date;

    public MonthDayOnly(int month, int day)
    {
        _date = new DateOnly(1, month, day);
    }

    public MonthDayOnly(DateOnly date)
    {
        _date = date;
    }

    public MonthDayOnly(DateTime date)
    {
        _date = DateOnly.FromDateTime(date);
    }

    public int Month => _date.Month;
    public int Day => _date.Day;

    public override string ToString() => $"{Month}/{Day}";
}