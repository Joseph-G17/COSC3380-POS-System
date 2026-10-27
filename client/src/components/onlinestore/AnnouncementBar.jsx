// State keeps API data/time; effects load sales and manage browser timers.
import { useEffect, useState } from "react";
import { getSaleSchedule } from "./saleSchedule"; // This helper checks campaign dates without changing the rows.

// Layout places this strip above Navbar on both the shop and checkout pages.
const AnnouncementBar = () => {
  const [sales, setSales] = useState([]); // Keep campaign rows received from the existing sales API.
  const [now, setNow] = useState(Date.now); // React calls Date.now once to get the initial time.

  // Start loading after React adds the bar to the page.
  useEffect(() => {
    let isMounted = true; // Ignore a response if this component has already been removed.
    let activeController; // Remember the current request so the next refresh can cancel it.
    let requestTimeoutId; // Remember the latest timeout so cleanup can stop it.

    // Load on entry and once a minute so new or changed campaigns can appear.
    async function loadSales() {
      activeController?.abort(); // Cancel the previous request before starting another one.
      const controller = new AbortController(); // Create a cancel switch for this one request.
      activeController = controller; // Mark this request as the newest one.
      // The current server may leave a failed query pending; stop waiting after 10 seconds.
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);
      requestTimeoutId = timeoutId; // Keep the timer ID where effect cleanup can reach it.

      try {
        // Ask our backend for sales; await pauses this function until the response arrives.
        const response = await fetch("/api/sales", { signal: controller.signal });
        // HTTP errors must enter catch instead of being displayed as valid sales.
        if (!response.ok) {
          throw new Error("Unable to load sales");
        }
        const data = await response.json(); // Convert the JSON response into JavaScript values.
        // The date helper expects a list of rows, so reject a different response shape.
        if (!Array.isArray(data)) {
          throw new Error("Invalid sales data");
        }

        // An older response must not replace newer data or update a removed component.
        if (isMounted && activeController === controller) {
          setSales(data); // Save the rows; React renders the bar again with these sales.
          setNow(Date.now()); // Check campaign dates against the time this response arrived.
        }
      } catch {
        // Hide unverified offers on failure; do not substitute a made-up discount.
        if (isMounted && activeController === controller) {
          setSales([]); // An empty array makes the bar disappear until a refresh succeeds.
          setNow(Date.now()); // Keep the date check current even after a failed request.
        }
      } finally {
        // Success or failure ends this request, so its timeout is no longer needed.
        window.clearTimeout(timeoutId);
      }
    }

    loadSales(); // Fetch immediately instead of waiting for the first one-minute refresh.
    const refreshId = window.setInterval(loadSales, 60000); // The browser calls loadSales every 60,000 ms.
    // React runs this cleanup when the bar leaves the page.
    return () => {
      isMounted = false; // Tell unfinished requests that they must not change state.
      window.clearInterval(refreshId); // Stop future refreshes.
      window.clearTimeout(requestTimeoutId); // Stop the latest pending request timer.
      activeController?.abort(); // Stop work when leaving the customer layout.
    };
  }, []); // An empty dependency list runs setup once per mount, rather than on every render.

  // Only show campaigns whose start/end dates include the current time.
  // Read the helper's two results: visible rows and the nearest future start/end time.
  const { activeSales, nextChangeAt } = getSaleSchedule(sales, now);

  useEffect(() => {
    if (nextChangeAt === null) {
      return; // No upcoming date boundary means no extra timer is needed.
    }
    // Recheck at the next start/end; cap long waits to the browser's timer limit.
    const delay = Math.min(Math.max(nextChangeAt - Date.now(), 0), 2147483647);
    // At that boundary, a new time value makes React recheck which sales are active.
    const timerId = window.setTimeout(() => setNow(Date.now()), delay);
    return () => window.clearTimeout(timerId); // Cancel an old timer before replacing it.
  }, [nextChangeAt, now]); // Rebuild the timer when the next boundary or checked time changes.

  if (activeSales.length === 0) {
    return null; // No active sale: leave no empty strip above Navbar.
  }

  // Render a green strip; polite/atomic announcements read changed sale names as one message.
  return (
    <section
      aria-label="Current sales"
      aria-live="polite"
      aria-atomic="true"
      className="w-full bg-[#1f5735] px-4 py-2 text-center text-sm font-medium text-white sm:px-6"
    >
      {/* flex-wrap lets campaign names use extra lines when the screen is narrow. */}
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1">
        {/* Show every active campaign name exactly as supplied; sales has no discount percentage. */}
        {activeSales.map(function (sale) {
          // map supplies one sale at a time; return gives its list entry back to React.
          // SaleID is the stable key, and the wrapping styles let long names fit.
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

export default AnnouncementBar; // Allow Layout to place the same bar on both customer pages.
