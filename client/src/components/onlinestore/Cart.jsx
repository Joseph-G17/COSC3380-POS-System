// React uses the ref to find Close and the effect to move keyboard focus when the cart opens.
import { useEffect, useRef } from "react";

// Layout sends items (the cart array), action functions and isCartOpen (true or false).
// Cart displays those values; Layout changes the shared data when these functions are called.
const Cart = ({ items, onAddToCart, onClearCart, onDeleteCartItem, isCartOpen, onCloseCart, onCheckout }) => {
  // A ref remembers a page element between renders without creating new state.
  const closeButton = useRef(null); // React puts the actual Close button in closeButton.current.

  // Run when the cart opens or closes; changing quantities does not move focus again.
  useEffect(() => {
    if (!isCartOpen) {
      return; // Keep focus on the page while the cart is closed.
    }

    const previousFocus = document.activeElement; // Remember the control that opened the cart.
    // ?. calls focus only when React has connected the button to this ref.
    closeButton.current?.focus({ preventScroll: true }); // Focus Close without scrolling the sliding panel.

    // React runs this when the cart closes or leaves the page.
    return () => {
      // Only focus the old control if it still exists on the current page.
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true }); // Return focus without moving the page or panel.
      }
    };
  }, [isCartOpen]); // React repeats this effect only when the open/closed value changes.

  // Recalculate from current items each render; no second state needs to stay in sync.
  let totalCents = 0; // Start at zero so an empty cart displays $0.00.
  // i visits each row from index 0 through the last item in the cart array.
  for (let i = 0; i < items.length; i++) {
    // Number accepts API prices such as "3.99"; 100 converts dollars to whole cents.
    const priceCents = Math.round(Number(items[i].ItemPrice) * 100);
    // Multiply one unit's price by this row's quantity, then add it to the running total.
    totalCents += priceCents * items[i].quantity;
  }

  // map calls this with one cart item; each row gets its own minus and plus buttons.
  function showCartItems(item) {
    // Use the same whole-cent rounding as Total; this changes display only, not the saved price.
    const priceCents = Math.round(Number(item.ItemPrice) * 100);
    // Return this item's JSX row to map; its stable ItemID helps React track the row.
    return (
      <div key={item.ItemID} className="mb-3 border-b pb-3">
        {/* Local wrapping overrides the page's no-wrap rule for long product names. */}
        <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>{item.ItemName}</p>
        {/* Convert cents to dollars; toFixed(2) displays one unit as $3.50 instead of $3.5. */}
        <p className="mt-1">Price: ${(priceCents / 100).toFixed(2)}</p>
        <div className="mt-2 flex items-center gap-2">
          {/* Minus sends this row's ID to Layout; one remaining unit removes the row.
              The arrow waits for a click before calling onDeleteCartItem with this item's ID.
              type="button" avoids form submission; the label/title name the icon; size-11 gives a larger click area. */}
          <button
            type="button"
            aria-label={"Remove one " + item.ItemName}
            title="Remove one"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded border hover:bg-gray-100"
            onClick={() => onDeleteCartItem(item.ItemID)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          {/* Keep the number centered; politely announce quantity changes to screen readers. */}
          <span className="min-w-8 text-center" aria-live="polite">
            {/* sr-only explains the number to screen readers without adding visible text. */}
            <span className="sr-only">Quantity: </span>
            {item.quantity}
          </span>
          {/* Plus passes this item to the same Layout function used by Add to Cart.
              The arrow delays the call until clicked; ItemID tells Layout which quantity to increase. */}
          <button
            type="button"
            aria-label={"Add one " + item.ItemName}
            title="Add one"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded border hover:bg-gray-100"
            onClick={() => onAddToCart(item)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Closed: move the panel right by its own width. Open: use no horizontal movement.
  let cartPosition = "translate-x-full"; // Start with the CSS class for a hidden panel.
  if (isCartOpen) {
    cartPosition = "translate-x-0"; // Replace that class when Layout says the panel is open.
  }

  return (
    // Clip the offscreen panel; the wrapper lets clicks reach the page outside the cart.
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Keep the panel mounted so changing its transform can animate the slide.
          id connects Navbar to this panel; aria-labelledby uses the heading as its accessible name.
          aria-hidden hides a closed panel from screen readers; inert prevents clicking or focusing it.
          Fixed width/height and scrolling keep the items inside the panel; ease-out slows its final movement.
          motion-reduce removes the animation when the visitor prefers less motion. */}
      <aside
        id="shopping-cart"
        aria-labelledby="shopping-cart-title"
        aria-hidden={!isCartOpen}
        inert={!isCartOpen}
        onKeyDown={(event) => {
          // The browser supplies event; check which key was pressed inside this panel.
          if (event.key === "Escape") {
            onCloseCart(); // Escape inside the panel calls Layout's close action.
          }
        }}
        className={
          "pointer-events-auto absolute right-0 top-0 h-full w-full max-w-sm overflow-x-hidden overflow-y-auto border-l bg-white p-4 transition-transform duration-300 ease-out motion-reduce:transition-none " +
          cartPosition
        }
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="shopping-cart-title">Your cart</h2>
          {/* The X closes the panel without removing items; the label names the icon button.
              ref connects this button to closeButton, so the opening effect can focus it.
              Passing onCloseCart directly lets React call it only when the button is clicked. */}
          <button
            ref={closeButton}
            type="button"
            onClick={onCloseCart}
            aria-label="Close cart"
            title="Close cart"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded border hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Show this explanation only when no rows remain; wrapping keeps it inside a phone-width panel. */}
        {items.length === 0 && (
          <p role="status" className="mb-4 text-gray-600" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Your cart is empty. Add items from the shop to get started.
          </p>
        )}
        {/* map collects one row for each item; Layout still owns all cart data and actions. */}
        {items.map(showCartItems)}
        {/* Convert cents back to dollars; toFixed(2) always shows two decimal places.
            justify-between puts the label and amount on opposite sides.
            aria-live/aria-atomic announce the updated total as one complete message. */}
        <p
          className="mt-4 flex items-center justify-between gap-4 border-t pt-4 font-semibold"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>Total</span>
          <span>${(totalCents / 100).toFixed(2)}</span>
        </p>
        {/* Layout opens checkout with the same cart; an empty cart cannot continue.
            items.length === 0 supplies true to disabled only when no rows remain.
            block and w-full put Checkout on its own full-width line. */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onCheckout}
          className="mt-4 block min-h-11 w-full rounded bg-black px-4 py-3 font-semibold text-white enabled:hover:bg-gray-800 disabled:opacity-50"
        >
          Checkout
        </button>
        {/* The trash icon clears every item through the existing Layout action.
            No item ID is needed because this action empties the whole cart. */}
        <button
          type="button"
          onClick={onClearCart}
          aria-label="Clear cart"
          title="Clear cart"
          className="mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded border hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" aria-hidden="true" focusable="false">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </aside>
    </div>
  );
};

export default Cart; // Allow Layout to import and use the cart panel.
