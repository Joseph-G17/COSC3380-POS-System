let { query } = require('../sqlConnecter');

const ID_FIELDS = {
  Employees: 'EmployeeID',
  Orders: 'OrderID',
  Items: 'ItemID',
  'Item Categories': 'ItemCategoryID',
  Discounts: 'DiscountID',
  Sales: 'SaleID',
  Departments: 'DepartmentID',
  Returns: 'ReturnID',
  Inventory: 'InventoryID',
  Customers: 'CustomerID',
  'Employee Hours': 'EmployeeID',
  Shipments: 'ShipmentID'
}

const LIST_QUERIES = {
  Employees: `
     SELECT e.EmployeeID,
           CONCAT(e.FirstName, ' ', e.LastName) AS Name,
           e.Email,
           d.DepartmentName AS Department,
           CASE WHEN e.Role = 1 THEN 'Admin' ELSE 'Cashier' END AS Role,
           e.HireDate
    FROM Employees e
    JOIN Departments d ON d.DepartmentID = e.DepartmentID`,

  Departments: `
    SELECT d.DepartmentID,
           d.DepartmentName,
           CONCAT(e.FirstName, ' ', e.LastName) AS Manager
    FROM Departments d
    JOIN Employees e ON e.EmployeeID = d.ManagerID`,

  Orders: `
    SELECT o.OrderID,
           DATE(o.OrderDate) AS OrderDate,
           CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
           CONCAT(e.FirstName, ' ', e.LastName) AS Employee,
           o.OrderType,
           o.PaymentMethod,
           o.OrderTotal
    FROM Orders o
    JOIN Customers c ON c.CustomerID = o.CustomerID
    JOIN Employees e ON e.EmployeeID = o.EmployeeID`,

  Items: `
    SELECT i.ItemID,
           i.ItemName,
           c.CategoryName AS Category,
           c.Aisle,
           i.ItemPrice AS Price,
           i.ItemWeight AS Weight,
           i.ItemDescription AS Description
    FROM Items i
    JOIN \`Item Categories\` c ON c.ItemCategoryID = i.ItemCategoryID`,

  Inventory: `
    SELECT inv.InventoryID,
           it.ItemName AS Item,
           inv.Stock,
           inv.CurrentSupplierName AS Supplier,
           CONCAT(e.FirstName, ' ', e.LastName) AS OrderedBy
    FROM Inventory inv
    JOIN Items it ON it.ItemID = inv.ItemID
    JOIN Employees e ON e.EmployeeID = inv.EmployeeID`,

  Returns: `
    SELECT r.ReturnID,
           r.OrderID AS OrderNumber,
           CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
           CONCAT(e.FirstName, ' ', e.LastName) AS ProcessedBy,
           r.ReturnTotal,
           DATE(r.ReturnDate) AS ReturnDate
    FROM Returns r
    JOIN Orders o ON o.OrderID = r.OrderID
    JOIN Customers c ON c.CustomerID = o.CustomerID
    JOIN Employees e ON e.EmployeeID = r.EmployeeID`,

  Discounts: `
    SELECT d.DiscountID,
           d.DiscountCode AS Code,
           i.ItemName AS Item,
           d.DiscountPercent AS PercentOff,
           d.NewItemPrice,
           DATE(d.ExpirationDate) AS ExpirationDate
    FROM Discounts d
    LEFT JOIN Items i ON i.ItemID = d.ItemID`,

  //no arrival date means the shipment is still on its way
  Shipments: `
    SELECT s.ShipmentID,
           it.ItemName AS Item,
           s.SupplierName AS Supplier,
           s.QuantityShipped AS Quantity,
           s.ShipmentCost AS Cost,
           COALESCE(DATE(s.ArrivalDate), 'On Order') AS ArrivalDate,
           CONCAT(e.FirstName, ' ', e.LastName) AS ReceivedBy
    FROM Shipments s
    JOIN Inventory inv ON inv.InventoryID = s.InventoryID
    JOIN Items it ON it.ItemID = inv.ItemID
    JOIN Employees e ON e.EmployeeID = s.EmployeeID`
}

function findAll(entity){
  if (LIST_QUERIES[entity]) return query(LIST_QUERIES[entity]);

  const sql = `SELECT * FROM ??`;
  return query(sql, [entity]);
}

function findOne(entity, id){
  const idField = ID_FIELDS[entity];
  const sql = `SELECT * FROM ?? WHERE ?? = ?`
  return query(sql, [entity, idField, id]);
}

function updateOne(entity, id, data){
  const idField = ID_FIELDS[entity];
  const sql = `UPDATE ?? SET ? WHERE ?? = ?`;
  return query(sql, [entity, data, idField, id]);
}

function deleteOne(entity, id){
  const idField = ID_FIELDS[entity];
  const sql = `DELETE FROM ?? WHERE ?? = ?`;
  return query(sql, [entity, idField, id]);
}

function getColumns(entity){
  const sql = `SHOW COLUMNS FROM ??`;
  return query(sql, [entity]);
}

function insertOne(entity, data){
  const sql = `INSERT INTO ?? SET ?`;
  return query(sql, [entity, data]);
}

module.exports = {
  findAll,
  findOne,
  updateOne,
  deleteOne,
  getColumns,
  insertOne
}