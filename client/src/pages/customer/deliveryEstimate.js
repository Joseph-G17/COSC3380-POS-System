//SaveSo delivers the day after the order, so the estimate is the order date plus one day
export function estimatedDelivery(orderDate){
  //orderDate is the text saved with the order, like "2026-11-10 13:34:49"
  //Right after checkout there is no saved text yet, so start from today
  const date = orderDate ? new Date(orderDate.slice(0, 10) + "T12:00:00") : new Date();
  if(Number.isNaN(date.getTime())){
    return "";
  }
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
