const mysql = require('mysql2');

var pool = mysql.createPool({
  connectionLimit: Number(process.env.DB_CONNECTIONLIMIT) || 3,
  port: Number(process.env.DB_PORT) || 3306,
  host: process.env.DB_HOST ||'127.0.0.1',
  user: process.env.DB_USER ||'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydb'

});

// node --env-file=.env server.js

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
  query,
  getConnection: () => new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) return reject(error);
      resolve(connection);
    });
  })
}