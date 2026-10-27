import { useEffect, useRef } from "react";

// Layout owns the cart items and actions; this component displays them.
const Cart = ({ items, onAddToCart, onClearCart, onDeleteCartItem, isCartOpen, onCloseCart, onCheckout }) => {
  // React stores the Close button here so the opening effect can focus it.
  const closeButton = useRef(null);

  // Move focus to Close on opening and return it to the previous control on closing.
  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const previousFocus = document.activeElement;
    closeButton.current?.focus({ preventScroll: true });

    return () => {
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [isCartOpen]);

  // Calculate in whole cents so displayed prices and the total use the same rounding.
  let totalCents = 0;
  for (let i = 0; i < items.length; i++) {
    const priceCents = Math.round(Number(items[i].ItemPrice) * 100);
    totalCents += priceCents * items[i].quantity;
  }

  // Render one cart row with Minus and Plus actions.
  function showCartItems(item) {
    const priceCents = Math.round(Number(item.ItemPrice) * 100);
    return (
      <div key={item.ItemID} className="mb-3 border-b pb-3">
        <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>{item.ItemName}</p>
        <p className="mt-1">Price: ${(priceCents / 100).toFixed(2)}</p>
        <div className="mt-2 flex items-center gap-2">
          {/* Minus removes one unit; the last unit removes the row. */}
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
          <span className="min-w-8 text-center" aria-live="polite">
            <span className="sr-only">Quantity: </span>
            {item.quantity}
          </span>
          {/* Plus uses Layout's shared Add action for this product. */}
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

  // Keep the panel mounted so its open/closed position can animate.
  let cartPosition = "translate-x-full";
  if (isCartOpen) {
    cartPosition = "translate-x-0";
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* A closed panel is hidden from assistive tools and cannot receive focus. */}
      <aside
        id="shopping-cart"
        aria-labelledby="shopping-cart-title"
        aria-hidden={!isCartOpen}
        inert={!isCartOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onCloseCart();
          }
        }}
        className={
          "pointer-events-auto absolute right-0 top-0 h-full w-full max-w-sm overflow-x-hidden overflow-y-auto border-l bg-white p-4 transition-transform duration-300 ease-out motion-reduce:transition-none " +
          cartPosition
        }
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="shopping-cart-title">Your cart</h2>
          {/* Close hides the panel without removing cart items. */}
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

        {/* An empty cart has no rows and cannot continue to Checkout. */}
        {items.length === 0 && (
          <p role="status" className="mb-4 text-gray-600" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
            Your cart is empty. Add items from the shop to get started.
          </p>
        )}
        {/* Layout's current rows also determine the total below. */}
        {items.map(showCartItems)}
        <p
          className="mt-4 flex items-center justify-between gap-4 border-t pt-4 font-semibold"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>Total</span>
          <span>${(totalCents / 100).toFixed(2)}</span>
        </p>
        {/* Continue with the same cart; do not submit an empty cart. */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onCheckout}
          className="mt-4 block min-h-11 w-full rounded bg-black px-4 py-3 font-semibold text-white enabled:hover:bg-gray-800 disabled:opacity-50"
        >
          Checkout
        </button>
        {/* Clear removes every row through Layout's shared action. */}
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

export default Cart;
