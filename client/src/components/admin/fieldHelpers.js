// columns that point at another table, and what to show instead of the id
const employeeLabel = (r) => r.Name || `${r.FirstName} ${r.LastName}`;

export const FOREIGN_KEYS = {
  DepartmentID: { entity: 'Departments', idField: 'DepartmentID', label: (r) => r.DepartmentName },
  ManagerID: { entity: 'Employees', idField: 'EmployeeID', label: employeeLabel },
  EmployeeID: { entity: 'Employees', idField: 'EmployeeID', label: employeeLabel },
  CustomerID: { entity: 'Customers', idField: 'CustomerID', label: (r) => `${r.FirstName} ${r.LastName}` },
  ItemCategoryID: { entity: 'Item Categories', idField: 'ItemCategoryID', label: (r) => r.CategoryName },
  ItemID: { entity: 'Items', idField: 'ItemID', label: (r) => r.ItemName },
  OrderID: { entity: 'Orders', idField: 'OrderID', label: (r) => `Order #${r.OrderID} - ${r.Customer} (${r.OrderDate})` },
  SaleID: { entity: 'Sales', idField: 'SaleID', label: (r) => r.SaleName },
  DiscountID: { entity: 'Discounts', idField: 'DiscountID', label: (r) => r.Code || r.DiscountCode }
}

//'DepartmentID' -> 'DepartmentName', 'LastFourDigits' -> 'Last Four Digits'
export const getLabel = (field) => field.replace(/ID$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

//required and gets an astrik
export const isRequired = (col) => col.Null === 'NO' && col.Default === null && col.Extra !== 'auto_increment';

//{ DepartmentID: [{value: 1, label: 'Sales'}, ...]} for the columns that need a dropdown
export const loadOptions = async (columns) => {
  const options = {};

  for (const col of columns) {
    const fk = FOREIGN_KEYS[col.Field];
    if (!fk || col.Extra === 'auto_increment') continue;

    try{
      const response = await fetch(`/api/${encodeURIComponent(fk.entity)}`);
      const rows = await response.json();
      if (!response.ok) throw new Error(rows.message);

      options[col.Field] = rows
        .map((r) => ({ value: r[fk.idField], label: fk.label(r) }))
        .sort((a, b) => String(a.label).localeCompare(String(b.label)));
    } catch(error){
      console.log(error); // no dropdown for this column, it stays a plain box
    }
  }

  return options;
}