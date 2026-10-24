let { query } = require('../sqlConnecter');

const ID_FIELDS = {
  Employees: 'EmployeeID',
  Orders: 'OrderID',
  Items: 'ItemID',
  Discounts: 'DiscountID',
  Sales: 'SaleID',
  Departments: 'DepartmentID',
  Returns: 'ReturnID'
}

function findAll(relation){
  const sql = `SELECT * FROM ${relation}`;
  return query(sql);
}

function findOne(relation, id){
  const idField = ID_FIELDS[relation];
  const sql = `SELECT * FROM ${relation} WHERE ${idField} = ?`
  console.log(idField, relation, id);
  return query(sql, [id]);
}

module.exports = {
  findAll,
  findOne
}