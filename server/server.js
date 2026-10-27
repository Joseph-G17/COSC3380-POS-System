const http = require('http');

const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('./controllers/employeeController')
const {
  getEntities,
  adjustItemStock,
  createOrder,
  loginEmployee
} = require('./controllers/universalController');

const server = http.createServer((req, res) => {
  if(req.url === '/api/login' && req.method === 'POST'){
    loginEmployee(req, res);
  }
  else if(req.url === '/api/orders' && req.method === 'POST'){
    createOrder(req, res);
  }
  else if(req.url.match(/^\/api\/items\/([0-9]+)\/stock$/) && req.method === 'POST'){
    const id = req.url.split('/')[3];
    adjustItemStock(req, res, id);
  }
  else if(req.url === '/api/discounts' && req.method === 'GET'){
    getEntities(req, res, 'Discounts');
  }
  else if(req.url === '/api/items' && req.method === 'GET'){
    getEntities(req, res, 'Items');
  }
  else if(req.url === '/api/orders' && req.method === 'GET'){
    getEntities(req, res, 'Orders');
  }
  else if(req.url === '/api/sales' && req.method === 'GET'){
    getEntities(req, res, 'Sales');
  }
  else if(req.url === '/api/employees' && req.method === 'GET'){
    getEmployees(req, res);
  } 
  else if(req.url.match(/^\/api\/employees\/([0-9]+)$/) && req.method === 'GET'){ //req.params.id equivalent
    const id = req.url.split('/')[3]; // api/employee/1
    getEmployee(req, res, id);
  }
  else if(req.url === '/api/employees' && req.method === 'POST'){
    createEmployee(req, res);
  }
  else if(req.url.match(/^\/api\/employees\/([0-9]+)$/) && req.method === 'PUT'){
    const id = req.url.split('/')[3]; // api/employee/1
    updateEmployee(req, res, id);
  }
  else if(req.url.match(/^\/api\/employees\/([0-9]+)$/) && req.method === 'DELETE'){
    const id = req.url.split('/')[3]; // api/employee/1
    deleteEmployee(req, res, id);
  }
  else {
    res.writeHead(404,{'Content-Type': 'application/json' });
    res.end(JSON.stringify({message: '404: Route Not Found'}));
  }
})

/*  
EXPRESS ALTS: 
- app.get('/specificURL', () => { }) 
- /api/employees/:id == req.params.id      
*/

const PORT = process.env.PORT || 5000; //see if there is an environment variable
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));