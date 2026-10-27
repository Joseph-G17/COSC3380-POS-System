let { query, getConnection } = require('../sqlConnecter');

const ID_FIELDS = {
  Employees: 'EmployeeID',
  Orders: 'OrderID',
  Items: 'ItemID',
  Discounts: 'DiscountID',
  Sales: 'SaleID',
  Departments: 'DepartmentID',
  Returns: 'ReturnID'
}

function findAll(entity){
  if (entity === 'Items') {
    const sql = `SELECT Items.*, COALESCE(SUM(Inventory.Stock), 0) AS Stock
      FROM Items
      LEFT JOIN Inventory ON Inventory.ItemID = Items.ItemID
      GROUP BY Items.ItemID`;
    return query(sql);
  }

  const sql = `SELECT * FROM ${entity}`;
  return query(sql);
}

function findOne(entity, id){
  const idField = ID_FIELDS[entity];
  const sql = `SELECT * FROM ${entity} WHERE ${idField} = ?`
  console.log(idField, entity, id);
  return query(sql, [id]);
}

function updateOne(entity, id, data){
  const idField = ID_FIELDS[entity];
  const sql = `UPDATE ?? SET ? WHERE ?? = ?`;
  return query(sql, [entity, data, idField, id]);
}

function deleteOne(entity, id){
  const idField = ID_FIELDS[entity];
  const sql = `DELETE FROM ?? WHERE ?? = ?`;
  return query(sql, [entity, idField, id]);
}

function getColumns(entity){
  const sql = `SHOW COLUMNS FROM ??`;
  return query(sql, [entity]);
}

function insertOne(entity, data){
  const sql = `INSERT INTO ?? SET ?`;
  return query(sql, [entity, data]);
}

async function adjustItemStock(id, change) {
  if (change === -1) {
    const result = await query(
      'UPDATE `Inventory` SET `Stock` = `Stock` - 1 WHERE `ItemID` = ? AND `Stock` > 0 ORDER BY `InventoryID` LIMIT 1',
      [id]
    );

    if (result.affectedRows === 0) {
      const inventory = await query(
        'SELECT `InventoryID` FROM `Inventory` WHERE `ItemID` = ? LIMIT 1',
        [id]
      );

      if (inventory.length === 0) {
        throw new Error('Stock is already zero');
      }

      throw new Error('Stock cannot go below zero');
    }
  } else {
    const result = await query(
      'UPDATE `Inventory` SET `Stock` = `Stock` + 1 WHERE `ItemID` = ? AND `Stock` < 65535 ORDER BY `InventoryID` LIMIT 1',
      [id]
    );

    if (result.affectedRows === 0) {
      const inventory = await query(
        'SELECT `InventoryID` FROM `Inventory` WHERE `ItemID` = ? LIMIT 1',
        [id]
      );

      if (inventory.length > 0) {
        throw new Error('Stock has reached its maximum value');
      }

      const inserted = await query(
        'INSERT INTO `Inventory` (`ItemID`, `EmployeeID`, `Stock`) SELECT ?, `EmployeeID`, 1 FROM `Employees` ORDER BY `EmployeeID` LIMIT 1',
        [id]
      );

      if (inserted.affectedRows === 0) {
        throw new Error('Cannot add stock because no employee exists in the database');
      }
    }
  }

  const rows = await query(
    'SELECT COALESCE(SUM(`Stock`), 0) AS `Stock` FROM `Inventory` WHERE `ItemID` = ?',
    [id]
  );
  return rows[0].Stock;
}

