const Universal = require("../models/universalModel");

// server.js calls this for GET /api/products; ProductList receives the Items array.
async function getProducts(req, res) {
  try {
    // Wait for the shared model, including an empty array when Items has no rows.
    const products = await Universal.findAll("Items");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
  } catch (error) {
    // Keep database error details on the server and send a general reply.
    console.log(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unable to load products" }));
  }
}

module.exports = {
  getProducts,
};
