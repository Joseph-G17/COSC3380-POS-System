let { query } = require('../sqlConnecter');

//formatted like the view in mysql
//summary = the boxes at the top of the report, each one is a single number
const REPORTS = {
  SalesSummary: {
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
  EmployeeSales: {
    title: 'Employee Sales Report',
    description: 'How much each employee sold and returned each month.',
    orderBy: 'ActivityMonth DESC, EmployeeName',
    summary: [
      { label: 'Employees', sql: 'COUNT(DISTINCT EmployeeID)' },
      { label: 'Total Sales', sql: 'SUM(TotalSales)', money: true },
      { label: 'Orders', sql: 'SUM(OrderCount)' },
      { label: 'Total Returned', sql: 'SUM(TotalReturned)', money: true }
    ],
    filters: {
      employee: { column: 'EmployeeName', op: 'LIKE' },
      department: { column: 'Department', op: '=' },
      from: { column: 'ActivityMonth', op: '>=' },
      to: { column: 'ActivityMonth', op: '<=' },
      minSales: { column: 'TotalSales', op: '>=' }
    }
  },
  ItemPerformance: {
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
  },
  EmployeeProductivity: {
    title: 'Employee Productivity Report',
    description: 'Hours each employee has worked compared to how much they sold.',
    orderBy: 'SalesPerHour DESC',
    summary: [
      { label: 'Employees', sql: 'COUNT(*)' },
      { label: 'Total Hours', sql: 'SUM(HoursWorked)' },
      { label: 'Total Sales', sql: 'SUM(TotalSales)', money: true },
      { label: 'Sales Per Hour', sql: 'SUM(TotalSales) / NULLIF(SUM(HoursWorked), 0)', money: true }
    ],
    filters: {
      employee: { column: 'EmployeeName', op: 'LIKE' },
      department: { column: 'Department', op: '=' },
      minHours: { column: 'HoursWorked', op: '>=' },
      minPerHour: { column: 'SalesPerHour', op: '>=' }
    }
  }
};

async function findReport(report, filters){
  const reportFilters = REPORTS[report].filters;
  const conditions = [];
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

  const rows = await query(`SELECT * FROM ??${where} ORDER BY ${REPORTS[report].orderBy}`, params);

  //turns the summary list into one query like SELECT SUM(TotalSales) AS `Total Revenue`, ...
  const columns = REPORTS[report].summary.map((s) => `${s.sql} AS \`${s.label}\``);
  const totals = await query(`SELECT ${columns.join(', ')} FROM ??${where}`, params);

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
