const Universal = require('../models/universalModel')
const {getPostData} = require('../utilities');


async function getOrders(req, res) {
  try {
    const orders = await Universal.findAll('orders');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(orders));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getOrders
}