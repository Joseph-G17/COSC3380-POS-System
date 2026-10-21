const http = require("http");

const {
  getEmployees,
  getEmployeeLogin,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("./controllers/employeesController");
const { getOrders } = require("./controllers/ordersController");
const { getDepartments } = require("./controllers/departmentsController");
const { getInventory } = require("./controllers/inventoryController");
const { getDiscounts } = require("./controllers/discountsController");
const { getSales } = require("./controllers/salesController");
const { getReturns } = require("./controllers/returnsController");

//import the getProducts function from the OnlineStoreController
const { getProducts } = require("./controllers/OnlineStoreController");

const server = http.createServer((req, res) => {
  if (req.url === "/api/employees" && req.method === "GET") {
    getEmployees(req, res);
  } else if (req.url === "/api/login" && req.method === "POST") {
    getEmployeeLogin(req, res);
  } else if (
    req.url.match(/^\/api\/employees\/([0-9]+)$/) &&
    req.method === "GET"
  ) {
    //req.params.id equivalent
    const id = req.url.split("/")[3]; // api/employee/1
    getEmployee(req, res, id);
  } else if (req.url === "/api/employees" && req.method === "POST") {
    createEmployee(req, res);
  } else if (
    req.url.match(/^\/api\/employees\/([0-9]+)$/) &&
    req.method === "PUT"
  ) {
    const id = req.url.split("/")[3]; // api/employee/1
    updateEmployee(req, res, id);
  } else if (
    req.url.match(/^\/api\/employees\/([0-9]+)$/) &&
    req.method === "DELETE"
  ) {
    const id = req.url.split("/")[3]; // api/employee/1
    deleteEmployee(req, res, id);
  }

  //for online store products
  else if (req.url === "/api/products" && req.method === "GET") {
    getProducts(req, res);
  } else if (req.url == "/api/orders" && req.method === "GET") {
    getOrders(req, res);
  } else if (req.url == "/api/sales" && req.method === "GET") {
    getSales(req, res);
  } else if (req.url == "/api/departments" && req.method === "GET") {
    getDepartments(req, res);
  } else if (req.url == "/api/inventory" && req.method === "GET") {
    getInventory(req, res);
  } else if (req.url == "/api/discounts" && req.method === "GET") {
    getDiscounts(req, res);
  } else if (req.url == "/api/returns" && req.method === "GET") {
    getReturns(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "404: Route Not Found" }));
  }
});

/*  
EXPRESS ALTS: 
- app.get('/specificURL', () => { }) 
- /api/employees/:id == req.params.id      
*/

const PORT = process.env.PORT || 5000; //see if there is an environment variable
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
