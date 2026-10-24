// Load the shared database model; its findAll function reads rows from the named table.
// This controller handles HTTP while the model sends the SQL query to MySQL.
const Universal = require("../models/universalModel");
// server.js calls getProducts when the request is GET /api/products.
// req carries the incoming request; res sends the reply to ProductList in the browser.
// async allows this handler to await the database result before sending the products.
async function getProducts(req, res) {
  // Try the database read and response steps; an error moves execution to catch below.
  try {
    // Pass the fixed table name Items to the model, which runs SELECT * FROM Items.
    // await receives its rows as products; other requests can run while MySQL is working.
    const products = await Universal.findAll("Items");
    // Set HTTP 200 for success and tell the browser that the body will contain JSON.
    // These headers describe the reply; the next line sends the actual product rows.
    res.writeHead(200, { "Content-Type": "application/json" });
    // Convert the rows from a JavaScript array to JSON text and send it as the body.
    // end finishes this response; ProductList reads the body with response.json().
    res.end(JSON.stringify(products));
  } catch (error) {
    // Write the technical error to the server console so a failed request can be investigated.
    console.log(error);

    // Set HTTP 500 for a server failure while keeping the error reply in JSON format.
    res.writeHead(500, { "Content-Type": "application/json" });
    // Send a general error message and finish the failed response.
    // Keep database error details in the server console instead of the browser reply.
    res.end(JSON.stringify({ message: "Unable to load products" }));
  }
}

// Expose getProducts so server.js can load it and call it for the products route.
module.exports = {
  // This shorthand exports the same getProducts function under the name getProducts.
  getProducts,
};
