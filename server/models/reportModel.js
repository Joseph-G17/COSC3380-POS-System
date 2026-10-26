let { query } = require('../sqlConnecter');

//formatted like the view in mysql
const REPORTS = {
  SalesSummary: {
    orderBy: 'SaleDate DESC',
    filters: {
      from: { column: 'SaleDate', op: '>=' },
      to: { column: 'SaleDate', op: '<=' },
      orderType: { column: 'OrderType', op: '=' }
    }
  },
  StockReport: {
    orderBy: 'ItemName',
    filters: {
      itemName: { column: 'ItemName', op: 'LIKE' },
      supplier: { column: 'Supplier', op: 'LIKE' },
      maxStock: { column: 'Stock', op: '<=' }
    }
  },
  EmployeeSales: {
    orderBy: 'ActivityMonth DESC, EmployeeName',
    filters: {
      employee: { column: 'EmployeeName', op: 'LIKE' },
      from: { column: 'ActivityMonth', op: '>=' },
      to: { column: 'ActivityMonth', op: '<=' }
    }
  },
  CustomerPurchases: {
    orderBy: 'OrderDate DESC, OrderID',
    filters: {
      customer: { column: 'CustomerName', op: 'LIKE' },
      channel: { column: 'Channel', op: '=' },
      from: { column: 'OrderDate', op: '>=' },
      to: { column: 'OrderDate', op: '<=' }
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