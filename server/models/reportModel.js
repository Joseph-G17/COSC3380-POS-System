let { query } = require('../sqlConnecter');

//each report reads its view in mysql by name (server/database/report_views.sql)
//summary = the boxes at the top of the report, each one is a single number
//money / percent = how the box is shown
const REPORTS = {
  SalesSummary: {
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
  ItemPerformance: {
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

async function findReport(report, filters){
  const reportFilters = REPORTS[report].filters;
  const conditions = [];
  //the view's name, e.g. SalesSummary -> salessummary
  const from = '??';
  const params = [report];

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
    rows
  };
}

module.exports = {
  REPORTS,
  findReport
}
