import { Link, useOutletContext } from "react-router-dom";
import { loadCustomer } from "../customer/customerSession";
import { useState } from "react";

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
  const [orderType, setOrderType] = useState("Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  //What the customer types in the discount code box
  //Empty means no code
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

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

  //Total after the discount, kept in cents like the server
  let finalCents = totalCents;
  if(appliedDiscount !== null){
    finalCents = Math.round(totalCents * (100 - appliedDiscount.discountPercent) / 100);
  }

  const cartInStock =
    cartItems.length > 0 &&
    cartItems.every(
      (item) => stockById.get(Number(item.ItemID)) >= item.quantity,
    );

  //Ask the server if this customer can use the code, and show the new total
  async function applyDiscount(){
    if(!customer || !discountCode.trim()){
      return;
    }
    setError("");
    try{
      const response = await fetch("/api/customer/discount?customerId=" + customer.customerID + "&code=" + encodeURIComponent(discountCode.trim()));
      const result = await response.json();
      if(!response.ok){
        setAppliedDiscount(null);
        setError(result.message);
        return;
      }else{
        setAppliedDiscount(result);
      }
    }catch{
      setError("We couldn't reach the store. Check your connection and try again.");
    }
  }

  function handleDiscountChange(event){
    setDiscountCode(event.target.value);
    setAppliedDiscount(null); //The code changed, so it has to be applied again
  }

  // Send the customer ID, pickup or delivery, and the cart to the server.
  // The server saves the order and sends back a receipt with the new OrderID.
  async function placeOrder(event) {
    event.preventDefault();
    if (sending || !customer || !cartInStock) return;
    if (orderType === "Delivery" && !deliveryAddress.trim()) {
      setError("Enter your delivery address.");
      return;
    }

    const items = [];
    for (const item of cartItems) {
      items.push({ itemId: Number(item.ItemID), quantity: item.quantity });
    }
    const order = {
      customerId: customer.customerID,
      orderType: orderType,
      deliveryAddress: orderType === "Delivery" ? deliveryAddress.trim() : null,
      items: items,
      //Only send the code if Apply worked
      //The server will check it again
      discountCode: appliedDiscount ? appliedDiscount.discountCode : null,
    };

    setSending(true);
    setReceipt(null);
    setError("");
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const result = await response.json();
      if (!response.ok) {
        // For example: not enough stock left. The cart stays so the customer can fix it.
        setError(result.message || "We couldn’t place your order. Please try again.");
        refreshStock();
        return;
      }
      setReceipt(result);
      removePurchasedItems(order.items);
      refreshStock();
    } catch {
      setError("We couldn’t reach the store. Check your connection and try again.");
    } finally {
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
            Paid with demo card ·{" "}
            {money(Math.round(Number(receipt.OrderTotal) * 100))}
          </p>
          <p className="mt-1 text-wrap! wrap-anywhere">
            {receipt.orderType === "Delivery"
              ? "Delivery to " + receipt.deliveryAddress
              : "Pickup at the store."}
          </p>
          <Link
            to="/customer/profile"
            className="mt-2 inline-block text-green-900 underline"
          >
            View order history
          </Link>
        </section>
      )}
      {cartItems.length === 0 ? (
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
          </section>
          <section
            aria-labelledby="summary-heading"
            aria-busy={sending}
            className="min-w-0 rounded border border-gray-200 p-4"
          >
            <h2 id="summary-heading" className="text-xl">
              Order summary
            </h2>
            <p className="my-3" aria-live="polite">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </p>
            {appliedDiscount && (
              <div className="flex flex-wrap justify-between gap-2 py-1">
                <span>Discount ({appliedDiscount.discountCode}, {appliedDiscount.discountPercent}%)</span>
                <span>-{money(totalCents - finalCents)}</span>
              </div>
            )}
            <div
              className="flex flex-wrap justify-between gap-2 border-t py-3 font-semibold"
              aria-live="polite"
            >
              <span>Estimated total</span>
              <span>{money(finalCents)}</span>
            </div>
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
            {customer && (
              <form className="mt-4 space-y-4" onSubmit={placeOrder}>
                <fieldset className="min-w-0" disabled={sending}>
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
                  {/*Optional code box: Apply checks the code now, the server checks it again when the order is placed*/}
                  <label className="mt-3 block">
                    Discount code
                    <input
                      type="text"
                      maxLength={20}
                      value={discountCode}
                      onChange={handleDiscountChange}
                      className="mt-1 block min-h-11 w-full rounded border px-3 py-2"
                    />
                  </label>
                  <button type="button" onClick={applyDiscount} className="mt-2 min-h-11 rounded border px-4 py-2">Apply</button>
                </fieldset>
                <p className="text-sm text-gray-700 text-wrap!">
                  This is a demo payment. You won’t be charged.
                </p>
                {error && (
                  <p role="alert" className="text-red-800 text-wrap!">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending || !cartInStock}
                  className="block min-h-11 w-full rounded bg-green-800 px-4 py-2 text-white text-wrap! disabled:opacity-50"
                >
                  {sending ? "Placing order…" : "Pay & place demo order"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default CheckoutPage;
