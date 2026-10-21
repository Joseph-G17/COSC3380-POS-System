const Products = require("../models/OnlineStoreModel"); // Connect the controller to the OnlineStore Model to use function insdie

async function getProducts(req, res) {
  // try to get products, then send them to the browser
  try {
    // wait for the model to get products from MySQL
    const products = await Products.findAll();
    // 200 means success, and the response uses JSON
    res.writeHead(200, { "Content-Type": "application/json" });
    // turn products into JSON text, send it, then end this response
    res.end(JSON.stringify(products));
  } catch (error) {
    // if the code in try has an error, run this part
    // print the error in the server terminal
    console.log(error);

    // 500 means a server error, and the response uses JSON
    res.writeHead(500, { "Content-Type": "application/json" });
    // send an error message in JSON, then end this response
    res.end(JSON.stringify({ message: "Unable to load products" }));
  }
}

module.exports = {
  getProducts,
};
