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
  Shipments: 'ShipmentID',
  Seasons: 'SeasonID',
  //two-column keys: the URL id is "SaleID-ItemID" / "SeasonID-ItemID"
  'Sale Items': ['SaleID', 'ItemID'],
  'Seasonal Deals': ['SeasonID', 'ItemID']
}

//"WHERE SaleID = ? AND ItemID = ?" for two-column keys, "WHERE ItemID = ?" for the rest
function whereId(entity, id){
  const fields = [].concat(ID_FIELDS[entity]);
  const values = String(id).split('-');
  return {
    sql: fields.map(() => '?? = ?').join(' AND '),
    params: fields.flatMap((field, i) => [field, values[i]])
  };
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
           COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Unassigned') AS Manager
    FROM Departments d
    LEFT JOIN Employees e ON e.EmployeeID = d.ManagerID`,

  Orders: `
    SELECT o.OrderID,
           DATE(o.OrderDate) AS OrderDate,
           CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
           COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS Employee,
           o.OrderType,
           o.PaymentMethod,
           o.OrderTotal,
           o.OrderStatus AS Status
    FROM Orders o
    JOIN Customers c ON c.CustomerID = o.CustomerID
    LEFT JOIN Employees e ON e.EmployeeID = o.EmployeeID
    ORDER BY o.OrderDate DESC, o.OrderID DESC`,

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
           COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS OrderedBy
    FROM Inventory inv
    JOIN Items it ON it.ItemID = inv.ItemID
    LEFT JOIN Employees e ON e.EmployeeID = inv.EmployeeID`,

  Returns: `
    SELECT r.ReturnID,
           r.OrderID AS OrderNumber,
           CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
           COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS ProcessedBy,
           r.ReturnTotal,
           DATE(r.ReturnDate) AS ReturnDate
    FROM Returns r
    JOIN Orders o ON o.OrderID = r.OrderID
    JOIN Customers c ON c.CustomerID = o.CustomerID
    LEFT JOIN Employees e ON e.EmployeeID = r.EmployeeID`,

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
           COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS ReceivedBy
    FROM Shipments s
    JOIN Inventory inv ON inv.InventoryID = s.InventoryID
    JOIN Items it ON it.ItemID = inv.ItemID
    LEFT JOIN Employees e ON e.EmployeeID = s.EmployeeID`,

  //SaleID/SeasonID + ItemID stay in the rows so each row can link to its edit page
  'Sale Items': `
    SELECT si.SaleID,
           si.ItemID,
           s.SaleName AS Sale,
           it.ItemName AS Item,
           it.ItemPrice AS RegularPrice,
           si.NewItemPrice AS SalePrice,
           DATE(s.SaleStartDate) AS Starts,
           DATE(s.SaleEndDate) AS Ends
    FROM \`Sale Items\` si
    JOIN Sales s ON s.SaleID = si.SaleID
    JOIN Items it ON it.ItemID = si.ItemID
    ORDER BY s.SaleName, it.ItemName`,

  'Seasonal Deals': `
    SELECT sd.SeasonID,
           sd.ItemID,
           se.SeasonName AS Season,
           it.ItemName AS Item,
           it.ItemPrice AS RegularPrice,
           ROUND(sd.NewItemPrice, 2) AS SeasonPrice,
           se.SeasonStartDate AS Starts,
           se.SeasonEndDate AS Ends
    FROM \`Seasonal Deals\` sd
    JOIN Seasons se ON se.SeasonID = sd.SeasonID
    JOIN Items it ON it.ItemID = sd.ItemID
    ORDER BY se.SeasonName, it.ItemName`
}

function findAll(entity){
  if (LIST_QUERIES[entity]) return query(LIST_QUERIES[entity]);

  const sql = `SELECT * FROM ??`;
  return query(sql, [entity]);
}

function findOne(entity, id){
  const where = whereId(entity, id);
  return query(`SELECT * FROM ?? WHERE ${where.sql}`, [entity, ...where.params]);
}

function updateOne(entity, id, data){
  const where = whereId(entity, id);
  return query(`UPDATE ?? SET ? WHERE ${where.sql}`, [entity, data, ...where.params]);
}

function deleteOne(entity, id){
  const where = whereId(entity, id);
  return query(`DELETE FROM ?? WHERE ${where.sql}`, [entity, ...where.params]);
}

//the items inside one order, for the admin order page
function findOrderItems(orderId){
  return query(`
    SELECT oi.ItemID,
           it.ItemName AS Item,
           oi.QuantityOrdered AS Quantity,
           oi.ItemPrice AS PricePaid,
           it.ItemPrice AS RegularPrice,
           oi.QuantityOrdered * oi.ItemPrice AS LineTotal
    FROM \`Ordered Items\` oi
    JOIN Items it ON it.ItemID = oi.ItemID
    WHERE oi.OrderID = ?
    ORDER BY it.ItemName`, [orderId]);
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
  findOrderItems,
  getColumns,
  insertOne
}