const Universal = require('../models/universalModel');
const { getPostData } = require('../utilities');

const ENTITIES = ['Employees', 'Orders', 'Items', 'Item Categories', 'Discounts', 'Sales', 'Departments', 'Returns', 'Inventory', 'Customers'];

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
  getEntity,
  updateEntity,
  deleteEntity,
  getEntityColumns,
  createEntity
}