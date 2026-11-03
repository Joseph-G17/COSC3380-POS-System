const { findAllCategories } = require("../models/categoryModel");

// server.js calls this for GET /api/categories; Sidebar uses the IDs and names as filters.
async function getCategories(req, res) {
  try {
    // Wait for the category model, then send its array for the frontend checkboxes.
    const categories = await findAllCategories();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(categories));
  } catch (error) {
    // Keep database details here so the browser receives only a general error.
    console.error("Unable to load categories", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unable to load categories" }));
  }
}

module.exports = { getCategories };
