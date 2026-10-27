const Items = require('../models/itemModel');

const { getPostData } = require('../utilities');

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

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
};