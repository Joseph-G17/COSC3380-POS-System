const http = require('http');

const { getEmployees, getLogins,  getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('./controllers/employeeController')

//import the getProducts function from the OnlineStoreController
const { getProducts } = require('./controllers/OnlineStoreController');

const server = http.createServer((req, res) => {
  if(req.url === '/api/employees' && req.method === 'GET'){
    getEmployees(req, res);
  } 
  else if(req.url === '/api/logins' && req.method === 'GET'){
    getLogins(req, res);
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
  //for online store products
  else if(req.url === '/api/products' && req.method === 'GET'){ 
    getProducts(req, res);
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