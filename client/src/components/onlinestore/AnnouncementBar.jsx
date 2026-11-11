import { useEffect, useState } from "react";
import { getSaleSchedule } from "./saleSchedule";

const AnnouncementBar = () => {
  const [sales, setSales] = useState([]);
  const [now, setNow] = useState(Date.now);
  const [deals, setDeals] = useState([]);

  // Refresh on entry and once a minute; cancel older requests and stop after 10 seconds.
  useEffect(() => {
    let isMounted = true;
    let activeController;
    let requestTimeoutId;

    async function loadSales() {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);
      requestTimeoutId = timeoutId;

      try {
        const response = await fetch("/api/sales", { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Unable to load sales");
        }
        const data = await response.json();
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
    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
      window.clearTimeout(requestTimeoutId);
      activeController?.abort();
    };
  }, []);

  //Load the seasonal deal messages that the database trigger saved
  useEffect(function () {
    async function loadDeals() {
      try {
        const response = await fetch("/api/season-deals");
        if(!response.ok){
          throw new Error("Unable to load season deals");
        }
        const data = await response.json();
        if(Array.isArray(data)){
          setDeals(data);
        }
      } catch {
        //Hide the deal messages when they cannot be loaded
        setDeals([]);
      }
    }
    loadDeals();
  }, []);

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

  if (activeSales.length === 0 && deals.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Current sales"
      aria-live="polite"
      aria-atomic="true"
      className="w-full bg-[#1f5735] px-4 py-2 text-center text-sm font-medium text-white sm:px-6"
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1">
        {activeSales.map(function (sale) {
          return (
            <li key={sale.SaleID} className="min-w-0 max-w-full" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              {sale.SaleName}
            </li>
          );
        })}
        {/*Seasonal deal messages from the trigger*/}
        {deals.map(function (deal) {
          return (
            <li key={"deal-" + deal.NotificationID} className="min-w-0 max-w-full" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              {deal.Message}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default AnnouncementBar;
