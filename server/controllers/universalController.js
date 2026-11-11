const Universal = require('../models/universalModel');
const { getPostData } = require('../utilities');

const ENTITIES = ['Employees', 'Orders', 'Items', 'Item Categories', 'Discounts', 'Sales', 'Departments', 'Returns', 'Inventory', 'Customers', 'Employee Hours', 'Shipments',
  'Seasons', 'Sale Items', 'Seasonal Deals'];

//history the admin can look at but not rewrite:
//- Orders: view only, the one change allowed is canceling a completed order
//- Returns: view only
//- Shipments: editable/deletable until they arrive, then view only
//returns a message when the action isn't allowed, null when it is
function checkRules(action, entity, row, changes) {
  if (entity === 'Returns') return 'Returns are view only.';

  if (entity === 'Orders') {
    if (action === 'create') return 'Orders are made at the register or online store, not here.';
    if (action === 'delete') return 'Orders cannot be deleted. Cancel the order instead.';
    const fields = Object.keys(changes);
    if (fields.length !== 1 || fields[0] !== 'OrderStatus' || changes.OrderStatus !== 'Canceled') {
      return 'Orders are view only. The only change allowed is canceling the order.';
    }
    if (row.OrderStatus === 'Canceled') return 'This order is already canceled.';
  }

  if (entity === 'Shipments' && action !== 'create' && row.ArrivalDate !== null) {
    return 'This shipment has already arrived and can no longer be edited or deleted.';
  }

  return null;
}

function refuse(res, message) {
  res.writeHead(403, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ message }));
}

// desc: The items inside one order
// route: GET /api/Orders/:id/items
async function getOrderItems(req, res, id) {
  try {
    const rows = await Universal.findOrderItems(id);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(rows));
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load the order items'}));
  }
}

// desc: Gets all rows of any entity
// route: GET /api/:entity
async function getEntities(req, res, entity) {
  try {
    if (!ENTITIES.includes(entity)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Entity Not Found'}));
    }

    const rows = await Universal.findAll(entity);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(rows));
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load data'}));
  }
}
// desc: Gets a single row of any entity
// route: GET /api/:entity/:id
async function getEntity(req, res, entity, id) {
  try {
    if (!ENTITIES.includes(entity)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Entity Not Found'}));
    }

    const rows = await Universal.findOne(entity, id);
    if (rows.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: `${entity} ${id} Not Found`}));
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(rows));
  } catch (error) {
    console.log(error);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load data'}));
  }
}
// desc: Update a single row of any entity
// route: PUT /api/:entity/:id
async function updateEntity(req, res, entity, id) {
  try {
    if (!ENTITIES.includes(entity)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Entity Not Found'}));
    }

    const rows = await Universal.findOne(entity, id);
    if (rows.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: `${entity} ${id} Not Found`}));
    }

    const body = await getPostData(req);
    const changes = JSON.parse(body);

    const blocked = checkRules('update', entity, rows[0], changes);
    if (blocked) return refuse(res, blocked);

    //The cancel trigger in the database saves CanceledDate in Houston time

    await Universal.updateOne(entity, id, changes);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `${entity} ${id} updated!`}));
  } catch (error) {
    console.log(error);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: error.sqlMessage || 'Update failed'}));
  }
}

// desc: Delete a single row of any entity
// route: DELETE /api/:entity/:id
async function deleteEntity(req, res, entity, id) {
  try {
    if (!ENTITIES.includes(entity)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'entity Not Found'}));
    }

    const rows = await Universal.findOne(entity, id);
    if (rows.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: `${entity} ${id} Not Found`}));
    }

    const blocked = checkRules('delete', entity, rows[0]);
    if (blocked) return refuse(res, blocked);

    await Universal.deleteOne(entity, id);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `${entity} ${id} removed!`}));
  } catch (error) {
    console.log(error);

    // 1451: another table still points at this row (ON DELETE RESTRICT)
    if (error.errno === 1451) {
      res.writeHead(409, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({
        message: `This ${entity} record is still used by other records (orders, hours, employees, etc.) and can't be deleted.`
      }));
    }

    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: error.sqlMessage || 'Delete failed'}));
  }
}

// desc: Gets the columns of any entity
// route: GET /api/:entity/columns
async function getEntityColumns(req, res, entity) {
  try {
    if (!ENTITIES.includes(entity)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'entity Not Found'}));
    }

    const columns = await Universal.getColumns(entity);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(columns));
  } catch (error) {
    console.log(error);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load columns'}));
  }
}

// desc: Create a row in any entity
// route: POST /api/:entity
async function createEntity(req, res, entity) {
  try {
    if (!ENTITIES.includes(entity)) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'entity Not Found'}));
    }

    const blocked = checkRules('create', entity);
    if (blocked) return refuse(res, blocked);

    const body = await getPostData(req);
    const newRow = JSON.parse(body);

    const result = await Universal.insertOne(entity, newRow);

    res.writeHead(201, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `${entity} ${result.insertId} created!`, id: result.insertId }));
  } catch (error) {
    console.log(error);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: error.sqlMessage || 'Create failed'}));
  }
}

module.exports = {
  getOrderItems,
  getEntities,
  getEntity,
  updateEntity,
  deleteEntity,
  getEntityColumns,
  createEntity
}