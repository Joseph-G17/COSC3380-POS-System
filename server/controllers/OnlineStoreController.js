const Item = require("../models/itemModel");

// server.js calls this for GET /api/products; ProductList receives the Items array.
async function getProducts(req, res) {
  try {
    // Include the total stock for each item in the shop.
    const products = await Item.findall("Items");
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
