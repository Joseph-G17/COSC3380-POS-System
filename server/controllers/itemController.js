const Items = require('../models/itemModel');

const { getPostData } = require('../utilities');
const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

async function adjustItemStock(req, res, id) {
  try {
    const items = await Items.findOne('Items', id);
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

    const stock = await Items.adjustItemStock(id, change);
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

    const createdOrder = await Items.createOrder({
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

async function loginEmployee(req, res) {
  let credentials;
  try {
    credentials = JSON.parse(await getPostData(req));
  } catch {
    res.writeHead(400, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({ message: 'Request body must be valid JSON' }));
  }

  const { username, password } = credentials ?? {};
  if (typeof username !== 'string' || username.trim().length === 0 ||
      typeof password !== 'string' || password.length === 0) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({ message: 'Username and password are required' }));
  }

  try {
    const employee = await Items.authenticateEmployee(username.trim(), password);
    if (!employee) {
      res.writeHead(401, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Invalid email/username or password' }));
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(employee));
  } catch (error) {
    console.error('Employee login failed', error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Unable to sign in right now' }));
  }
}

// desc: Gets all items
// route: GET /api/items
async function getItems(req, res) {
  try {
    const items = await Items.findAll();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unable to retrieve items' }));
  }
}

// desc: Gets a single item
// route: GET /api/items/:ItemID
async function getItem(req, res, id) {
  try {
    const item = await Items.findByID(id);

    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Item Not Found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(item));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unable to retrieve item' }));
  }
}

// desc: Creates an item
// route: POST /api/items
async function createItem(req, res) {
  try {
    const body = await getPostData(req);
    const { ItemCategoryID, ItemDescription, ItemPrice, Stock, RestockedDate } = JSON.parse(body);
    const item = { ItemCategoryID, ItemDescription, ItemPrice, Stock, RestockedDate };
    const newItem = await Items.create(item);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newItem));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unable to create item' }));
  }
}

// desc: Updates an item
// route: PUT /api/items/:ItemID
async function updateItem(req, res, id) {
  try {
    const item = await Items.findByID(id);

    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Item Not Found' }));
      return;
    }

    const body = await getPostData(req);
    const { ItemCategoryID, ItemDescription, ItemPrice, Stock, RestockedDate } = JSON.parse(body);
    const itemData = {
      ItemCategoryID: ItemCategoryID ?? item.ItemCategoryID,
      ItemDescription: ItemDescription ?? item.ItemDescription,
      ItemPrice: ItemPrice ?? item.ItemPrice,
      Stock: Stock ?? item.Stock,
      RestockedDate: RestockedDate ?? item.RestockedDate
    };
    const updatedItem = await Items.update(id, itemData);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedItem));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unable to update item' }));
  }
}

// desc: Deletes a single item
// route: DELETE /api/items/:ItemID
async function deleteItem(req, res, id) {
  try {
    const item = await Items.findByID(id);

    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Item Not Found' }));
      return;
    }

    await Items.remove(id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Item ${id} removed!` }));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unable to delete item' }));
  }
}

async function getitems(req, res) {
  try {
    const items = await Items.findAll('items');

    res.writeHead(200, {'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));

  } catch (error) {
    console.log(error);
  }
} 

module.exports = {
  getitems,
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  adjustItemStock,
  createOrder,
  loginEmployee
};
