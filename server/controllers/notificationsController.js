const Notifications = require('../models/notificationModel');

// desc: Gets the shipment and low stock messages the triggers wrote into the notifications table
// route: GET /api/notifications
async function getNotifications(req, res) {
  try {
    const rows = await Notifications.findBellNotifications();

    //the message text is exactly what the trigger wrote into the notifications table
    const notifications = rows.map((row) => ({
      key: `notification-${row.NotificationID}`,
      NotificationID: row.NotificationID,
      Type: row.NotificationType,
      RelatedID: row.RelatedID,
      Message: row.Message,
      Date: row.CreatedAt
    }));

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(notifications));
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not load notifications'}));
  }
}

// desc: Clears a bell notification (sets IsRead) so it doesn't show again
// route: PUT /api/notifications/:id
async function readNotification(req, res, id) {
  try {
    const result = await Notifications.markBellNotificationRead(id);
    if (result.affectedRows === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify({ message: `Notification ${id} Not Found`}));
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: `Notification ${id} cleared`}));
  } catch (error) {
    console.log(error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: 'Could not clear notification'}));
  }
}

module.exports = {
  getNotifications,
  readNotification
}
