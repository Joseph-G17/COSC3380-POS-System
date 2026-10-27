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
  Customers: 'CustomerID'
}

function findAll(entity){
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