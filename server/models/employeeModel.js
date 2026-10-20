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


//SELECT
function findByID(id) {
  return new Promise((resolve, reject) => {
    const employee = employees.find((e) => e.EmployeeID === id)
    resolve(employee);
  })
}

function findLogin(username){
  const sql = 'SELECT l.employeeID, l.employeePassword, e.Role FROM \`employee logins\` as l JOIN employees as e ON e.employeeID = l.employeeID WHERE l.employeeUsername = ?'
  return query(sql, username);
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
  findByID,
  findLogin,
  create,
  update,
  remove
}