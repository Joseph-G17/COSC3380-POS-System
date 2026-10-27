const mysql = require('mysql2');
const fs = require('node:fs');

let sslOptions;

// Azure uses Node's trusted public CAs or an explicitly configured CA file.
if (process.env.DB_SSL === 'true') {
  sslOptions = { rejectUnauthorized: true, verifyIdentity: true };
  const caPath = process.env.DB_SSL_CA_PATH;
  if (caPath) {
    const ca = fs.readFileSync(caPath, 'utf8');
    if (ca.trim() === '') {
      throw new Error('The CA certificate file is empty');
    }
    sslOptions.ca = ca;
  }
}

// The .env values select the MySQL server, login and database for every model.
const pool = mysql.createPool({
  connectionLimit: Number(process.env.DB_CONNECTIONLIMIT) || 2,
  port: Number(process.env.DB_PORT) || 3306,
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mydb',
  ssl: sslOptions,
});

// Models pass SQL and separate values; the returned Promise supplies the query result.
function query(sql, params) {
  return new Promise((resolve, reject) => {
    // mysql2 calls this when the query finishes; reject errors or return its result.
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

// createCustomer supplies work; run all its queries on one connection and save together.
async function withTransaction(work) {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    // Give the model a query function tied to this transaction's connection.
    const result = await work(async (sql, params) => {
      const [rows] = await connection.query(sql, params);
      return rows;
    });
    // Both inserts succeeded, so keep their changes and return the model's result.
    await connection.commit();
    return result;
  } catch (error) {
    try {
      // Undo a failed transaction so signup cannot leave only one linked row.
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Customer transaction rollback failed:', rollbackError.code);
    }
    throw error;
  } finally {
    // Return this checked-out connection to the pool after success or failure.
    connection.release();
  }
}

module.exports = { query, withTransaction };
