const Universal = require('../models/universalModel')
const {getPostData} = require('../utilities');


async function getDiscounts(req, res) {
  try {
    const discounts = await Universal.findAll('discounts');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(discounts));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getDiscounts
}