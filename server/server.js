const http = require('http');

const { getEmployees, getEmployeeLogin } = require('./controllers/employeesController')
const { getOrders } = require('./controllers/ordersController');
const { getDepartments } = require('./controllers/departmentsController');
const { getInventory } = require('./controllers/inventoryController');
const { getDiscounts } = require('./controllers/discountsController');
const { getSales } = require('./controllers/salesController');
const { getReturns } = require('./controllers/returnsController');
const { getItems } = require('./controllers/itemController')
const { getEntities, getEntity, updateEntity, deleteEntity, getEntityColumns, createEntity } = require('./controllers/universalController');

const server = http.createServer((req, res) => {
  if(req.url === '/api/login' && req.method === 'POST'){
    getEmployeeLogin(req, res);
  }
  else if(req.url.match(/^\/api\/([A-Za-z]+)$/) && req.method === 'GET'){
    const entity = req.url.split('/')[2];
    getEntities(req, res, entity);
  }
  else if(req.url.match(/^\/api\/([A-Za-z]+)\/([0-9]+)$/) && req.method === 'GET'){
    const [, , entity, id] = req.url.split('/');
    getEntity(req, res, entity, id);
  }
  else if(req.url.match(/^\/api\/([A-Za-z]+)\/columns$/) && req.method === 'GET'){
    const entity = req.url.split('/')[2]; // ['', 'api', 'Employees', 'columns']
    getEntityColumns(req, res, entity);
  }
  else if(req.url.match(/^\/api\/([A-Za-z]+)$/) && req.method === 'POST'){
    const entity = req.url.split('/')[2];
    createEntity(req, res, entity);
  }
  else if(req.url.match(/^\/api\/([A-Za-z]+)\/([0-9]+)$/) && req.method === 'PUT'){
    const [, , entity, id] = req.url.split('/'); // ['', 'api', 'Employees', '1']
    updateEntity(req, res, entity, id);
  }
  else if(req.url.match(/^\/api\/([A-Za-z]+)\/([0-9]+)$/) && req.method === 'DELETE'){
    const [, , entity, id] = req.url.split('/'); 
    deleteEntity(req, res, entity, id);
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