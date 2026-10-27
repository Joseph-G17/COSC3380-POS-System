const Universal = require('../models/universalModel');
const { getPostData } = require('../utilities');
const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

const ENTITIES = ['Employees', 'Orders', 'Items', 'Discounts', 'Sales', 'Departments', 'Returns', 'Inventory'];

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

async function adjustItemStock(req, res, id) {
  try {
    const items = await Universal.findOne('Items', id);
    if (items.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Item Not Found' }));
    }

    const body = await getPostData(req);
    const { change } = JSON.parse(body);
    if (change !== 1 && change !== -1) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Stock change must be 1 or -1' }));
    }

    const stock = await Universal.adjustItemStock(id, change);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ ItemID: Number(id), Stock: stock }));
  } catch (error) {
    console.error(error);
    const statusCode = error.message.includes('Stock') || error.message.includes('employee exists')
      ? 409
      : 500;
    res.writeHead(statusCode, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: error.message || 'Could not adjust item stock' }));
  }
}

async function createOrder(req, res) {
  try {
    let order;
    try {
      order = JSON.parse(await getPostData(req));
    } catch {
      res.writeHead(400, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Request body must be valid JSON' }));
    }

    const { employeeId, customerId, paymentMethod, items } = order ?? {};
    if (!isPositiveInteger(employeeId) || !isPositiveInteger(customerId)) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Cashier employee ID and customer ID must be positive integers' }));
    }

    if (!['Card', 'Cash', 'Giftcard'].includes(paymentMethod)) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Payment method must be Card, Cash, or Giftcard' }));
    }

    if (!Array.isArray(items) || items.length === 0 || items.some((item) =>
      !item || !isPositiveInteger(item.itemId) ||
      !isPositiveInteger(item.quantity) || item.quantity > 65535
    )) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Order must include items with positive item IDs and quantities' }));
    }

    if (new Set(items.map((item) => item.itemId)).size !== items.length) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Each item may only appear once in the order' }));
    }

    const createdOrder = await Universal.createOrder({
      employeeId,
      customerId,
      paymentMethod,
      items
    });
    res.writeHead(201, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(createdOrder));
  } catch (error) {
    if (!error.statusCode) console.error(error);
    res.writeHead(error.statusCode || 500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      message: error.statusCode ? error.message : 'Could not create order'
    }));
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

    await Universal.deleteOne(entity, id);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `${entity} ${id} removed!`}));
  } catch (error) {
    console.log(error);

    res.writeHead(404, {'Content-Type': 'application/json'});
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
  getEntities,
  adjustItemStock,
  createOrder,
  getEntity,
  updateEntity,
  deleteEntity,
  getEntityColumns,
  createEntity
}