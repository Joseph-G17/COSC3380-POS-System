const Universal = require('../models/universalModel')
const {getPostData} = require('../utilities');


async function getItems(req, res) {
  try {
    const items = await Universal.findAll('items');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getItems
}