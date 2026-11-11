let { query } = require('../sqlConnecter');

//types the bell shows, all written by triggers:
//Shipment = trg_Shipment_AfterInsert / AfterUpdate, LowStock = trg_Inventory_AfterUpdate
const BELL_TYPES = ['Shipment', 'LowStock'];

//trigger messages nobody has cleared yet
function findBellNotifications(){
  const sql = `
    SELECT NotificationID,
          NotificationType,
          Message,
          RelatedID,
          CreatedAt
    FROM notifications
    WHERE NotificationType IN (?)
      AND IsRead = 0
    ORDER BY CreatedAt DESC, NotificationID DESC
    LIMIT 50`;
  return query(sql, [BELL_TYPES]);
}

//clearing one in the bell marks it read so it stays gone for everyone
function markBellNotificationRead(id){
  const sql = `
    UPDATE notifications
    SET IsRead = 1
    WHERE NotificationID = ?
      AND NotificationType IN (?)`;
  return query(sql, [id, BELL_TYPES]);
}

module.exports = {
  findBellNotifications,
  markBellNotificationRead
}
