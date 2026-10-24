import { Link, useOutletContext } from "react-router-dom"; // Link changes pages; Outlet supplies Layout's cart.

// React displays the current cart here; Layout still owns the items and quantities.
const CheckoutPage = () => {
  const { cartItems } = useOutletContext(); // Read the same cart used by Navbar and the cart panel.

  // Recalculate from current items each render, using the same whole-cent calculation as Cart.
  let totalCents = 0; // Reset the running total before visiting this render's rows.
  // i visits every array position, starting with the first item at index 0.
  for (let i = 0; i < cartItems.length; i++) {
    // Number accepts API prices such as "3.99"; round the unit price before multiplying quantity.
    const priceCents = Math.round(Number(cartItems[i].ItemPrice) * 100);
    totalCents += priceCents * cartItems[i].quantity; // Add all units of this product to the order amount.
  }

  // map calls this once per product and collects the returned summary rows.
  function showOrderItem(item) {
    const priceCents = Math.round(Number(item.ItemPrice) * 100); // Convert this row's unit price to whole cents.
    const lineCents = priceCents * item.quantity; // This row's amount includes every unit of this product.

    // Return one list entry; the product ID lets React track it after cart changes.
    return (
      <li key={item.ItemID} className="border-b border-gray-200 py-4 last:border-b-0">
        {/* Override the global no-wrap rule so long product names fit on small screens. */}
        <h3 className="font-medium" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
          {item.ItemName}
        </h3>
        {/* Each detail can move to another line when the available width is small. */}
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {/* Divide cents by 100 for dollars; two decimal places keep prices consistent. */}
          <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Unit price: ${(priceCents / 100).toFixed(2)}
          </p>
          {/* Braces display the quantity currently stored in Layout for this product. */}
          <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Quantity: {item.quantity}
          </p>
          {/* ml-auto pushes this product's amount to the right, matching the Total amount below. */}
          <p className="ml-auto text-right font-semibold" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            ${(lineCents / 100).toFixed(2)}
          </p>
        </div>
      </li>
    );
  }

  // Center the page, limit its width and leave padding around the order summary.
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      {/* The heading can receive focus after navigation without joining the normal Tab order. */}
      <h1 id="checkout-heading" tabIndex={-1} className="text-3xl" style={{ textWrap: "wrap" }}>
        Checkout
      </h1>

      {/* Connect this section to its heading so screen readers can identify the summary. */}
      <section aria-labelledby="order-summary-heading" className="mt-6 rounded border border-gray-200 bg-white p-4 sm:p-6">
        <h2 id="order-summary-heading" className="text-xl" style={{ textWrap: "wrap" }}>
          Order summary
        </h2>

        {/* && displays the message only when the condition on its left is true.
            A direct visit without saved items, or clearing the panel, can leave this cart empty. */}
        {cartItems.length === 0 && (
          <p className="mt-4 text-gray-600" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Your cart is empty. Add items from the shop to see them here.
          </p>
        )}

        {/* Layout supplies these rows, so cart changes also update this summary.
            map calls showOrderItem for every product and displays the returned list entries. */}
        {cartItems.length > 0 && <ul className="mt-2">{cartItems.map(showOrderItem)}</ul>}

        {/* Convert the final cents to dollars; toFixed(2) always shows two decimal places.
            justify-between separates the label and amount; aria-live/aria-atomic announce total changes together. */}
        <p className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-lg font-semibold" aria-live="polite" aria-atomic="true">
          <span>Total</span>
          <span className="text-green-700" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            ${(totalCents / 100).toFixed(2)}
          </span>
        </p>
      </section>

      {/* Link changes the route to / without reloading the document.
          The shared Layout stays mounted, so returning to the shop keeps the same cart. */}
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded bg-black px-4 py-3 text-white hover:bg-gray-800" style={{ textWrap: "wrap" }}>
        Back to shop
      </Link>
    </main>
  );
};

export default CheckoutPage; // Allow App to display this page at the checkout route.
