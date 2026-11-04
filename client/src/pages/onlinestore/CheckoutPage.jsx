import { Link, useOutletContext } from "react-router-dom";
import { loadCustomer } from "../customer/customerSession";
import { useEffect, useRef, useState } from "react";

function money(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function CheckoutPage() {
  const {
    cartItems,
    totalQuantity,
    products,
    productsError,
    stockById,
    canAddOne,
    addToCart,
    deleteCartItem,
    removeCartRow,
    removePurchasedItems,
    refreshStock,
  } = useOutletContext();
  const customer = loadCustomer();
  const token = customer?.checkoutToken;
  const pendingKey = "saveso.pendingOrder." + customer?.customerID;
  const [pending, setPending] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(pendingKey));
    } catch {
      return null;
    }
  });
  const [orderType, setOrderType] = useState(pending?.orderType ?? "Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState(
    pending?.deliveryAddress ?? "",
  );
  const earlierPickup = !!pending && pending.orderType == null;
  const [previousOrderId, setPreviousOrderId] = useState(null);
  const [error, setError] = useState("");
  const [loginExpired, setLoginExpired] = useState(false);
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const submitting = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Remember which order was the latest when this customer reviewed their cart.
  // A retry uses its saved request even if that order has already been placed.
  useEffect(() => {
    if (!token || pending || receipt) return;
    const controller = new AbortController();
    async function loadCheckout() {
      try {
        const response = await fetch("/api/customer/checkout", {
          headers: { Authorization: "Bearer " + token },
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 401) {
          setLoginExpired(true);
          return;
        }
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (
          !Number.isSafeInteger(data.previousOrderId) ||
          data.previousOrderId < 0
        )
          throw new Error();
        setPreviousOrderId(data.previousOrderId);
      } catch {
        if (!controller.signal.aborted)
          setError("Couldn’t load checkout. Refresh the page to try again.");
      }
    }
    loadCheckout();
    return () => controller.abort();
  }, [token, pending, receipt]);

  const currentProducts = new Map(
    (products ?? []).map((item) => [Number(item.ItemID), item]),
  );
  function unitPriceCents(item) {
    const price =
      currentProducts.get(Number(item.ItemID))?.ItemPrice ?? item.ItemPrice;
    return Math.round(Number(price) * 100);
  }
  const totalCents = cartItems.reduce((sum, item) => {
    return sum + unitPriceCents(item) * item.quantity;
  }, 0);
  const cartInStock =
    cartItems.length > 0 &&
    cartItems.every(
      (item) => stockById.get(Number(item.ItemID)) >= item.quantity,
    );

  async function placeOrder(event) {
    event.preventDefault();
    if (submitting.current || !token || loginExpired) return;
    if (!pending && (!cartInStock || previousOrderId === null)) return;
    if (!pending && orderType === "Delivery" && !deliveryAddress.trim()) {
      setError("Enter your delivery address.");
      return;
    }
    const order = pending ?? {
      previousOrderId,
      orderType,
      paymentMethod: "Demo",
      deliveryAddress: orderType === "Delivery" ? deliveryAddress.trim() : null,
      items: cartItems.map((item) => ({
        itemId: Number(item.ItemID),
        quantity: item.quantity,
      })),
    };
    try {
      sessionStorage.setItem(pendingKey, JSON.stringify(order));
    } catch {
      setError("Allow site storage so we can keep track of your order.");
      return;
    }
    submitting.current = true;
    setPending(order);
    setSending(true);
    setReceipt(null);
    setError("");
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(order),
      });
      const result = await response.json();
      if (
        !mounted.current ||
        loadCustomer()?.customerID !== customer.customerID
      )
        return;
      if (response.status === 401) {
        setLoginExpired(true);
        return;
      }
      if (!response.ok) {
        // The checkout API uses this code only when the order was not saved.
        const checkoutUnavailable =
          response.status === 503 && result.code === "CHECKOUT_UNAVAILABLE";
        if (response.status >= 500 && !checkoutUnavailable) throw new Error();
        sessionStorage.removeItem(pendingKey);
        setPreviousOrderId(null);
        setPending(null);
        setError(
          result.code === "ORDER_HISTORY_CHANGED"
            ? "Your order history changed. Review your cart before placing a new order."
            : result.message || "Review your cart and try again.",
        );
        refreshStock();
        return;
      }
      if (
        !Number.isSafeInteger(result.OrderID) ||
        result.OrderID < 1 ||
        result.OrderTotal == null ||
        !Number.isFinite(Number(result.OrderTotal)) ||
        result.paymentMethod !== order.paymentMethod ||
        result.orderType !== (order.orderType ?? "Pickup") ||
        (order.orderType === "Delivery" &&
          result.deliveryAddress !== order.deliveryAddress)
      )
        throw new Error();
      sessionStorage.removeItem(pendingKey);
      setReceipt(result);
      setPreviousOrderId(result.OrderID);
      removePurchasedItems(order.items);
      setPending(null);
      refreshStock();
    } catch {
      setError(
        "We couldn’t confirm your order. Use the button below to retry the same order.",
      );
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  function renderItem(item) {
    const stock = stockById.get(Number(item.ItemID));
    const unitCents = unitPriceCents(item);
    let stockMessage = "";
    if (products !== null) {
      if (stock === undefined) stockMessage = "Availability unknown.";
      else if (stock === 0)
        stockMessage = "Out of stock. Remove this item from your cart.";
      else if (item.quantity > stock)
        stockMessage =
          "Only " + stock + " left. Reduce the quantity or remove this item.";
    }

    return (
      <li key={item.ItemID} className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium text-wrap! wrap-anywhere">
              {item.ItemName}
            </h3>
            <p className="text-sm text-gray-600">{money(unitCents)} each</p>
          </div>
          <strong>{money(unitCents * item.quantity)}</strong>
        </div>
        {stockMessage && (
          <p className="my-2 text-sm text-amber-800 text-wrap!">
            {stockMessage}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="size-11 rounded border"
            aria-label={"Remove one " + item.ItemName}
            onClick={() => deleteCartItem(item.ItemID)}
          >
            −
          </button>
          <span aria-live="polite">
            <span className="sr-only">Quantity: </span>
            {item.quantity}
          </span>
          <button
            type="button"
            className="size-11 rounded border disabled:opacity-40"
            aria-label={"Add one " + item.ItemName}
            disabled={!canAddOne(item.ItemID)}
            onClick={() => addToCart(item)}
          >
            +
          </button>
          <button
            type="button"
            className="min-h-11 px-1 text-sm underline"
            aria-label={"Remove " + item.ItemName + " from cart"}
            onClick={() => removeCartRow(item.ItemID)}
          >
            Remove
          </button>
        </div>
      </li>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Link to="/" className="text-sm underline">
        Continue shopping
      </Link>
      <h1 id="checkout-heading" tabIndex={-1} className="mt-2 text-3xl">
        Checkout
      </h1>
      {receipt && (
        <section
          role="status"
          className="mt-4 rounded border border-green-200 bg-green-50 p-4"
        >
          <h2 className="text-xl text-wrap!">Order #{receipt.OrderID} confirmed</h2>
          <p>
            {receipt.paymentMethod === "Demo"
              ? "Paid in demo"
              : "Pay at pickup"}{" "}
            · {money(Math.round(Number(receipt.OrderTotal) * 100))}
          </p>
          {receipt.paymentMethod === "Demo" && (
            <p className="mt-1 text-wrap! wrap-anywhere">
              {receipt.orderType === "Delivery"
                ? "Delivery to " + receipt.deliveryAddress
                : "Pickup at the store."}
            </p>
          )}
          <Link
            to="/customer/profile"
            className="mt-2 inline-block text-green-900 underline"
          >
            View order history
          </Link>
        </section>
      )}
      {cartItems.length === 0 && !pending ? (
        !receipt && (
          <p className="mt-4 text-wrap!">
            Your cart is empty. Add an item from the shop to get started.
          </p>
        )
      ) : (
        <div className="mt-5 grid items-start gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section
            aria-labelledby="cart-heading"
            className="min-w-0 rounded border border-gray-200 p-4"
          >
            <h2 id="cart-heading" className="text-xl">
              Your items
            </h2>
            {pending ? (
              <ul className="mt-2 space-y-2">
                {pending.items.map((item) => (
                  <li key={item.itemId} className="text-wrap! wrap-anywhere">
                    {currentProducts.get(item.itemId)?.ItemName ??
                      "Item #" + item.itemId}{" "}
                    × {item.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {productsError ? (
                  <p
                    role="status"
                    className="mt-2 text-sm text-amber-800 text-wrap!"
                  >
                    Couldn't check stock. Refresh the page to try again.
                  </p>
                ) : (
                  products === null && (
                    <p role="status" className="mt-2 text-sm">
                      Checking stock…
                    </p>
                  )
                )}
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(renderItem)}
                </ul>
              </>
            )}
          </section>
          <section
            aria-labelledby="summary-heading"
            aria-busy={sending}
            className="min-w-0 rounded border border-gray-200 p-4"
          >
            <h2 id="summary-heading" className="text-xl">
              Order summary
            </h2>
            {!pending && (
              <>
                <p className="my-3" aria-live="polite">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </p>
                <div
                  className="flex flex-wrap justify-between gap-2 border-t py-3 font-semibold"
                  aria-live="polite"
                >
                  <span>Estimated total</span>
                  <span>{money(totalCents)}</span>
                </div>
              </>
            )}
            {!customer && (
              <p className="text-wrap!">
                <Link to="/customer/login?next=/checkout" className="underline">
                  Log in
                </Link>{" "}
                or{" "}
                <Link
                  to="/customer/signup?next=/checkout"
                  className="underline"
                >
                  sign up
                </Link>{" "}
                to use your customer account.
              </p>
            )}
            {customer &&
              (token && !loginExpired ? (
                <form className="mt-4 space-y-4" onSubmit={placeOrder}>
                  {!earlierPickup && (
                    <>
                      <fieldset className="min-w-0" disabled={!!pending}>
                        <legend className="mb-2 max-w-full font-medium text-wrap!">
                          How would you like to get your order?
                        </legend>
                        <div className="flex flex-wrap gap-4">
                          {["Pickup", "Delivery"].map((method) => (
                            <label
                              key={method}
                              className="flex min-h-11 items-center gap-2"
                            >
                              <input
                                type="radio"
                                name="orderType"
                                value={method}
                                checked={orderType === method}
                                onChange={() => setOrderType(method)}
                              />
                              {method}
                            </label>
                          ))}
                        </div>
                        {orderType === "Delivery" && (
                          <label className="mt-3 block">
                            Delivery address
                            <input
                              type="text"
                              required
                              maxLength={255}
                              value={deliveryAddress}
                              autoComplete="off"
                              placeholder="Street address, city, state and ZIP"
                              onChange={(event) =>
                                setDeliveryAddress(event.target.value)
                              }
                              className="mt-1 block min-h-11 w-full rounded border px-3 py-2"
                            />
                          </label>
                        )}
                      </fieldset>
                      <p className="text-sm text-gray-700 text-wrap!">
                        This is a demo payment. You won’t be charged.
                      </p>
                    </>
                  )}
                  {error && (
                    <p role="alert" className="text-red-800 text-wrap!">
                      {error}
                    </p>
                  )}
                  {pending && !sending && (
                    <p className="text-sm text-wrap!">
                      {earlierPickup
                        ? "Check whether your earlier pay-at-pickup order was saved."
                        : "We'll check the order you already submitted."}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={
                      sending ||
                      (!pending && (previousOrderId === null || !cartInStock))
                    }
                    className="block min-h-11 w-full rounded bg-green-800 px-4 py-2 text-white text-wrap! disabled:opacity-50"
                  >
                    {earlierPickup
                      ? "Check previous order"
                      : sending
                        ? "Confirming…"
                        : pending
                          ? "Retry previous order"
                          : "Pay & place demo order"}
                  </button>
                </form>
              ) : token === null ? (
                <p className="mt-4 text-wrap!">
                  Online checkout is temporarily unavailable. Your cart is
                  saved.
                </p>
              ) : (
                <p className="mt-4 text-wrap!">
                  <Link
                    className="underline"
                    to="/customer/login?next=/checkout"
                  >
                    Log in again
                  </Link>{" "}
                  to place your order.
                </p>
              ))}
          </section>
        </div>
      )}
    </main>
  );
}

export default CheckoutPage;
