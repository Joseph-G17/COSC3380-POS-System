let {query} = require('../sqlConnecter');

function findAll(){
    return query('SELECT ItemName, ItemPrice FROM Items');
}

module.exports = {
    findAll
}