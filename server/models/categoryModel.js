// Load the shared query helper, which sends SQL through the configured MySQL pool.
// {} takes the query function from the object exported by sqlConnecter.
const { query } = require("../sqlConnecter");

// The categories controller calls this model function to get checkbox data.
// This function reads MySQL rows; the controller is responsible for the HTTP reply.
function findAllCategories() {
  // Keep the SELECT statement as text so the query helper can send it to MySQL.
  // Read only ItemCategoryID and CategoryName, the fields needed for category checkboxes.
  // Backticks surround the table name because item categories contains a space.
  // Sort by name, then ID for equal names, so the category list has a consistent order.
  const sql =
    "SELECT ItemCategoryID, CategoryName FROM `Item Categories` ORDER BY CategoryName, ItemCategoryID";
  // Start the read and return its Promise to the controller, where await receives the rows.
  // No input values are needed because this query reads every category without a filter.
  return query(sql);
}

// Expose this function so categoriesController can load it and request category rows.
module.exports = { findAllCategories };
