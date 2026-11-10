let { query } = require('../sqlConnecter');

//formatted like the view in mysql
//summary = the boxes at the top of the report, each one is a single number
//source = the view's own SELECT, used instead of the view itself. The salessummary and
//itemperformance views can import as placeholders (every column = 1) when the dump's
//DEFINER user doesn't exist, so these reports run the query directly.
const REPORTS = {
  SalesSummary: {
    source: `
      SELECT DATE(o.OrderDate) AS SaleDate,
             o.OrderType,
             o.PaymentMethod,
             COUNT(*) AS OrderCount,
             SUM(o.OrderTotal) AS TotalSales,
             ROUND(AVG(o.OrderTotal), 2) AS AvgOrder
      FROM Orders o
      GROUP BY DATE(o.OrderDate), o.OrderType, o.PaymentMethod`,
    title: 'Revenue Report',
    description: 'How much money the store made each day, split by order type and payment method.',
    orderBy: 'SaleDate DESC',
    summary: [
      { label: 'Total Revenue', sql: 'SUM(TotalSales)', money: true },
      { label: 'Orders', sql: 'SUM(OrderCount)' },
      { label: 'Average Order', sql: 'SUM(TotalSales) / SUM(OrderCount)', money: true },
      { label: 'Days With Sales', sql: 'COUNT(DISTINCT SaleDate)' }
    ],
    filters: {
      from: { column: 'SaleDate', op: '>=' },
      to: { column: 'SaleDate', op: '<=' },
      orderType: { column: 'OrderType', op: '=' },
      paymentMethod: { column: 'PaymentMethod', op: '=' },
      minSales: { column: 'TotalSales', op: '>=' }
    }
  },
  ItemPerformance: {
    source: `
      SELECT it.ItemID,
             it.ItemName,
             c.CategoryName AS Category,
             it.ItemPrice,
             (SELECT IFNULL(SUM(oi.QuantityOrdered), 0)
                FROM \`Ordered Items\` oi WHERE oi.ItemID = it.ItemID) AS UnitsSold,
             (SELECT IFNULL(SUM(oi.QuantityOrdered * oi.ItemPrice), 0)
                FROM \`Ordered Items\` oi WHERE oi.ItemID = it.ItemID) AS Revenue,
             (SELECT IFNULL(SUM(ri.QuantityReturned), 0)
                FROM \`Returned Items\` ri WHERE ri.ItemID = it.ItemID) AS UnitsReturned
      FROM Items it
      JOIN \`Item Categories\` c ON c.ItemCategoryID = it.ItemCategoryID`,
    title: 'Item Sales Report',
    description: 'Which items sell the most, how much money they bring in, and how often they come back.',
    orderBy: 'UnitsSold DESC',
    summary: [
      { label: 'Items', sql: 'COUNT(*)' },
      { label: 'Item Revenue', sql: 'SUM(Revenue)', money: true },
      { label: 'Units Sold', sql: 'SUM(UnitsSold)' },
      { label: 'Units Returned', sql: 'SUM(UnitsReturned)' }
    ],
    filters: {
      itemName: { column: 'ItemName', op: 'LIKE' },
      category: { column: 'Category', op: '=' },
      minSold: { column: 'UnitsSold', op: '>=' },
      maxSold: { column: 'UnitsSold', op: '<=' },
      minReturned: { column: 'UnitsReturned', op: '>=' }
    }
  },
  CustomerReport: {
    title: 'Customer Report',
    description: 'Who shops with us, how much they spend, and when they last came in.',
    orderBy: 'TotalSpent DESC',
    summary: [
      { label: 'Customers', sql: 'COUNT(*)' },
      { label: 'Active Members', sql: "SUM(Membership = 'Active')" },
      { label: 'Total Spent', sql: 'SUM(TotalSpent)', money: true },
      { label: 'Average Per Customer', sql: 'AVG(TotalSpent)', money: true }
    ],
    filters: {
      customer: { column: 'CustomerName', op: 'LIKE' },
      membership: { column: 'Membership', op: '=' },
      minSpent: { column: 'TotalSpent', op: '>=' },
      from: { column: 'LastOrderDate', op: '>=' },
      to: { column: 'LastOrderDate', op: '<=' }
    }
  }
};

async function findReport(report, filters){
  const reportFilters = REPORTS[report].filters;
  const conditions = [];
  //reports with a source query read from it; the rest read from their view by name
  const source = REPORTS[report].source;
  const from = source ? `(${source}) AS r` : '??';
  const params = source ? [] : [report];

  for (const name in reportFilters) {
    const value = filters[name];
    if (value === undefined || value === '') continue;

    const column = reportFilters[name].column;
    const op = reportFilters[name].op;

    conditions.push(`?? ${op} ?`);
    params.push(column);

    if (op === 'LIKE')
      params.push(`%${value}%`);
    else
      params.push(value);
  }

  //same WHERE for the rows and the summary so they always match
  let where = '';
  if (conditions.length > 0)
    where = ` WHERE ${conditions.join(' AND ')}`;

  const rows = await query(`SELECT * FROM ${from}${where} ORDER BY ${REPORTS[report].orderBy}`, params);

  //turns the summary list into one query like SELECT SUM(TotalSales) AS `Total Revenue`, ...
  const columns = REPORTS[report].summary.map((s) => `${s.sql} AS \`${s.label}\``);
  const totals = await query(`SELECT ${columns.join(', ')} FROM ${from}${where}`, params);

  const summary = REPORTS[report].summary.map((s) => ({
    label: s.label,
    value: Number(totals[0][s.label]) || 0,
    money: s.money || false
  }));

  return {
    title: REPORTS[report].title,
    description: REPORTS[report].description,
    summary,
    rows
  };
}

module.exports = {
  REPORTS,
  findReport
}
