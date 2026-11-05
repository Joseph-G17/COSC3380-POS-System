let employees = require('../testdata/items');
let { query, getConnection } = require('../sqlConnecter')
const { writeDataToFile } = require('../utilities');
const bcrypt = require('bcryptjs');

/* BEFORE QUERY PROMISE 
function findAll(){
  return new Promise((resolve, reject) => {
    resolve(employees);
  })
}
*/
function findall(entity){
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

function findAll(){
  return query('SELECT * FROM Employees');
}

//SELECT
function findByID(id) {
  return new Promise((resolve, reject) => {
    const employee = employees.find((e) => e.EmployeeID === id)
    resolve(employee);
  })
}

//INSERT INTO
function create(employee){
  return new Promise((resolve, reject) =>{
    const newEmployee = {EmployeeID: '6', ...employee};
    employees.push(newEmployee);
    writeDataToFile('./testdata/employees.json', employees);
    resolve(newEmployee);
  })
} 

//UPDATE 
function update(id, employeeData) {
  return new Promise((resolve, reject) => {
    const index = employees.findIndex((e) => e.EmployeeID === id)
    employees[index] = {EmployeeID: id, ...employeeData}
    writeDataToFile('./testdata/employees.json', employees);
    resolve(employees[index]);
  })
}

//DELETE
function remove(id) {
  return new Promise((resolve, reject) => {
    employees = employees.filter((e) => e.EmployeeID !== id);
    writeDataToFile('./testdata/employees.json', employees);
    resolve();
  })
}
async function authenticateEmployee(username, password) {
  const rows = await query(
    'SELECT Employees.`EmployeeID`, Employees.`Role`, `Employee Logins`.`EmployeePassword` ' +
      'FROM Employees INNER JOIN `Employee Logins` ' +
      'ON Employees.`EmployeeID` = `Employee Logins`.`EmployeeID` ' +
      'WHERE `Employee Logins`.`EmployeeUsername` = ? OR Employees.`Email` = ? LIMIT 1',
    [username, username]
  );
  if (rows.length === 0) return null;

  const isPasswordValid = await bcrypt.compare(password, rows[0].EmployeePassword);
  if (!isPasswordValid) return null;

  return {
    employeeID: Number(rows[0].EmployeeID),
    Role: Number(rows[0].Role)
  };
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

// The Azure database clock is UTC, so orders save Houston time instead.
function houstonNow() {
  // sv-SE prints "YYYY-MM-DD HH:mm:ss", the format MySQL expects.
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Chicago' });
}

async function createOrder({ employeeId, customerId, paymentMethod, items, orderType = 'In-Store',
  deliveryAddress = null }) {
  const onlineOrder = orderType === 'Pickup' || orderType === 'Delivery';
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

    // Make sure the customer exists before saving the order.
    const customers = await runQuery(
      'SELECT CustomerID FROM Customers WHERE CustomerID = ?',
      [customerId]
    );
    if (customers.length === 0) {
      const error = new Error('Customer ID was not found');
      error.statusCode = 404;
      throw error;
    }

    const sortedItems = [...items].sort((left, right) => left.itemId - right.itemId);
    const employees = await runQuery('SELECT EmployeeID FROM Employees WHERE EmployeeID = ?', [employeeId]);
    if (employees.length === 0) {
      const error = new Error(onlineOrder ? 'Online checkout is unavailable. Please contact the store.' : 'Cashier employee ID was not found');
      error.statusCode = onlineOrder ? 503 : 404;
      throw error;
    }

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

    const fields = { EmployeeID: employeeId, CustomerID: customerId, OrderType: orderType,
      OrderTotal: (totalInCents / 100).toFixed(2), PaymentMethod: paymentMethod };
    // Only delivery orders save an address.
    if (orderType === 'Delivery') fields.DeliveryAddress = deliveryAddress;
    fields.OrderDate = houstonNow();
    const orderResult = await runQuery('INSERT INTO `Orders` SET ?', [fields]);

    for (const item of orderItems) {
      const itemInventory = inventoryByItemId.get(item.itemId) ?? [];
      const available = itemInventory.reduce((sum, row) => sum + Number(row.Stock), 0);
      if (available < item.quantity) {
        const error = new Error(`Insufficient stock for item ${item.itemId}`);
        error.statusCode = 409;
        throw error;
      }

      await runQuery(
        'INSERT INTO `Ordered Items` (`OrderID`, `ItemID`, `QuantityOrdered`, `ItemPrice`) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.itemId, item.quantity, (item.priceInCents / 100).toFixed(2)]
      );

      // A database trigger may have already deducted the line. Count it just once.
      const currentLots = await runQuery(
        'SELECT InventoryID, Stock FROM Inventory WHERE ItemID = ? ORDER BY InventoryID FOR UPDATE', [item.itemId]
      );
      const stockAfterLine = currentLots.reduce((sum, lot) => sum + Number(lot.Stock), 0);
      if (stockAfterLine === available - item.quantity) continue;
      if (stockAfterLine !== available) throw new Error('Unexpected stock change while placing the order');

      let remaining = item.quantity;
      for (const inventory of currentLots) {
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

    await new Promise((resolve, reject) => {
      connection.commit((error) => error ? reject(error) : resolve());
    });

    return {
      OrderID: orderResult.insertId,
      CustomerID: customerId,
      OrderTotal: fields.OrderTotal,
      ...(onlineOrder ? { orderType, deliveryAddress, paymentMethod } : {}),
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
  findall,
  findAll,
  findByID,
  create,
  update,
  remove,
  authenticateEmployee,
  adjustItemStock,
  createOrder
}
