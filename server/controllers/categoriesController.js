// Load the category model function that reads checkbox IDs and labels from MySQL.
// {} takes findAllCategories from the object exported by that model file.
const { findAllCategories } = require("../models/categoryModel");

// server.js calls this handler when the request is GET /api/categories.
// req is the incoming request; res sends the reply that OnlineStorePage reads.
// async allows await to receive the database rows before the response is sent.
async function getCategories(req, res) {
  // Try reading and sending categories; a database or response error moves to catch below.
  try {
    // Ask the model for the real category rows, then wait for its Promise to finish.
    // Save the returned array as categories, including [] when no categories exist.
    const categories = await findAllCategories();
    // Send HTTP 200 for success and declare that the response body is JSON.
    res.writeHead(200, { "Content-Type": "application/json" });
    // Convert the category array to JSON text, send it, and finish this response.
    // OnlineStorePage gives these rows to Sidebar so its checkboxes use real IDs and names.
    res.end(JSON.stringify(categories));
  } catch (error) {
    // Write the technical failure to the server console so it can be investigated.
    console.error("Unable to load categories", error);
    // Report a server failure with HTTP 500 and keep the error body in JSON format.
    res.writeHead(500, { "Content-Type": "application/json" });
    // Send a general message and finish the response without revealing database details.
    // The frontend can then show its category error instead of treating this as an empty list.
    res.end(JSON.stringify({ message: "Unable to load categories" }));
  }
}

// Export getCategories so server.js can load this handler for the matching route.
module.exports = { getCategories };
