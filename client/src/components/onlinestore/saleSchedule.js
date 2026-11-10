export function getSaleSchedule(sales, now) {
  const activeSales = [];
  let nextChangeAt = null;

  if (!Array.isArray(sales) || typeof now !== "number" || !Number.isFinite(now)) {
    return { activeSales, nextChangeAt };
  }

  for (let index = 0; index < sales.length; index += 1) {
    const sale = sales[index];

    if (!sale || typeof sale !== "object" || Array.isArray(sale)) {
      continue;
    }

    if (typeof sale.SaleName !== "string" || sale.SaleName.trim() === "") {
      continue;
    }

    if (
      typeof sale.SaleStartDate !== "string" ||
      sale.SaleStartDate.trim() === "" ||
      typeof sale.SaleEndDate !== "string" ||
      sale.SaleEndDate.trim() === ""
    ) {
      continue;
    }

    const startAt = Date.parse(sale.SaleStartDate);
    const endAt = Date.parse(sale.SaleEndDate);

    if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || startAt >= endAt) {
      continue;
    }

    // Show a sale at its start time and hide it at its end time.
    if (startAt <= now && now < endAt) {
      activeSales.push(sale);
    }

    // Refresh the bar at the next sale start or end.
    if (startAt > now && (nextChangeAt === null || startAt < nextChangeAt)) {
      nextChangeAt = startAt;
    }

    if (endAt > now && (nextChangeAt === null || endAt < nextChangeAt)) {
      nextChangeAt = endAt;
    }
  }

  return { activeSales, nextChangeAt };
}
