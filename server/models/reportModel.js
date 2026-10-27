let { query } = require('../sqlConnecter');

//formatted like the view in mysql
const REPORTS = {
  SalesSummary: {
    orderBy: 'SaleDate DESC',
    filters: {
      from: { column: 'SaleDate', op: '>=' },
      to: { column: 'SaleDate', op: '<=' },
      orderType: { column: 'OrderType', op: '=' },
      paymentMethod: { column: 'PaymentMethod', op: '=' },
      minSales: { column: 'TotalSales', op: '>=' }
    }
  },
  StockReport: {
    orderBy: 'Stock',
    filters: {
      itemName: { column: 'ItemName', op: 'LIKE' },
      category: { column: 'Category', op: '=' },
      supplier: { column: 'Supplier', op: '=' },
      status: { column: 'StockStatus', op: '=' },
      maxStock: { column: 'Stock', op: '<=' }
    }
  },
  EmployeeSales: {
    orderBy: 'ActivityMonth DESC, EmployeeName',
    filters: {
      employee: { column: 'EmployeeName', op: 'LIKE' },
      department: { column: 'Department', op: '=' },
      from: { column: 'ActivityMonth', op: '>=' },
      to: { column: 'ActivityMonth', op: '<=' },
      minSales: { column: 'TotalSales', op: '>=' }
    }
  },
  CustomerPurchases: {
    orderBy: 'OrderDate DESC, OrderID',
    filters: {
      customer: { column: 'CustomerName', op: 'LIKE' },
      channel: { column: 'Channel', op: '=' },
      orderType: { column: 'OrderType', op: '=' },
      paymentMethod: { column: 'PaymentMethod', op: '=' },
      category: { column: 'Category', op: '=' },
      itemName: { column: 'ItemName', op: 'LIKE' },
      from: { column: 'OrderDate', op: '>=' },
      to: { column: 'OrderDate', op: '<=' }
    }
  },
  ItemPerformance: {
    orderBy: 'UnitsSold DESC',
    filters: {
      itemName: { column: 'ItemName', op: 'LIKE' },
      category: { column: 'Category', op: '=' },
      minSold: { column: 'UnitsSold', op: '>=' },
      maxSold: { column: 'UnitsSold', op: '<=' },
      minReturned: { column: 'UnitsReturned', op: '>=' }
    }
  }
};

function findReport(report, filters){
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

  let sql = `SELECT * FROM ??`;
  if (conditions.length > 0) 
    sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ` ORDER BY ${REPORTS[report].orderBy}`;

  return query(sql, params);
}

module.exports = {
  REPORTS,
  findReport
}