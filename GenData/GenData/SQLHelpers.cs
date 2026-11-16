using MySql.Data.MySqlClient;

namespace GenData;

public static class SQLHelpers
{
    public static void Update(this MySqlConnection connection, string tableName, Dictionary<string, object?> parameters, string condition)
    {
        MySqlCommand cmd = new($"UPDATE `{tableName}` SET {string.Join(',', parameters.Keys.Select(columnName => $"{columnName}=@{columnName}"))} WHERE {condition}", connection);

        foreach (KeyValuePair<string, object?> parameter in parameters)
            cmd.Parameters.AddWithValue(parameter.Key, parameter.Value);

        cmd.ExecuteNonQuery();
    }

    public static ulong InsertInto(this MySqlConnection connection, string tableName, Dictionary<string, object?> parameters)
    {
        MySqlCommand cmd = new($"INSERT INTO `{tableName}` ({string.Join(',', parameters.Keys)}) VALUES ({string.Join(',', parameters.Keys.Select(columnName => $"@{columnName}"))})", connection);

        foreach (KeyValuePair<string, object?> parameter in parameters)
            cmd.Parameters.AddWithValue(parameter.Key, parameter.Value);

        cmd.ExecuteNonQuery();
        return (ulong)cmd.LastInsertedId;
    }

    public static void Reset(this MySqlConnection connection, string tableName)
    {
        MySqlCommand cmd = new($"SET FOREIGN_KEY_CHECKS = 0; TRUNCATE `{tableName}`; SET FOREIGN_KEY_CHECKS = 1", connection);
        cmd.ExecuteNonQuery();
    }

    public static void ToggleKeyChecks(this MySqlConnection connection, bool enableChecks)
    {
        MySqlCommand cmd = new($"SET FOREIGN_KEY_CHECKS = {(enableChecks ? 1 : 0)}", connection);
        cmd.ExecuteNonQuery();
    }

    public static string ToSQLString(this object obj) => obj.GetType().Name switch
    {
        "DateTime" => ((DateTime)obj).ToString("yyyy-MM-dd HH:mm:ss"),
        "DateOnly" => ((DateOnly)obj).ToString("yyyy-MM-dd"),
        _ => obj.ToString() ?? ""
    };
}