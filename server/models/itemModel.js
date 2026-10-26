<<<<<<< Updated upstream
const { query } = require('../sqlConnecter');

function findAll() {
  return query('SELECT * FROM Items');
}

async function findByID(id) {
  const items = await query('SELECT * FROM Items WHERE ItemID = ?', [id]);
  return items[0];
}

async function create(itemData) {
  const result = await query('INSERT INTO Items SET ?', [itemData]);
  return findByID(result.insertId);
}

async function update(id, itemData) {
  await query('UPDATE Items SET ? WHERE ItemID = ?', [itemData, id]);
  return findByID(id);
}

function remove(id) {
  return query('DELETE FROM Items WHERE ItemID = ?', [id]);
=======
let employees = require('../testdata/items');
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
>>>>>>> Stashed changes
}

module.exports = {
  findAll,
  findByID,
  create,
  update,
  remove
<<<<<<< Updated upstream
};
=======
}
>>>>>>> Stashed changes
