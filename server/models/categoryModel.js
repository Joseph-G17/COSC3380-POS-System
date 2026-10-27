const { query } = require("../sqlConnecter");

// getCategories calls this query; return its Promise so the controller can await the rows.
function findAllCategories() {
  // Backticks handle the space in the table name; sorting keeps checkbox order consistent.
  const sql =
    "SELECT ItemCategoryID, CategoryName FROM `Item Categories` ORDER BY CategoryName, ItemCategoryID";
  return query(sql);
}

module.exports = { findAllCategories };
