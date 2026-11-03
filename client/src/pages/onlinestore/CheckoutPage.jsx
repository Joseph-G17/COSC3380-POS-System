import { Link, useOutletContext } from "react-router-dom";

// Read Layout's current cart; this page displays a summary without submitting an order.
const CheckoutPage = () => {
  const { cartItems } = useOutletContext();

  // Use whole cents to match the cart panel's price rounding.
  let totalCents = 0;
  for (let i = 0; i < cartItems.length; i++) {
    const priceCents = Math.round(Number(cartItems[i].ItemPrice) * 100);
    totalCents += priceCents * cartItems[i].quantity;
  }

  // Render each product's unit price, quantity and line amount.
  function showOrderItem(item) {
    const priceCents = Math.round(Number(item.ItemPrice) * 100);
    const lineCents = priceCents * item.quantity;

    return (
      <li key={item.ItemID} className="border-b border-gray-200 py-4 last:border-b-0">
        {/* Wrap long names and details on narrow screens. */}
        <h3 className="font-medium" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
          {item.ItemName}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Unit price: ${(priceCents / 100).toFixed(2)}
          </p>
          <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Quantity: {item.quantity}
          </p>
          <p className="ml-auto text-right font-semibold" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            ${(lineCents / 100).toFixed(2)}
          </p>
        </div>
      </li>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 id="checkout-heading" tabIndex={-1} className="text-3xl" style={{ textWrap: "wrap" }}>
        Checkout
      </h1>

      <section aria-labelledby="order-summary-heading" className="mt-6 rounded border border-gray-200 bg-white p-4 sm:p-6">
        <h2 id="order-summary-heading" className="text-xl" style={{ textWrap: "wrap" }}>
          Order summary
        </h2>

        {/* A direct visit can have an empty cart. */}
        {cartItems.length === 0 && (
          <p className="mt-4 text-gray-600" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Your cart is empty. Add items from the shop to see them here.
          </p>
        )}

        {/* Use the same cart rows as the panel and header. */}
        {cartItems.length > 0 && <ul className="mt-2">{cartItems.map(showOrderItem)}</ul>}

        <p className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-lg font-semibold" aria-live="polite" aria-atomic="true">
          <span>Total</span>
          <span className="text-green-700" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            ${(totalCents / 100).toFixed(2)}
          </span>
        </p>
      </section>

      {/* Return to the shop while keeping the shared cart. */}
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded bg-black px-4 py-3 text-white hover:bg-gray-800" style={{ textWrap: "wrap" }}>
        Back to shop
      </Link>
    </main>
  );
};

export default CheckoutPage;
