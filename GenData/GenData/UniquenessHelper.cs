namespace GenData;

public static class UniquenessHelper
{
    public static string EnsureUnqiue(this string str, Dictionary<string, int> stringOccurances)
    {
        if (!stringOccurances.TryGetValue(str, out int occurances))
        {
            stringOccurances.Add(str, 1);
            return string.Format(str, "", "{0}");
        }

        stringOccurances[str]++;
        return string.Format(str, occurances, "{0}");
    }
}
