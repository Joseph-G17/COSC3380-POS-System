// Use the shared helper to send SQL queries to MySQL.
let {query} = require('../sqlConnecter');

// Read the fields needed by the product cards.
function findAll(){
    // ItemID identifies each card; the name and price are displayed.
    return query('SELECT ItemID, ItemName, ItemPrice FROM Items');
}

// Let the controller call findAll().
module.exports = {
    findAll
}