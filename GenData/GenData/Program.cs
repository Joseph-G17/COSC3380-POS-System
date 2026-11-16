using System.Data;
using System.Text.RegularExpressions;
using GenData.Data;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using Zaretto.ODS;

namespace GenData;

public partial class Program
{
    public static readonly string[] DepartmentNames = ["Bakery", "Deli", "Produce", "Beauty", "Pharmacy", "Automotive", "Clothing", "Checkout", "Bagging", "Security", "Inventory Management", "Stocking", "Order Fulfillment", "Management", "Human Resources", "Customer Service", "Custodian"];
    public static readonly Season[] Seasons = [new("Spring", new(3, 19), new(6, 20)), new("Summer", new(6, 20), new(9, 22)), new("Fall", new(9, 22), new(12, 20)), new("Winter", new(12, 20), new(3, 19))];
    // End of Summer - seasonal lawn furniture & outdoors, Thanksgiving - food, Easter - food, Christmas - gifts & food, New Years - food, 4th of July - meats
    public static readonly Sale[] Sales = [new("End of Summer", repeatStartDate: new(8, 19), repeatEndDate: new(10, 2)), new("Thanksgiving", repeatStartDate: new(11, 20), repeatEndDate: new(11, 28)), new("Easter", new(2027, 3, 28), new(2027, 3, 29)), new("Christmas", repeatStartDate: new(12, 1), repeatEndDate: new(1, 1)), new("New Years", repeatStartDate: new(1, 1), repeatEndDate: new(1, 2)), new("4th of July", repeatStartDate: new(7, 4), repeatEndDate: new(7, 5)), new("Halloween", repeatStartDate: new(10, 1), repeatEndDate: new(11, 1))];
    public static readonly Dictionary<string, int> CustomerUsernameCollisions = [];
    public static readonly Dictionary<string, int> EmployeeUsernameCollisions = [];

    [GeneratedRegex(@"\((.*?(?=-|\)))\)")]
    private static partial Regex MatchItemWeight();

