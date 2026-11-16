namespace GenData.Data;

public struct Season(string seasonName, MonthDayOnly startDate, MonthDayOnly endDate)
{
    public string SeasonName = seasonName;
    public MonthDayOnly StartDate = startDate;
    public MonthDayOnly EndDate = endDate;
}
