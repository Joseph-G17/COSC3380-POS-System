const {universal} = require('../models/universalModel')
const {getPostData} = require('../utilities');


async function getInventory(req, res) {
  try {
    const inventory = await Universal.findAll('inventory');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(inventory));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getInventory
}