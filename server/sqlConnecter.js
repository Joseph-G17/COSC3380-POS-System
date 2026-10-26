const mysql = require('mysql2');

var pool = mysql.createPool({
  connectionLimit: Number(process.env.DB_CONNECTIONLIMIT) || 2,
  port: Number(process.env.DB_PORT) || 3306,
  host: process.env.DB_HOST ||'127.0.0.1',
  user: process.env.DB_USER ||'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydb',

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined

});

// node --env-file=.env server.js

function query(sql, params){
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if(error) return reject(error);
      resolve(results);
    });
  });
}

module.exports = {
  query
}
