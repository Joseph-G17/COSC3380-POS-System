let { query } = require('../sqlConnecter');

//same rule as the stockreport view, 0 is out and 10 or less is low
function findStockAlerts(){
  const sql = `
    SELECT inv.InventoryID,
          it.ItemName,
          inv.Stock,
          CASE WHEN inv.Stock = 0 THEN 'Out of Stock' ELSE 'Low' END AS StockStatus
    FROM Inventory inv
    JOIN Items it ON it.ItemID = inv.ItemID
    WHERE inv.Stock <= 10
    ORDER BY inv.Stock`;
  return query(sql);
}

//shipments that trg_ShipmentAdded put into stock in the last 7 days
function findArrivedShipments(){
  const sql = `
    SELECT s.ShipmentID,
          s.InventoryID,
          it.ItemName,
          s.SupplierName,
          s.QuantityShipped,
          s.ArrivalDate
    FROM Shipments s
    JOIN Inventory inv ON inv.InventoryID = s.InventoryID
    JOIN Items it ON it.ItemID = inv.ItemID
    WHERE s.ArrivalDate >= NOW() - INTERVAL 7 DAY
    ORDER BY s.ArrivalDate DESC`;
  return query(sql);
}

module.exports = {
  findStockAlerts,
  findArrivedShipments
}
