const http = require('http');

const { getEmployeeLogin } = require('./controllers/employeesController')
const { getEntities, getEntity, updateEntity, deleteEntity, getEntityColumns, createEntity } = require('./controllers/universalController');
const { getReport } = require('./controllers/reportsController')

// Load the customer handlers; their specific routes must precede generic entity routes.
const { getProducts } = require('./controllers/OnlineStoreController');
const { getCategories } = require('./controllers/categoriesController');

const handler = (req, res) => {
  if(req.url === '/api/login' && req.method === 'POST'){
    getEmployeeLogin(req, res);
  }
  // ProductList and Sidebar need these customer APIs before generic table matching.
  else if(req.url === '/api/products' && req.method === 'GET'){
    getProducts(req, res);
  }
  else if(req.url === '/api/categories' && req.method === 'GET'){
    getCategories(req, res);
  }
  else if(req.url === '/api/sales' && req.method === 'GET'){
    // AnnouncementBar keeps its lowercase URL; use the shared controller's Sales entity.
    getEntities(req, res, 'Sales');
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
  else if(req.url.match(/^\/api\/reports\/([A-Za-z]+)/) && req.method === 'GET'){
    const url = new URL(req.url, 'http://localhost');
    const report = url.pathname.split('/')[3]; // ['', 'api', 'reports', 'SalesSummary']

    const filters = {};
    url.searchParams.forEach((value, key) => {
      filters[key] = value;
    });

    getReport(req, res, report, filters);
  }
  else {
    res.writeHead(404,{'Content-Type': 'application/json' });
    res.end(JSON.stringify({message: '404: Route Not Found', url: req.url, method: req.method}));
  }
}

module.exports = handler;
/*  
EXPRESS ALTS: 
- app.get('/specificURL', () => { }) 
- /api/employees/:id == req.params.id      
*/
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  http.createServer(handler).listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
//const PORT = process.env.PORT || 5000; //see if there is an environment variable
//server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
