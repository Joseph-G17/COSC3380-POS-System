//columns that hold an id from another table, and what to show instead of the raw id
//e.g. a form shows "Dairy" in a dropdown instead of DepartmentID = 3

//employees come back either with a name field or with first/last
const employeeLabel = (row) => row.Name || `${row.FirstName} ${row.LastName}`;

//  entity:  which api route to fetch the other table from (/api/<entity>)
//  idField: the id column in that table (saved as the dropdown's value)
//  label:   turns one of its rows into the text shown in the dropdown
export const FOREIGN_KEYS = {
  DepartmentID: { entity: 'Departments', idField: 'DepartmentID', label: (row) => row.DepartmentName },
  ManagerID: { entity: 'Employees', idField: 'EmployeeID', label: employeeLabel },
  EmployeeID: { entity: 'Employees', idField: 'EmployeeID', label: employeeLabel },
  CustomerID: { entity: 'Customers', idField: 'CustomerID', label: (row) => `${row.FirstName} ${row.LastName}` },
  ItemCategoryID: { entity: 'Item Categories', idField: 'ItemCategoryID', label: (row) => row.CategoryName },
  ItemID: { entity: 'Items', idField: 'ItemID', label: (row) => row.ItemName },
  InventoryID: { entity: 'Inventory', idField: 'InventoryID', label: (row) => `${row.Item} (${row.Supplier || 'No supplier'})` },
  OrderID: { entity: 'Orders', idField: 'OrderID', label: (row) => `Order #${row.OrderID} - ${row.Customer} (${row.OrderDate})` },
  SaleID: { entity: 'Sales', idField: 'SaleID', label: (row) => row.SaleName },
  SeasonID: { entity: 'Seasons', idField: 'SeasonID', label: (row) => row.SeasonName },
  DiscountID: { entity: 'Discounts', idField: 'DiscountID', label: (row) => row.Code || row.DiscountCode }
}

//role is saved as a number in the db
export const ROLES = [
  { value: 0, label: 'Cashier' },
  { value: 1, label: 'Admin' }
];

//'DepartmentID' -> 'DepartmentName', 'LastFourDigits' -> 'Last Four Digits'
export const getLabel = (field) => field.replace(/ID$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

//required and gets an astrik
export const isRequired = (col) => col.Null === 'NO' && col.Default === null && col.Extra !== 'auto_increment';

//builds the dropdown choices for every column that needs one
//{ DepartmentID: [{value: 1, label: 'Sales'}, ...]} for the columns that need a dropdown
export const loadOptions = async (columns) => {
  const options = {};

  for (const col of columns) {
    if (col.Field === 'Role') options.Role = ROLES;

    const fk = FOREIGN_KEYS[col.Field];
    if (!fk || col.Extra === 'auto_increment') continue;

    try{
      const response = await fetch(`/api/${encodeURIComponent(fk.entity)}`);
      const rows = await response.json();
      if (!response.ok) throw new Error(rows.message);

      options[col.Field] = rows
        .map((row) => ({ value: row[fk.idField], label: fk.label(row) }))
        .sort((a, b) => String(a.label).localeCompare(String(b.label)));
    } catch(error){
      console.log(error); // no dropdown for this column, it stays a plain box
    }
  }

  return options;
}