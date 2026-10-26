// Load the shared query helper; it sends SQL through the configured MySQL connection pool.
const { query } = require("../sqlConnecter");

// The controller supplies username; this model finds the account without sending an HTTP response.
function findCustomerLogin(username) {
  // SELECT reads only CustomerID and the stored password value; WHERE matches the username.
  // Backticks surround the table name with spaces; ? receives the username value below.
  const sql =
    "SELECT CustomerID, CustomerPassword FROM `Customer Logins` WHERE CustomerUsername = ?";

  // [username] supplies the value for ? instead of joining user input into the SQL text.
  // query returns a Promise; return passes it to the controller so await can receive the rows.
  // No matching row gives an empty array; this function does not verify the password.
  return query(sql, [username]);
}

// Export the function so customerController can require it and call findCustomerLogin(username).
module.exports = {
  findCustomerLogin,
};
