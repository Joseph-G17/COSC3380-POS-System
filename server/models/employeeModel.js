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

function findLogins(){
  return query('SELECT * FROM `employee logins`')
}

//INSERT INTO
function create(employee){
  return new Promise((resolve, reject) =>{
    const newEmployee = {EmployeeID: '6', ...employee};
    employees.push(newEmployee);
    writeDataToFile('./testdata/employees.json', employees);
    resolve(newEmployee);
  })
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
  findLogins,
  create,
  update,
  remove
}