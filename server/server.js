const http = require('http');

const { getEmployeeLogin, updateEmployeeHours, getLoginInfo, updateLoginInfo } = require('./controllers/employeesController')
const { getEntities, getEntity, updateEntity, deleteEntity, getEntityColumns, createEntity, getOrderItems } = require('./controllers/universalController');
const { getReport } = require('./controllers/reportsController')
const { deleteDepartment } = require('./controllers/departmentsController')
const { getNotifications, readNotification } = require('./controllers/notificationsController')

//cashier:
const {adjustItemStock, createOrder, loginEmployee, getItems } = require('./controllers/itemController');

// Load the customer handlers; their specific routes must precede generic entity routes.
const { getProducts } = require('./controllers/OnlineStoreController');
const { getCategories } = require('./controllers/categoriesController');
const {
  signupCustomer,
  loginCustomer,
  updateProfile,
} = require('./controllers/customerController');

const { getOrderHistory, placeOnlineOrder, checkDiscount } = require('./controllers/customerOrderController');

const customerRoutes = {
  '/api/customer/signup': { POST: signupCustomer },
  '/api/customer/login': { POST: loginCustomer },
  '/api/customer/orders': { GET: getOrderHistory, POST: placeOnlineOrder },
  '/api/customer/discount': { GET: checkDiscount },
  '/api/customer/profile': { PUT: updateProfile },
};


const handler = (req, res) => {
  const incoming = new URL(req.url, 'http://localhost');
  const path = incoming.searchParams.get('path');
  if (path !== null) {
    incoming.searchParams.delete('path');
    const rest = incoming.searchParams.toString();  
    req.url = '/api/' + path + (rest ? '?' + rest : ''); // change req.url if rest of url exists after path: /api/products?rest or /api/products
  }

  try { //keeps spaced strings readable as url's after ?
    const [pathname, search] = req.url.split('?');
    req.url = decodeURIComponent(pathname) + (search ? '?' + search : ''); //if search space exists in type add it if not don't add anything
  } catch (error) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({message: 'Bad URL'}));
  }

  // Match a customer form URL without its query string, then call its handler below.
  const customerRoute = customerRoutes[req.url.split('?')[0]];
  if (customerRoute) {
    res.setHeader('Cache-Control', 'no-store');
    if (!Object.hasOwn(customerRoute, req.method)) {
      res.writeHead(405, {
        'Content-Type': 'application/json',
        Allow: Object.keys(customerRoute).join(', '),
      });
      return res.end(JSON.stringify({ message: 'Method not allowed' }));
    }
    return customerRoute[req.method](req, res);
  }

  if(req.url === '/api/login' && req.method === 'POST'){
    getEmployeeLogin(req, res);
  }

  else if(req.url.split('?')[0] === '/api/orders' && req.method === 'POST'){
    createOrder(req, res);
  }
  else if(req.url.split('?')[0] === '/api/Items' && req.method === 'GET'){
    getItems(req, res);
  }
  else if(req.url.split('?')[0].match(/^\/api\/Items\/([0-9]+)\/stock$/) && req.method === 'POST'){
    const [, id] = req.url.split('?')[0].match(/^\/api\/Items\/([0-9]+)\/stock$/);
    adjustItemStock(req, res, id);}

  else if(req.url === '/api/employee-hours' && req.method === 'PUT'){
    updateEmployeeHours(req, res);
  }
  else if(req.url.match(/^\/api\/employee-login\/([0-9]+)$/) && req.method === 'GET'){
    const id = req.url.split('/')[3]; // ['', 'api', 'employee-login', '1']
    getLoginInfo(req, res, id);
  }
  else if(req.url === '/api/employee-login' && req.method === 'PUT'){
    updateLoginInfo(req, res);
  }
  //has to be above the universal routes or it gets read as an entity
  else if(req.url === '/api/notifications' && req.method === 'GET'){
    getNotifications(req, res);

  }
  else if(req.url.match(/^\/api\/notifications\/([0-9]+)$/) && req.method === 'PUT'){
    const id = req.url.split('/')[3]; // ['', 'api', 'notifications', '5']
    readNotification(req, res, id);
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
  //BELOW IS UNIVERSAL
  else if(req.url.match(/^\/api\/([A-Za-z ]+)$/) && req.method === 'GET'){
    const entity = req.url.split('/')[2];
    getEntities(req, res, entity);
  }
  else if(req.url.match(/^\/api\/Orders\/([0-9]+)\/items$/) && req.method === 'GET'){
    const id = req.url.split('/')[3]; // ['', 'api', 'Orders', '4', 'items']
    getOrderItems(req, res, id);
  }
  //ids are a number, or "12-5" for two-column keys (Sale Items, Seasonal Deals)
  else if(req.url.match(/^\/api\/([A-Za-z ]+)\/([0-9]+(?:-[0-9]+)?)$/) && req.method === 'GET'){
    const [, , entity, id] = req.url.split('/');
    getEntity(req, res, entity, id);
  }
  else if(req.url.match(/^\/api\/([A-Za-z ]+)\/columns$/) && req.method === 'GET'){
    const entity = req.url.split('/')[2]; // ['', 'api', 'Employees', 'columns']
    getEntityColumns(req, res, entity);
  }
  else if(req.url.match(/^\/api\/([A-Za-z ]+)$/) && req.method === 'POST'){
    const entity = req.url.split('/')[2];
    createEntity(req, res, entity);
  }
  else if(req.url.match(/^\/api\/([A-Za-z ]+)\/([0-9]+(?:-[0-9]+)?)$/) && req.method === 'PUT'){
    const [, , entity, id] = req.url.split('/'); // ['', 'api', 'Employees', '1']
    updateEntity(req, res, entity, id);
  }
  else if(req.url.match(/^\/api\/Departments\/([0-9]+)\?/) && req.method === 'DELETE'){
    const url = new URL(req.url, 'http://localhost');
    const id = url.pathname.split('/')[3]; // ['', 'api', 'Departments', '2']
    deleteDepartment(req, res, id, url.searchParams.get('moveTo'));
  }
  else if(req.url.match(/^\/api\/([A-Za-z ]+)\/([0-9]+(?:-[0-9]+)?)$/) && req.method === 'DELETE'){
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
    res.end(JSON.stringify({message: '404: Route Not Found'}));
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
