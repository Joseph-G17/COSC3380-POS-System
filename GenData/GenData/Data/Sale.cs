namespace GenData.Data;

public struct Sale(string saleName, DateTime? startDate = null, DateTime? endDate = null, MonthDayOnly? repeatStartDate = null, MonthDayOnly? repeatEndDate = null)
{
    public string SaleName = saleName;
    public DateTime? StartDate = startDate;
    public DateTime? EndDate = endDate;
    public MonthDayOnly? RepeatStartDate = repeatStartDate;
    public MonthDayOnly? RepeatEndDate = repeatEndDate;
}