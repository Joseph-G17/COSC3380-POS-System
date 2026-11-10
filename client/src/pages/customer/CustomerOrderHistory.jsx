import { useEffect, useState } from "react";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function OrderList({ orders }) {
  if (!orders.length) return <p className="mt-3 text-wrap!">You haven’t placed any orders yet.</p>;
  return (
    <ul className="mt-3 divide-y divide-gray-200">
      {orders.map(order => (
        <li key={order.orderId} className="py-3">
          <details>
            <summary className="cursor-pointer py-2 text-wrap!">
              <strong>Order #{order.orderId}</strong> · {order.orderType} · {currency.format(order.total)}
              {/*Show if the order went through or was canceled*/}
              <span className={order.orderStatus === "Canceled" ? "ml-2 font-medium text-red-700" : "ml-2 text-green-800"}>
                {order.orderStatus}
              </span>
              <time className="ml-2 text-sm text-gray-600" dateTime={order.orderDate.replace(" ", "T")}>
                {order.orderDate}
              </time>
            </summary>
            {order.items.length === 0 && <p className="text-sm text-gray-600 text-wrap!">No item details were saved for this order.</p>}
            <ul aria-label={"Items in order " + order.orderId} className="mt-2 space-y-2">
              {order.items.map(item => (
                <li key={item.itemId} className="flex flex-wrap justify-between gap-x-3">
                  <span className="min-w-0 text-wrap! wrap-anywhere">{item.name}</span>
                  <span>{item.quantity} x {currency.format(item.unitPrice)}</span>
                </li>
              ))}
            </ul>
            {order.deliveryAddress && (
              <p className="mt-2 text-sm text-gray-600 text-wrap!">Delivery to {order.deliveryAddress}</p>
            )}
            {order.canceledDate && (
              <p className="mt-2 text-sm text-red-700 text-wrap!">Canceled on {order.canceledDate}</p>
            )}
            {order.discountCode && (
              <p className="mt-2 text-sm text-gray-600 text-wrap!">Discount {order.discountCode} ({order.discountPercent}% off)</p>
            )}
          </details>
        </li>
      ))}
    </ul>
  );
}

export default function CustomerOrderHistory({ customerId }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        // The server finds this customer's orders by the ID saved at login.
        const response = await fetch("/api/customer/orders?customerId=" + customerId, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!Array.isArray(data.orders)) throw new Error();
        if (controller.signal.aborted) return;
        setOrders(data.orders);
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }

    loadOrders();
    return () => controller.abort();
  }, [customerId, attempt]);

  function refresh() {
    setStatus("loading");
    setAttempt(previous => previous + 1);
  }

  return (
    <section aria-labelledby="order-history" className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="order-history" className="text-2xl">Order history</h2>
        <button type="button" onClick={refresh} disabled={status === "loading"}
          className="min-h-11 text-sm text-green-900 underline disabled:opacity-50">Refresh orders</button>
      </div>
      {status === "loading" && <p role="status" className="mt-3">Loading orders…</p>}
      {status === "error" && <p role="alert" className="mt-3 text-wrap!">We couldn’t load your orders. Select Refresh orders to try again.</p>}
      {status === "ready" && <OrderList orders={orders} />}
    </section>
  );
}
