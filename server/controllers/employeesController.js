const Employees = require('../models/employeeModel');
const Universal = require('../models/universalModel');

const { getPostData } = require('../utilities')

// desc: Gets the employee login information to verify if they exist and checks password
// route: GET /api/login

async function getEmployeeLogin(req, res){
  const body = await getPostData(req);
  const {username, password} = JSON.parse(body);
  
  const rows = await Employees.findEmployeeLogin(username);
  const login = rows[0]; //only returns one row in this query due to unique username

  if(!login || login.employeePassword != password){
    res.writeHead(401, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: 'Password does not match'}));
  }
  else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({employeeID: login.employeeID, firstName: login.firstName, Role: login.Role, departmentID: login.departmentID}));
  }
}

async function updateEmployeeHours(req, res) {
  try {
    const body = await getPostData(req);
    const {id, hoursWorked} = JSON.parse(body);

    await Employees.updateHours(id, hoursWorked);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `Employee Hours for ${id} updated with ${hoursWorked}!`}));

  } catch(error) {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: error.sqlMessage || 'Update failed'})); //send this to the front end when employee hours are over the limit!
  }

}

// desc: Gets an employee's username for Manage Employees
// route: GET /api/employee-login/:id
async function getLoginInfo(req, res, id) {
  try {
    const rows = await Employees.findLoginInfo(id);
    const username = rows.length > 0 ? rows[0].EmployeeUsername : ''; //new employees may not have a login yet

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ username }));
  } catch(error) {
    console.log(error);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load login'}));
  }
}

// desc: Changes an employee's username and/or password, or makes a login if they have none
// route: PUT /api/employee-login
async function updateLoginInfo(req, res) {
  try {
    const body = await getPostData(req);
    const {id, username, password} = JSON.parse(body);

    const rows = await Employees.findLoginInfo(id);

    if (rows.length === 0) {
      if (!username || !password) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ message: 'A new login needs a username and password'}));
      }
      await Employees.createLogin(id, username, password);
    }
    else {
      //only change the boxes that were filled in
      const changes = {};
      if (username) changes.EmployeeUsername = username;
      if (password) changes.EmployeePassword = password;

      if (Object.keys(changes).length === 0) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ message: 'Nothing to update'}));
      }
      await Employees.updateLogin(id, changes);
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `Login for ${id} updated!`}));
  } catch(error) {
    console.log(error);
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: error.sqlMessage || 'Update failed'})); //ex: username already taken
  }
}

/* ORIGINAL FORM FORM FOR CONTROLLERS
// desc: Update an Employee
// route: PUT /api/employees/id
async function updateEmployee(req, res, id){
  try {

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
*/

module.exports = {
  getEmployeeLogin,
  updateEmployeeHours,
  getLoginInfo,
  updateLoginInfo
}