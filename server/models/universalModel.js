let { query } = require('../sqlConnecter');

function findAll(relation){
  const sql = `SELECT * FROM ${relation}`;
  return query(sql);
}

module.exports = {
  findAll,
}