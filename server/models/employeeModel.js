let employees = require('../testdata/employees');
let { query } = require('../sqlConnecter')
const { writeDataToFile } = require('../utilities');

/* BEFORE QUERY PROMISE 
function findAll(){
  return new Promise((resolve, reject) => {
    resolve(employees);
  })
}
*/
function findAll(){
  return query('SELECT * FROM Employees');
}

function findEmployeeLogin(username){
  const sql = 'SELECT l.employeeID, l.employeePassword, e.Role, e.firstName, e.departmentID FROM \`Employee Logins\` as l JOIN Employees as e ON e.employeeID = l.employeeID WHERE l.employeeUsername = ?'
  return query(sql, username);
}

//only the username, the password never leaves the server
function findLoginInfo(id){
  const sql = 'SELECT EmployeeUsername FROM \`Employee Logins\` WHERE EmployeeID = ?'
  return query(sql, [id]);
}

function createLogin(id, username, password){
  const sql = 'INSERT INTO \`Employee Logins\` (EmployeeID, EmployeeUsername, EmployeePassword) VALUES (?,?,?)'
  return query(sql, [id, username, password]);
}

function updateLogin(id, changes){
  const sql = 'UPDATE \`Employee Logins\` SET ? WHERE EmployeeID = ?'
  return query(sql, [changes, id]);
}

function updateHours(id, hoursWorked){
  const sql = `UPDATE ?? SET hoursWorked = hoursWorked + ? WHERE EmployeeID = ?`
  const params = ['employee hours', hoursWorked, id];
  return query(sql, params);
}

//INSERT INTO
function create(employee){ 
  const sql = 'INSERT INTO employees (DepartmentID, FirstName, LastName, Email, Role, BirthDate, HireDate) VALUES (?,?,?,?,?,?,?)'
  const params = [1, 'Chris', 'Mai', 'random5@company.com', '1', '2000-19-01', '2020-20-02'];

  return query(sql, params);
} 

//UPDATE 
function update(id, employeeData) {
  return new Promise((resolve, reject) => {
    const index = employees.findIndex((e) => e.EmployeeID === id)
    employees[index] = {EmployeeID: id, ...employeeData}
    writeDataToFile('./testdata/employees.json', employees);
    resolve(employees[index]);
  })
}

//DELETE
function remove(id) {
  return new Promise((resolve, reject) => {
    employees = employees.filter((e) => e.EmployeeID !== id);
    writeDataToFile('./testdata/employees.json', employees);
    resolve();
  })
}

module.exports = {
  findAll,
  findEmployeeLogin,
  findLoginInfo,
  createLogin,
  updateLogin,
  updateHours,
  create,
  update,
  remove
}