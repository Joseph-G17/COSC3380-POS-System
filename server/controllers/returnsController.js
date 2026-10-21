const Universal = require('../models/universalModel')
const {getPostData} = require('../utilities');


async function getReturns (req, res) {
  try {
    const returns = await Universal.findAll('returns');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(returns));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getReturns
}