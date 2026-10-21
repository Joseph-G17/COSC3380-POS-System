const Universal = require('../models/universalModel')
const {getPostData} = require('../utilities');


async function getSales(req, res) {
  try {
    const sales = await Universal.findAll('sales');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(sales));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getSales
}