    public static void Main(string[] _)
    {
        // Setup Secrets
        IConfigurationRoot config = new ConfigurationBuilder().AddUserSecrets<Program>().Build();

        // Sign in to the database
        //using MySqlConnection connection = new("Server=127.0.0.1;Port=3306;Database=COSC3380-PoS;Uid=root;Pwd=Clover_13;");
        using MySqlConnection connection = new($"Server={config["DB_HOST"]};Port={config["DB_PORT"]};Database={config["DB_DATABASE"]};Uid={config["DB_USER"]};Pwd={config["DB_PASSWORD"]};");

        // Open Connection
        connection.Open();

        // Get item list 
        DataSet spreadsheetData = new ODSReaderWriter().ReadOdsFile("Items.ods");
        EnumerableRowCollection<DataRow> rows = spreadsheetData.Tables[0].AsEnumerable();

        // Add item categories
        Dictionary<string, ulong> itemCategoryIDs = [];
        int categoryCount = 0;

        connection.Reset("item categories");
        foreach (DataRow row in rows.Skip(1))
        {
            if (itemCategoryIDs.ContainsKey((string)row.ItemArray[1]))
                continue;

            itemCategoryIDs.Add((string)row.ItemArray[1], connection.InsertInto("item categories", new()
            {
                {"CategoryName", (string)row.ItemArray[1]},
                {"Aisle", $"{(char)('A' + (categoryCount / 2))}{(categoryCount++ % 2) + 1}"}
            }));
        }

        // Add items
        Dictionary<string, ulong> itemIDs = [];

        connection.Reset("items");
        foreach (DataRow row in rows.Skip(1))
        {
            CaptureCollection itemWeightGroup = MatchItemWeight().Match((string)row.ItemArray[0]).Captures;
            itemIDs.Add((string)row.ItemArray[0], connection.InsertInto("items", new()
            {
                {"ItemCategoryID", itemCategoryIDs[(string)row.ItemArray[1]]},
                {"ItemName", (string)row.ItemArray[0]},
                {"ItemDescription", null},
                {"ItemWeight", itemWeightGroup.Count == 1 ? ParseWeight(itemWeightGroup[0]).ToString() : null},
                {"ItemPrice", double.Parse((string)row.ItemArray[2])}
            }));
        }

        // Get seasonal price list 
        spreadsheetData = new ODSReaderWriter().ReadOdsFile("Seasonal Prices.ods");
        rows = spreadsheetData.Tables[0].AsEnumerable();

        // Add seasons
        Dictionary<string, ulong> seasonIDs = [];

        connection.Reset("seasons");
        foreach (Season season in Seasons)
        {
            seasonIDs.Add(season.SeasonName, connection.InsertInto("seasons", new()
            {
                {"SeasonName", season.SeasonName},
                {"SeasonStartDate", season.StartDate.ToString()},
                {"SeasonEndDate", season.EndDate.ToString()}
            }));
        }

        // Add seasonal deals
        connection.Reset("seasonal deals");
        foreach (DataRow row in rows.Skip(1))
        {
            connection.InsertInto("seasonal deals", new()
            {
                {"SeasonID", seasonIDs[(string)row.ItemArray[1]]},
                {"ItemID", itemIDs[(string)row.ItemArray[0]]},
                {"NewItemPrice", double.Parse((string)row.ItemArray[2])}
            });
        }

        // Get sale price list 
        spreadsheetData = new ODSReaderWriter().ReadOdsFile("Sale Prices.ods");
        rows = spreadsheetData.Tables[0].AsEnumerable();

        // Add sales
        Dictionary<string, ulong> saleIDs = [];

        connection.Reset("sales");
        foreach (Sale sale in Sales)
        {
            saleIDs.Add(sale.SaleName, connection.InsertInto("sales", new()
            {
                {"SaleName", sale.SaleName},
                {"SaleStartDate", sale.StartDate?.ToSQLString()},
                {"SaleEndDate", sale.EndDate?.ToSQLString()},
                {"RepeatableSaleStartDate", sale.RepeatStartDate.ToString()},
                {"RepeatableSaleEndDate", sale.RepeatEndDate.ToString()}
            }));
        }

        // Add sale items
        connection.Reset("sale items");
        foreach (DataRow row in rows.Skip(1))
        {
            ulong itemID = itemIDs[(string)row.ItemArray[0]];
            IEnumerable<ulong> itemSaleIDs = ((string)row.ItemArray[1]).Split(',').Select(s => saleIDs[s]);
            double itemPrice = double.Parse((string)row.ItemArray[2]);
            foreach (ulong saleID in itemSaleIDs)
            {
                connection.InsertInto("sale items", new()
                {
                    {"SaleID", saleID},
                    {"ItemID", itemID},
                    {"NewItemPrice", itemPrice}
                });
            }
        }

        // Add admin
        connection.Reset("employees");
        connection.Reset("employee logins");

        connection.ToggleKeyChecks(false);
        connection.InsertInto("employees", new()
        {
            {"DepartmentID", 1},
            {"FirstName", "The"},
            {"LastName", "Admin"},
            {"Email", "admin@saveso.com"},
            {"Role", 0},
            {"BirthDate", "2000-01-01"},
            {"HireDate", "2020-01-01"}
        });

        connection.InsertInto("employee logins", new()
        {
            {"EmployeeID", 1},
            {"EmployeeUsername", "admin@saveso.com"},
            {"EmployeePassword", "password"}
        });
        connection.ToggleKeyChecks(true);

        // Add departments
        Dictionary<string, ulong> departmentIDs = [];

        connection.Reset("departments");
        connection.ToggleKeyChecks(false);
        foreach (string departmentName in DepartmentNames)
        {
            departmentIDs.Add(departmentName, connection.InsertInto("departments", new()
            {
                {"DepartmentName", departmentName},
                {"ManagerID", 0}
            }));
        }
        connection.ToggleKeyChecks(true);

        // Add employees
        Dictionary<string, List<string>> departmentEmployees = [];
        Dictionary<string, ulong> employeeIDs = [];

        foreach (KeyValuePair<string, ulong> departmentNameIDPair in departmentIDs)
        {
            departmentEmployees.Add(departmentNameIDPair.Key, []);
            for (int i = 0; i < RandomHelper.GetRandomInt(2, 6); i++)
            {
                Employee employee = new();
                departmentEmployees[departmentNameIDPair.Key].Add($"{employee.LastName}, {employee.FirstName}");
                employeeIDs.Add($"{employee.LastName}, {employee.FirstName}", connection.InsertInto("employees", new()
                {
                    {"DepartmentID", departmentNameIDPair.Value},
                    {"FirstName", employee.FirstName},
                    {"LastName", employee.LastName},
                    {"Email", employee.Email},
                    {"Role", 0},
                    {"BirthDate", employee.BirthDate.ToSQLString()},
                    {"HireDate", employee.HireDate.ToSQLString()}
                }));
            }
        }

        // Add employee hours
        connection.Reset("employee hours");
        foreach (KeyValuePair<string, ulong> employeeNameIDPairs in employeeIDs)
        {
            string[] employeeNameSplit = employeeNameIDPairs.Key.Split(", ");
            DateTime dateTime = DateTime.Now;
            connection.InsertInto("employee hours", new()
            {
                {"EmployeeID", employeeNameIDPairs.Value},
                {"PayPeriodStart", new DateOnly(dateTime.Year, dateTime.Month, 1).ToSQLString()},
                {"PayPeriodEnd", new DateOnly(dateTime.Year, dateTime.Month, 1).AddMonths(1).ToSQLString()},
                {"HoursWorked", (decimal)0},
                {"HourlyRate", (decimal)RandomHelper.GetRandomInt(27, 35)}
            });
        }

        // Add employee logins
        foreach (KeyValuePair<string, ulong> employeeNameIDPairs in employeeIDs)
        {
            string[] employeeNameSplit = employeeNameIDPairs.Key.Split(", ");
            connection.InsertInto("employee logins", new()
            {
                {"EmployeeID", employeeNameIDPairs.Value},
                {"EmployeeUsername", $"{employeeNameSplit[1]}_{employeeNameSplit[0]}".EnsureUnqiue(EmployeeUsernameCollisions)},
                {"EmployeePassword", RandomHelper.GetRandomPassword()}
            });
        }

        // Update department manager ids
        foreach (string departmentName in DepartmentNames)
        {
            List<string> employeeNames = departmentEmployees[departmentName];
            connection.Update("departments", new()
            {
                {"ManagerID", employeeIDs[employeeNames[RandomHelper.GetRandomInt(0, employeeNames.Count)]]}
            }, $"DepartmentID = {departmentIDs[departmentName]}");
        }

        // Initalize inventory
        ulong[] inventoryManagementEmployeeIDs = [.. departmentEmployees["Inventory Management"].Select(e => employeeIDs[e])];

        connection.Reset("inventory");
        foreach (ulong itemID in itemIDs.Values)
        {
            connection.InsertInto("inventory", new()
            {
                {"ItemID", itemID},
                {"EmployeeID", inventoryManagementEmployeeIDs[RandomHelper.GetRandomInt(0, inventoryManagementEmployeeIDs.Length)]},
                {"CurrentSupplierName", "Supply All LLC."},
                {"Stock", (ushort)RandomHelper.GetRandomInt(15, short.MaxValue / 2)}
            });
        }

        // Add customers
        Dictionary<Customer, ulong> customerIDs = [];

        connection.Reset("customers");
        for (int i = 0; i < 100; i++)
        {
            Customer customer = new();
            customerIDs.Add(customer, connection.InsertInto("customers", new()
            {
                {"FirstName", customer.FirstName},
                {"LastName", customer.LastName},
                {"Email", customer.Email},
                {"PhoneNumber", customer.PhoneNumber},
                {"MembershipExpirationDate", customer.MembershipExpirationDate.ToSQLString()}
            }));
        }

        // Add customer logins
        connection.Reset("customer logins");
        foreach (KeyValuePair<Customer, ulong> customerIDPair in customerIDs)
        {
            connection.InsertInto("customer logins", new()
            {
                {"CustomerID", customerIDPair.Value},
                {"CustomerUsername", $"{customerIDPair.Key.FirstName}_{customerIDPair.Key.LastName}".EnsureUnqiue(CustomerUsernameCollisions)},
                {"CustomerPassword", RandomHelper.GetRandomPassword()}
            });
        }

        // Add customer addresses
        connection.Reset("addresses");
        foreach (KeyValuePair<Customer, ulong> customerIDPair in customerIDs)
        {
            Address[] customerAddresses = customerIDPair.Key.Addresses;
            foreach (Address address in customerAddresses)
            {
                connection.InsertInto("addresses", new()
                {
                    {"CustomerID", customerIDPair.Value},
                    {"Country", address.Country},
                    {"City", address.City},
                    {"Zipcode", address.Zip},
                    {"Address", address.ToString()},
                    {"AddressType", address.Type}
                });
            }
        }

        // Close Connection
        connection.Close();
    }

    /// <summary>
    /// Listens for a password and masks all typed characters.
    /// </summary>
    /// <returns></returns>
    private static string ReadPassword()
    {
        string password = "";
        ConsoleKey key = ConsoleKey.None;
        while (key != ConsoleKey.Enter)
        {
            ConsoleKeyInfo keyInfo = Console.ReadKey(intercept: true);
            key = keyInfo.Key;

            if (key == ConsoleKey.Backspace && password.Length > 0)
            {
                Console.Write("\b \b");
                password = password[0..^1];
                continue;
            }

            if (char.IsControl(keyInfo.KeyChar))
                continue;

            Console.Write('*');
            password += keyInfo.KeyChar;
        }

        return password;
    }

    private static double ParseWeight(Capture capture)
    {
        string[] splits = capture.Value[1..^1].Split(' ');
        return splits.First(s => !Double.TryParse(s, out double value)) switch
        {
            "oz" => Double.Parse(splits.First(s => Double.TryParse(s, out double value))) * 0.0625,
            "lb" => Double.Parse(splits.First(s => Double.TryParse(s, out double value))),
            "per" => 1,
            _ => 0,
        };
    }
}