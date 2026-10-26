const mysql = require('mysql2');

const fs = require('node:fs');
let sslOptions;

//Read the CA file when this connection use SSL
if(process.env.DB_SSL === 'true'){
  const caPath = process.env.DB_SSL_CA_PATH;

  if(!caPath){
    throw new Error('DB_SSL_CA_PATH is required when DB_SSL is true');
  }

  const ca = fs.readFileSync(caPath, 'utf8');
  
  if(ca.trim()===''){
    throw new Error('The CA certificate file is empty');
  }

  sslOptions = {
    ca: ca,
    rejectUnauthorized: true,
    verifyIdentity: true,
  };
}

var pool = mysql.createPool({
  connectionLimit: Number(process.env.DB_CONNECTIONLIMIT) || 2,
  port: Number(process.env.DB_PORT) || 3306,
  host: process.env.DB_HOST ||'127.0.0.1',
  user: process.env.DB_USER ||'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydb',

  ssl : sslOptions

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
