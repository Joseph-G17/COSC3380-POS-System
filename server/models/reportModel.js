let { query } = require('../sqlConnecter');

//each report reads its view in mysql (server/database/report_views.sql)
//view = the mysql view's name (the views keep their original names)
//summary = the boxes at the top of the report, each one is a single number
//money / percent = how the box is shown
const REPORTS = {
  RevenueReport: {
    view: 'salessummary',
    title: 'Revenue Report',
    description: 'How much money the store made each day. Sales count on the day of the order and returns on the day they were returned. Canceled orders are not counted.',
    orderBy: 'SaleDate DESC',
    summary: [
      { label: 'Gross Sales', sql: 'SUM(TotalSales)', money: true },
      { label: 'Returns', sql: 'SUM(ReturnTotal)', money: true },
      { label: 'Net Sales', sql: 'SUM(NetSales)', money: true },
      { label: 'Orders', sql: 'SUM(OrderCount)' },
      { label: 'Average Order', sql: 'SUM(TotalSales) / NULLIF(SUM(OrderCount), 0)', money: true },
      { label: 'Days', sql: 'COUNT(*)' }
    ],
    filters: {
      from: { column: 'SaleDate', op: '>=' },
      to: { column: 'SaleDate', op: '<=' },
      minSales: { column: 'TotalSales', op: '>=' },
      minNet: { column: 'NetSales', op: '>=' },
      minReturns: { column: 'ReturnTotal', op: '>=' }
    }
  },
  ItemSalesReport: {
    view: 'itemperformance',
    title: 'Item Sales Report',
    description: 'Which items sell the most, how much money they bring in, and how often they come back. Canceled orders are not counted.',
    orderBy: 'UnitsSold DESC',
    summary: [
      { label: 'Items', sql: 'COUNT(*)' },
      { label: 'Item Revenue', sql: 'SUM(Revenue)', money: true },
      { label: 'Units Sold', sql: 'SUM(UnitsSold)' },
      { label: 'Units Returned', sql: 'SUM(UnitsReturned)' },
      { label: 'Net Units', sql: 'SUM(NetUnits)' },
      { label: 'Return Rate', sql: 'ROUND(SUM(UnitsReturned) / NULLIF(SUM(UnitsSold), 0) * 100, 1)', percent: true }
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
    view: 'customerreport',
    title: 'Customer Report',
    description: 'Who shops with us, how much they spend after returns, and when they last came in. Canceled orders are not counted toward spending.',
    orderBy: 'TotalSpent DESC',
    summary: [
      { label: 'Customers', sql: 'COUNT(*)' },
      { label: 'Active Members', sql: "SUM(Membership = 'Active')" },
      { label: 'Total Spent', sql: 'SUM(TotalSpent)', money: true },
      { label: 'Returned', sql: 'SUM(TotalReturned)', money: true },
      { label: 'Net Spent', sql: 'SUM(NetSpent)', money: true },
      { label: 'Average Per Customer', sql: 'AVG(TotalSpent)', money: true },
      { label: 'Canceled Orders', sql: 'SUM(CanceledOrders)' }
    ],
    filters: {
      customer: { column: 'CustomerName', op: 'LIKE' },
      membership: { column: 'Membership', op: '=' },
      minSpent: { column: 'TotalSpent', op: '>=' },
      from: { column: 'LastOrderDate', op: '>=' },
      to: { column: 'LastOrderDate', op: '<=' },
      minCanceled: { column: 'CanceledOrders', op: '>=' }
    }
  }
};

//the individual records for order count and units sold in the Revenue Report and Item Sales Report
/* 
each list is limited to the rows the filtered report returned (keyColumn), and copies the
same rules as the report's view so its totals add up to the summary boxes 
*/

const SOURCES = {
  RevenueReport: {
    keyColumn: 'SaleDate',
    //DATE values come back as JS Dates at local midnight -> "YYYY-MM-DD"
    toKey: (value) => (value instanceof Date ? value.toLocaleDateString('sv-SE') : String(value).slice(0, 10)),
    sections: [
      {
        title: 'Orders',
        //salessummary: orders that aren't canceled, counted on the day they were placed
        sql: `
          SELECT o.OrderID,
                 DATE_FORMAT(o.OrderDate, '%Y-%m-%d %h:%i %p') AS OrderedAt,
                 CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
                 COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS Employee,
                 o.OrderType,
                 o.PaymentMethod,
                 o.OrderTotal
          FROM Orders o
          JOIN Customers c ON c.CustomerID = o.CustomerID
          LEFT JOIN Employees e ON e.EmployeeID = o.EmployeeID
          WHERE o.OrderStatus <> 'Canceled'
            AND CAST(o.OrderDate AS DATE) IN (?)
          ORDER BY o.OrderDate DESC, o.OrderID DESC`
      },
      {
        title: 'Returns',
        //salessummary: returns on orders that aren't canceled, counted on the day they were returned
        sql: `
          SELECT rt.ReturnID,
                 rt.OrderID,
                 DATE_FORMAT(rt.ReturnDate, '%Y-%m-%d %h:%i %p') AS ReturnedAt,
                 CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
                 COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS ProcessedBy,
                 rt.ReturnTotal
          FROM \`Returns\` rt
          JOIN Orders o ON o.OrderID = rt.OrderID
          JOIN Customers c ON c.CustomerID = o.CustomerID
          LEFT JOIN Employees e ON e.EmployeeID = rt.EmployeeID
          WHERE o.OrderStatus <> 'Canceled'
            AND CAST(rt.ReturnDate AS DATE) IN (?)
          ORDER BY rt.ReturnDate DESC, rt.ReturnID DESC`
      }
    ]
  },
  ItemSalesReport: {
    keyColumn: 'ItemID',
    toKey: (value) => value,
    sections: [
      {
        title: 'Units Sold',
        //itemperformance: ordered items on orders that aren't canceled
        sql: `
          SELECT o.OrderID,
                 DATE_FORMAT(o.OrderDate, '%Y-%m-%d %h:%i %p') AS OrderedAt,
                 it.ItemName AS Item,
                 CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
                 COALESCE(CONCAT(e.FirstName, ' ', e.LastName), 'Former employee') AS Employee,
                 oi.QuantityOrdered AS Quantity,
                 oi.ItemPrice AS PricePaid,
                 oi.QuantityOrdered * oi.ItemPrice AS LineTotal
          FROM \`Ordered Items\` oi
          JOIN Orders o ON o.OrderID = oi.OrderID
          JOIN Items it ON it.ItemID = oi.ItemID
          JOIN Customers c ON c.CustomerID = o.CustomerID
          LEFT JOIN Employees e ON e.EmployeeID = o.EmployeeID
          WHERE o.OrderStatus <> 'Canceled'
            AND oi.ItemID IN (?)
          ORDER BY o.OrderDate DESC, o.OrderID DESC, it.ItemName`
      },
      {
        title: 'Units Returned',
        //itemperformance: every returned item (the view doesn't check the order's status here)
        sql: `
          SELECT rt.ReturnID,
                 rt.OrderID,
                 DATE_FORMAT(rt.ReturnDate, '%Y-%m-%d %h:%i %p') AS ReturnedAt,
                 it.ItemName AS Item,
                 CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
                 ri.QuantityReturned AS Quantity
          FROM \`Returned Items\` ri
          JOIN \`Returns\` rt ON rt.ReturnID = ri.ReturnID
          JOIN Orders o ON o.OrderID = rt.OrderID
          JOIN Items it ON it.ItemID = ri.ItemID
          JOIN Customers c ON c.CustomerID = o.CustomerID
          WHERE ri.ItemID IN (?)
          ORDER BY rt.ReturnDate DESC, rt.ReturnID DESC, it.ItemName`
      }
    ]
  }
};

//runs each source list for the days/items in the filtered report rows
async function findSources(report, rows){
  const source = SOURCES[report];
  if (!source) return [];

  const keys = [...new Set(rows.map((row) => source.toKey(row[source.keyColumn])))];
  return Promise.all(source.sections.map(async (section) => ({
    title: section.title,
    rows: keys.length > 0 ? await query(section.sql, [keys]) : []
  })));
}

async function findReport(report, filters){
  const reportFilters = REPORTS[report].filters;
  const conditions = [];
  //the view's name, e.g. RevenueReport -> salessummary
  const from = '??';
  const params = [REPORTS[report].view];

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
    money: s.money || false,
    percent: s.percent || false
  }));

  return {
    title: REPORTS[report].title,
    description: REPORTS[report].description,
    summary,
    rows,
    sources: await findSources(report, rows) //[] for reports without source lists
  };
}

module.exports = {
  REPORTS,
  findReport,
  findSources
}
