const Employees = require('../models/employeeModel');

const { getPostData } = require('../utilities')

// desc: Gets all employees
// route: GET /api/employee
async function getEmployees(req, res) {
  try {
    const employees = await Employees.findAll();

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(employees));

  } catch (error) {
    console.log(error);
  }
} 

async function getEmployeeLogin(req, res){
  const body = await getPostData(req);
  const {username, password} = JSON.parse(body);
  
  const rows = await Employees.findLogin(username);
  const login = rows[0];

  if(!login || login.employeePassword != password){
    res.writeHead(401, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: 'Password does not match'}));
  }
  else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({employeeID: login.employeeID, Role: login.Role}));
  }
}

// desc: Gets Single Employee
// route: GET /api/employee/:EmployeeID
async function getEmployee(req, res, id) {
  try {
    const employee = await Employees.findByID(id);

    if(!employee) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: 'Employee Not Found'}));
    }
    else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(employee));
    }
  }
  catch (error) {
    console.log(error);
  }
}

// desc: Create an Employee
// route: POST /api/employees
async function createEmployee(req, res){
  try {
    const body = await getPostData(req); //for raw js data!

    const { firstName, lastName, email} =  JSON.parse(body);
    const employee = {
        firstName,
        lastName,
        email
      }

    const newEmployee =  await Employees.create(employee);

    res.writeHead(201, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(newEmployee));

  }  catch (error){
    console.log(error);
  }
}

// desc: Update an Employee
// route: PUT /api/employees/id
async function updateEmployee(req, res, id){
  try {
    const employee = await Employees.findByID(id);

    if(!employee) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: 'Employee Not Found'}));
    }
    else {
      const body = await getPostData(req);

      const { firstName, lastName, email} =  JSON.parse(body);
      const employeeData = {
          firstName: firstName || employee.firstName,
          lastName: lastName || employee.lastName,
          email: email || employee.email
        }

      const updatedEmployee =  await Employees.update(id, employeeData);

      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(updatedEmployee));
    }
  }  catch (error){
    console.log(error);
  }
}

// desc: Deletes Single Employee
// route: DELETE /api/employee/:EmployeeID
async function deleteEmployee(req, res, id) {
  try {
    const employee = await Employees.findByID(id);

    if(!employee) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: 'Employee Not Found'}));
    }
    else {
      await Employees.remove(id);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({message: `Employee ${id} removed!`}));
    }
  }
  catch (error) {
    console.log(error);
  }
}

module.exports = {
  getEmployees,
  getEmployeeLogin,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
}