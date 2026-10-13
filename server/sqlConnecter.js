const mysql = require('mysql2');

var pool = mysql.createPool({
  connectionLimit: 3,
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'mydb'

});

function query(sql, params){
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if(error) return reject(error);
      console.log('Query Confirmed!')
      resolve(results);
    });
  });
}

module.exports = {
  query
}