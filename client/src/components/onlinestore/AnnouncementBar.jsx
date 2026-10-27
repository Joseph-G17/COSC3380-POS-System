import { useEffect, useState } from "react";
import { getSaleSchedule } from "./saleSchedule";

// Layout places this strip above Navbar on shop and checkout pages.
const AnnouncementBar = () => {
  // Keep API campaign rows and the time used to decide which names are visible.
  const [sales, setSales] = useState([]);
  const [now, setNow] = useState(Date.now);

  // Refresh on entry and once a minute; cancel older requests and stop after 10 seconds.
  useEffect(() => {
    let isMounted = true;
    let activeController;
    let requestTimeoutId;

    // Only the newest request may replace the rows used by the date helper.
    async function loadSales() {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;
      // Stop waiting if the sales request hangs.
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);
      requestTimeoutId = timeoutId;

      try {
        const response = await fetch("/api/sales", { signal: controller.signal });
        // A failed HTTP status must not become a displayed sale.
        if (!response.ok) {
          throw new Error("Unable to load sales");
        }
        const data = await response.json();
        // The date helper expects a list of campaign rows.
        if (!Array.isArray(data)) {
          throw new Error("Invalid sales data");
        }

        // An older response must not replace newer data or update a removed component.
        if (isMounted && activeController === controller) {
          setSales(data);
          setNow(Date.now());
        }
      } catch {
        // Hide the bar when campaigns cannot be verified.
        if (isMounted && activeController === controller) {
          setSales([]);
          setNow(Date.now());
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    loadSales();
    const refreshId = window.setInterval(loadSales, 60000);
    // Cancel requests and timers when leaving the store layout.
    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
      window.clearTimeout(requestTimeoutId);
      activeController?.abort();
    };
  }, []);

  // Find active sales and the next start/end time that can change the bar.
  const { activeSales, nextChangeAt } = getSaleSchedule(sales, now);

  useEffect(() => {
    if (nextChangeAt === null) {
      return;
    }
    // Recheck at the next start/end; cap long waits to the browser's timer limit.
    const delay = Math.min(Math.max(nextChangeAt - Date.now(), 0), 2147483647);
    const timerId = window.setTimeout(() => setNow(Date.now()), delay);
    return () => window.clearTimeout(timerId);
  }, [nextChangeAt, now]);

  if (activeSales.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Current sales"
      aria-live="polite"
      aria-atomic="true"
      className="w-full bg-[#1f5735] px-4 py-2 text-center text-sm font-medium text-white sm:px-6"
    >
      {/* Only display active campaign names returned by the API. */}
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1">
        {activeSales.map(function (sale) {
          return (
            <li key={sale.SaleID} className="min-w-0 max-w-full" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              {sale.SaleName}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default AnnouncementBar;