async function createOrder({ employeeId, customerId, paymentMethod, items }) {
  const connection = await getConnection();
  const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });

  try {
    await new Promise((resolve, reject) => {
      connection.beginTransaction((error) => error ? reject(error) : resolve());
    });

    const employees = await runQuery(
      'SELECT `EmployeeID` FROM `Employees` WHERE `EmployeeID` = ?',
      [employeeId]
    );
    if (employees.length === 0) {
      const error = new Error('Cashier employee ID was not found');
      error.statusCode = 404;
      throw error;
    }

    const customers = await runQuery(
      'SELECT `CustomerID` FROM `Customers` WHERE `CustomerID` = ?',
      [customerId]
    );
    if (customers.length === 0) {
      const error = new Error('Customer ID was not found');
      error.statusCode = 404;
      throw error;
    }

    const sortedItems = [...items].sort((left, right) => left.itemId - right.itemId);
    const itemPlaceholders = sortedItems.map(() => '?').join(', ');
    const itemRows = await runQuery(
      `SELECT \`ItemID\`, \`ItemPrice\` FROM \`Items\` WHERE \`ItemID\` IN (${itemPlaceholders}) ORDER BY \`ItemID\` FOR UPDATE`,
      sortedItems.map((item) => item.itemId)
    );
    const pricesById = new Map(itemRows.map((row) => [Number(row.ItemID), Number(row.ItemPrice)]));
    let totalInCents = 0;
    const orderItems = sortedItems.map((item) => {
      const price = pricesById.get(item.itemId);
      if (price == null) {
        const error = new Error(`Item ${item.itemId} was not found`);
        error.statusCode = 404;
        throw error;
      }

      const priceInCents = Math.round(price * 100);
      if (!Number.isSafeInteger(priceInCents) || priceInCents < 1) {
        const error = new Error(`Item ${item.itemId} has an unsupported price`);
        error.statusCode = 400;
        throw error;
      }

      totalInCents += priceInCents * item.quantity;
      return { itemId: item.itemId, quantity: item.quantity, priceInCents };
    });

    if (totalInCents <= 0 || totalInCents > 9999999999) {
      const error = new Error('The order total is outside the supported range');
      error.statusCode = 400;
      throw error;
    }

    const inventoryRows = await runQuery(
      `SELECT \`InventoryID\`, \`ItemID\`, \`Stock\` FROM \`Inventory\` WHERE \`ItemID\` IN (${itemPlaceholders}) ORDER BY \`ItemID\`, \`InventoryID\` FOR UPDATE`,
      sortedItems.map((item) => item.itemId)
    );
    const inventoryByItemId = new Map();
    for (const inventory of inventoryRows) {
      const itemId = Number(inventory.ItemID);
      const itemInventory = inventoryByItemId.get(itemId) ?? [];
      itemInventory.push(inventory);
      inventoryByItemId.set(itemId, itemInventory);
    }

    for (const item of orderItems) {
      const itemInventory = inventoryByItemId.get(item.itemId) ?? [];
      let available = itemInventory.reduce((sum, row) => sum + Number(row.Stock), 0);
      if (available < item.quantity) {
        const error = new Error(`Insufficient stock for item ${item.itemId}`);
        error.statusCode = 409;
        throw error;
      }

      let remaining = item.quantity;
      for (const inventory of itemInventory) {
        if (remaining === 0) break;
        const decrement = Math.min(remaining, Number(inventory.Stock));
        if (decrement === 0) continue;

        await runQuery(
          'UPDATE `Inventory` SET `Stock` = `Stock` - ? WHERE `InventoryID` = ?',
          [decrement, inventory.InventoryID]
        );
        remaining -= decrement;
      }
    }

    const orderResult = await runQuery(
      'INSERT INTO `Orders` (`EmployeeID`, `CustomerID`, `OrderType`, `OrderTotal`, `PaymentMethod`, `OrderDate`) VALUES (?, ?, ?, ?, ?, NOW())',
      [employeeId, customerId, 'In-Store', (totalInCents / 100).toFixed(2), paymentMethod]
    );

    for (const item of orderItems) {
      await runQuery(
        'INSERT INTO `Ordered Items` (`OrderID`, `ItemID`, `QuantityOrdered`, `ItemPrice`) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.itemId, item.quantity, (item.priceInCents / 100).toFixed(2)]
      );
    }

    await new Promise((resolve, reject) => {
      connection.commit((error) => error ? reject(error) : resolve());
    });

    return {
      OrderID: orderResult.insertId,
      CustomerID: customerId,
      OrderTotal: (totalInCents / 100).toFixed(2)
    };
  } catch (error) {
    try {
      await new Promise((resolve, reject) => {
        connection.rollback((rollbackError) => rollbackError ? reject(rollbackError) : resolve());
      });
    } catch (rollbackError) {
      console.error('Could not roll back failed order transaction', rollbackError);
      throw new Error('Order failed and its transaction could not be rolled back');
    }

    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  findAll,
  findOne,
  updateOne,
  deleteOne,
  getColumns,
  insertOne,
  adjustItemStock,
  createOrder
}