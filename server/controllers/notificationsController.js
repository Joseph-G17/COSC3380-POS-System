const Notifications = require('../models/notificationModel');

// desc: Gets stock alerts and arrived shipments for the bell in the admin nav bar
// route: GET /api/notifications
async function getNotifications(req, res) {
  try {
    const stock = await Notifications.findStockAlerts();
    const shipments = await Notifications.findArrivedShipments();

    const notifications = [];

    //out of stock and low stock go first since they matter most
    stock.forEach((row) => {
      const message = row.StockStatus === 'Out of Stock'
        ? `${row.ItemName} is out of stock.`
        : `${row.ItemName} is low on stock (${row.Stock} left).`;

      //stock is in the key so a dismissed alert comes back if the stock changes again
      notifications.push({ key: `stock-${row.InventoryID}-${row.Stock}`, InventoryID: row.InventoryID, Message: message, Date: null });
    });

    shipments.forEach((row) => {
      notifications.push({
        key: `shipment-${row.ShipmentID}`,
        InventoryID: row.InventoryID,
        Message: `${row.QuantityShipped} ${row.ItemName} arrived from ${row.SupplierName}.`,
        Date: row.ArrivalDate
      });
    });

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(notifications));
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load notifications'}));
  }
}

module.exports = {
  getNotifications
}
