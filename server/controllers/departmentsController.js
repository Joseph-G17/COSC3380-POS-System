const Universal = require('../models/universalModel')
const { mergeDepartment } = require('../models/departmentModel');
const {getPostData} = require('../utilities');


async function getDepartments(req, res) {
  try {
    const departments = await Universal.findAll('departments');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(departments));

  } catch (error) {
    console.log(error);
  }
}

// desc: Move a department's employees to another department, then delete it
// route: DELETE /api/Departments/:id?moveTo=:newId
async function deleteDepartment(req, res, id, moveTo) {
  const sendJson = (status, body) => {
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(body));
  };

  const oldDept = Number(id);
  const newDept = Number(moveTo);

  if (!Number.isInteger(newDept) || newDept <= 0) {
    return sendJson(400, { message: 'Choose a department to move the employees to.' });
  }
  if (oldDept === newDept) {
    return sendJson(400, { message: 'Employees must be moved to a different department.' });
  }

  try {
    const { employeesMoved } = await mergeDepartment(oldDept, newDept);
    sendJson(200, { message: `Department ${oldDept} removed, ${employeesMoved} employee(s) moved.`, employeesMoved });
  } catch (error) {
    console.log(error);
    sendJson(error.status || 500, { message: error.status ? error.message : (error.sqlMessage || 'Delete failed') });
  }
}

module.exports = {
  getDepartments,
  deleteDepartment
}
