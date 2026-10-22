// Reuse the shared query helper and its configured MySQL connection pool.
const { query } = require("../sqlConnecter");

// Keep the account lookup here; the controller handles the HTTP response.
function findCustomerLogin(username) {
  // Fetch only the customer ID and stored password value needed for login.
  const sql =
    "SELECT CustomerID, CustomerPassword FROM `Customer Logins` WHERE CustomerUsername = ?";

  // Supply username separately for the SQL ? placeholder instead of joining SQL text.
  // Return the Promise so the controller can await the result rows.
  return query(sql, [username]);
}

// Make the lookup function available to the customer controller.
module.exports = {
  findCustomerLogin,
};
