let {query} = require('../sqlConnecter');

function findAll(){
    return query('SELECT ItemID, ItemName, ItemPrice FROM Items');
}

module.exports = {
    findAll
}