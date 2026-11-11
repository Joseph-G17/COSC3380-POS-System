const { query } = require('../sqlConnecter');

//Turn "M/D" text into a number like 1111 for Nov 11 so dates are easy to compare
function toMonthDay(text){
  const parts = String(text).split('/');
  return Number(parts[0]) * 100 + Number(parts[1]);
}

//Find the season that today (Houston time) falls in, or null if none
async function findCurrentSeason(){
  const todayText = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'numeric', day: 'numeric' });
  const today = toMonthDay(todayText);
  const seasons = await query('SELECT SeasonID, SeasonName, SeasonStartDate, SeasonEndDate FROM Seasons');
  for(const season of seasons){
    const start = toMonthDay(season.SeasonStartDate);
    const end = toMonthDay(season.SeasonEndDate);
    //Winter goes past the new year, so its start number is bigger than its end number
    const inSeason = start <= end ? (today >= start && today < end) : (today >= start || today < end);
    if(inSeason){
      return season;
    }
  }
  return null;
}

//Get the messages the seasonal deal trigger saved for this season's deals
async function findCurrentDealMessages(){
  const season = await findCurrentSeason();
  if(!season){
    return [];
  }
  //For each deal in this season, take the newest trigger message about that item
  const sql = `SELECT n.NotificationID, n.Message
    FROM \`Seasonal Deals\` sd
    JOIN Items i ON i.ItemID = sd.ItemID
    JOIN Notifications n ON n.NotificationID = (
      SELECT MAX(n2.NotificationID) FROM Notifications n2
      WHERE n2.NotificationType = 'SeasonalDeal' AND n2.RelatedID = sd.SeasonID
        AND n2.Message LIKE CONCAT('% deal: ', i.ItemName, ' is now %'))
    WHERE sd.SeasonID = ?
    ORDER BY n.NotificationID DESC`;
  return query(sql, [season.SeasonID]);
}

module.exports = { findCurrentSeason, findCurrentDealMessages };