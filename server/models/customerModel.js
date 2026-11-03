const { query, withTransaction } = require('../sqlConnecter');

// Both account queries return these names for the frontend; dates are formatted in SQL.
const PUBLIC_CUSTOMER_SELECT = `
  SELECT c.CustomerID AS customerID, c.FirstName AS firstName,
         c.LastName AS lastName, c.Email AS email,
         l.CustomerUsername AS username,
         DATE_FORMAT(c.MembershipExpirationDate, '%Y-%m-%dT%H:%i:%s.000Z')
           AS membershipExpirationDate
  FROM Customers c
  JOIN \`Customer Logins\` l ON l.CustomerID = c.CustomerID`;

async function findCustomerLogin(username) {
  // loginCustomer supplies the username. The ? value is passed separately from SQL.
  // storedPassword is used for comparison and is excluded from API replies.
  const sql = `
    SELECT c.CustomerID AS customerID, c.FirstName AS firstName,
           c.LastName AS lastName, c.Email AS email,
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
  // signupCustomer supplies validated fields; the callback saves both linked rows together.
  // A failed login insert also rolls back the new Customers row.
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
    // Read the saved public details using the new customer ID, then return them.
    const rows = await runQuery(
      PUBLIC_CUSTOMER_SELECT + ' WHERE c.CustomerID = ? LIMIT 1',
      [created.insertId],
    );
    return rows[0];
  });
}

module.exports = { findCustomerLogin, createCustomer };
