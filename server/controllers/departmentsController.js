const Universal = require('../models/universalModel')
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

module.exports = {
  getDepartments
}