const { query, withTransaction } = require('../sqlConnecter');

const PUBLIC_CUSTOMER_SELECT = `
  SELECT c.CustomerID AS customerID, c.FirstName AS firstName,
         c.LastName AS lastName, c.Email AS email, c.PhoneNumber AS phoneNumber,
         l.CustomerUsername AS username,
         DATE_FORMAT(c.MembershipExpirationDate, '%Y-%m-%dT%H:%i:%s.000Z')
           AS membershipExpirationDate
  FROM Customers c
  JOIN \`Customer Logins\` l ON l.CustomerID = c.CustomerID`;

async function findCustomerLogin(username) {
  // storedPassword is used for comparison and is excluded from API replies.
  const sql = `
    SELECT c.CustomerID AS customerID, c.FirstName AS firstName,
           c.LastName AS lastName, c.Email AS email, c.PhoneNumber AS phoneNumber,
           l.CustomerUsername AS username,
           DATE_FORMAT(c.MembershipExpirationDate, '%Y-%m-%dT%H:%i:%s.000Z')
             AS membershipExpirationDate,
           l.CustomerPassword AS storedPassword
    FROM Customers c
    JOIN \`Customer Logins\` l ON l.CustomerID = c.CustomerID
    WHERE l.CustomerUsername = ? LIMIT 1`;
  const rows = await query(sql, [username]);
  return rows[0] || null;
}

async function createCustomer(data) {
  // Roll back the customer row if the login row cannot be saved.
  return withTransaction(async (runQuery) => {
    // The database sets one year of membership; the form cannot choose its expiry.
    const created = await runQuery(
      'INSERT INTO Customers ' +
        '(FirstName, LastName, Email, PhoneNumber, MembershipExpirationDate) ' +
        'VALUES (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 YEAR))',
      [data.firstName, data.lastName, data.email, data.phoneNumber],
    );
    // This class demo stores the supplied password as plain text.
    await runQuery(
      'INSERT INTO `Customer Logins` (CustomerID, CustomerUsername, CustomerPassword) ' +
        'VALUES (?, ?, ?)',
      [created.insertId, data.username, data.password],
    );
    const rows = await runQuery(
      PUBLIC_CUSTOMER_SELECT + ' WHERE c.CustomerID = ? LIMIT 1',
      [created.insertId],
    );
    return rows[0] || null;
  });
}

//Save the new profile info, then read the customer again to send back
async function updateCustomer(customerId, data){
  return withTransaction(async (runQuery) => {
    const updated = await runQuery('UPDATE Customers SET FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ? WHERE CustomerID = ?', [data.firstName, data.lastName, data.email, data.phoneNumber, customerId]);

    await runQuery('UPDATE `Customer Logins` SET CustomerUsername = ? WHERE CustomerID = ?', [data.username, customerId]);

    const reRead = await runQuery(PUBLIC_CUSTOMER_SELECT + ' WHERE c.CustomerID = ? LIMIT 1', [customerId]);

    return reRead[0] || null;
  });
}

// Read the order total and unit prices saved at checkout. Today's catalog prices may differ.
async function getCustomerOrderHistory(customerId) {
  const rows = await query(`
    SELECT CAST(o.OrderID AS CHAR) AS orderId,
           DATE_FORMAT(o.OrderDate, '%Y-%m-%d %H:%i:%s') AS orderDate,
           o.OrderType AS orderType, o.OrderTotal AS total,
           CAST(oi.ItemID AS CHAR) AS itemId, i.ItemName AS name,
           oi.QuantityOrdered AS quantity, oi.ItemPrice AS unitPrice
    FROM Orders o
    LEFT JOIN \`Ordered Items\` oi ON oi.OrderID = o.OrderID
    LEFT JOIN Items i ON i.ItemID = oi.ItemID
    WHERE o.CustomerID = ?
    ORDER BY o.OrderDate DESC, o.OrderID DESC, oi.ItemID`, [customerId]);

  const orders = [];
  let order;
  for (const row of rows) {
    // The query puts every item from the same order next to the others.
    if (!order || order.orderId !== row.orderId) {
      order = {
        orderId: row.orderId, orderDate: row.orderDate, orderType: row.orderType,
        total: Number(row.total), items: [],
      };
      orders.push(order);
    }
    if (row.itemId !== null) {
      order.items.push({
        itemId: row.itemId, name: row.name,
        quantity: row.quantity, unitPrice: Number(row.unitPrice),
      });
    }
  }
  return orders;
}

//Check a discount code for one customer before checkout
async function checkDiscountCode(customerId, discountCode){
  const discounts = await query('SELECT DiscountID, DiscountCode, DiscountPercent FROM Discounts WHERE DiscountCode = ?', [discountCode]);
  if(discounts.length === 0){
    const error = new Error('The discount code is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const usedOrders = await query('SELECT OrderID FROM Orders WHERE CustomerID = ? AND DiscountID = ?', [customerId, discounts[0].DiscountID]);

  if(usedOrders.length > 0){
    const error = new Error('You have used this code before.');
    error.statusCode = 409;
    throw error;
  }
  return { discountCode: discounts[0].DiscountCode, discountPercent: discounts[0].DiscountPercent };
}

module.exports = { findCustomerLogin, createCustomer, getCustomerOrderHistory, checkDiscountCode, updateCustomer };
