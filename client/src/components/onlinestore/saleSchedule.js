// Read sale dates from the API and use a millisecond timestamp for now.
export function getSaleSchedule(sales, now) {
  const activeSales = []; // Collect valid campaigns that should be visible right now.
  let nextChangeAt = null; // null means no upcoming start/end time has been found yet.

  // Stop early if the caller did not supply an array and a usable current timestamp.
  if (!Array.isArray(sales) || typeof now !== "number" || !Number.isFinite(now)) {
    return { activeSales, nextChangeAt }; // The bar receives no rows and needs no boundary timer.
  }

  // Visit each API row once; index starts at 0 and increases after each row.
  for (let index = 0; index < sales.length; index += 1) {
    const sale = sales[index]; // Give the current row a shorter local name.

    // A campaign must be an object; skip null, arrays and other invalid entries.
    if (!sale || typeof sale !== "object" || Array.isArray(sale)) {
      continue; // Move to the next row without stopping the whole loop.
    }

    // A visible announcement needs a nonblank name; trim checks spaces without changing the stored name.
    if (typeof sale.SaleName !== "string" || sale.SaleName.trim() === "") {
      continue;
    }

    // Require both date strings before trying to turn them into timestamps.
    if (
      typeof sale.SaleStartDate !== "string" ||
      sale.SaleStartDate.trim() === "" ||
      typeof sale.SaleEndDate !== "string" ||
      sale.SaleEndDate.trim() === ""
    ) {
      continue;
    }

    const startAt = Date.parse(sale.SaleStartDate); // Convert the API start date to milliseconds.
    const endAt = Date.parse(sale.SaleEndDate); // Use the same unit for the end date and now.

    // Ignore unreadable dates and campaigns whose end is not later than their start.
    if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || startAt >= endAt) {
      continue;
    }

    // Include the exact start time, but stop displaying the sale at its end time.
    // Keep the original API row and its order; this helper does not calculate discounts.
    if (startAt <= now && now < endAt) {
      activeSales.push(sale); // Add this active campaign to the result array.
    }

    // The next start or end tells the bar when its visible sales may change.
    // Replace the saved boundary only with a future time that is earlier than it.
    if (startAt > now && (nextChangeAt === null || startAt < nextChangeAt)) {
      nextChangeAt = startAt;
    }

    // An active sale's end can arrive before the next future sale begins.
    if (endAt > now && (nextChangeAt === null || endAt < nextChangeAt)) {
      nextChangeAt = endAt;
    }
  }

  return { activeSales, nextChangeAt }; // Send both results to AnnouncementBar in one object.
}
