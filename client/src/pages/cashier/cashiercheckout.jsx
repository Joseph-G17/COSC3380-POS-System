import { useEffect, useMemo, useState } from 'react';

const formatPrice = (priceInCents) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(priceInCents / 100);

const getItemName = (item) => item.ItemName || item.ItemDescription || `Item ${item.ItemID}`;

const CashierCheckout = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [employeeId, setEmployeeId] = useState(
    () => sessionStorage.getItem('employeeID') ?? ''
  );
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) throw new Error('Could not load items');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('The items response was invalid');

        const validItems = data.map((item) => {
          const price = Number(item.ItemPrice);
          const stock = Number(item.Stock);
          if (!item.ItemID || !Number.isFinite(price) || price <= 0 ||
              !Number.isFinite(stock) || stock < 0) {
            throw new Error('An item has invalid price or stock information');
          }

          return {
            ...item,
            priceInCents: Math.round(price * 100),
            Stock: stock
          };
        });

        setItems(validItems);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load items');
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return items;

    return items.filter((item) =>
      [item.ItemName, item.ItemCategoryID, item.ItemDescription]
        .some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch))
    );
  }, [items, search]);

  const totalInCents = cart.reduce(
    (total, cartItem) => total + cartItem.item.priceInCents * cartItem.quantity,
    0
  );

  const addItem = (item) => {
    setCart((currentCart) => {
      const existing = currentCart.find((cartItem) => cartItem.item.ItemID === item.ItemID);
      if (existing) {
        if (existing.quantity >= item.Stock) return currentCart;
        return currentCart.map((cartItem) =>
          cartItem.item.ItemID === item.ItemID
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      if (item.Stock < 1) return currentCart;
      return [...currentCart, { item, quantity: 1 }];
    });
  };

  const changeQuantity = (itemId, change) => {
    setCart((currentCart) => currentCart.flatMap((cartItem) => {
      if (cartItem.item.ItemID !== itemId) return [cartItem];

      const quantity = cartItem.quantity + change;
      return quantity > 0 ? [{ ...cartItem, quantity }] : [];
    }));
  };

  const checkout = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: Number(employeeId),
          customerId: Number(customerId),
          paymentMethod,
          items: cart.map(({ item, quantity }) => ({
            itemId: Number(item.ItemID),
            quantity
          }))
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not complete checkout');

      setItems((currentItems) => currentItems.map((item) => {
        const purchased = cart.find((cartItem) => cartItem.item.ItemID === item.ItemID);
        return purchased
          ? { ...item, Stock: item.Stock - purchased.quantity }
          : item;
      }));
      setCart([]);
      setCustomerId('');
      setSuccessMessage(`Order #${result.OrderID} was created. Total: ${formatPrice(Math.round(Number(result.OrderTotal) * 100))}`);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Could not complete checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-w-0 border-b border-r p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <p className="mt-2 text-gray-600">Add items to the sale and the total updates automatically.</p>
      </header>

      {error && <p className="mb-5 rounded border border-red-300 bg-red-50 p-3 text-red-800" role="alert">{error}</p>}
      {successMessage && <p className="mb-5 rounded border border-green-300 bg-green-50 p-3 text-green-800" role="status">{successMessage}</p>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
        <section aria-labelledby="available-items-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="available-items-heading" className="text-xl font-medium">Available items</h2>
            <label className="sr-only" htmlFor="item-search">Search items</label>
            <input
              className="w-full rounded border px-3 py-2 sm:max-w-xs"
              id="item-search"
              type="search"
              placeholder="Search items"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading && <p>Loading items...</p>}
          {!isLoading && !error && items.length === 0 && <p>No items available.</p>}
          {!isLoading && items.length > 0 && filteredItems.length === 0 && (
            <p>No items match your search.</p>
          )}

          {!isLoading && filteredItems.length > 0 && (
            <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredItems.map((item) => {
                const quantityInCart = cart.find(
                  (cartItem) => cartItem.item.ItemID === item.ItemID
                )?.quantity ?? 0;
                const isOutOfStock = item.Stock === 0;
                const reachedStockLimit = quantityInCart >= item.Stock;

                return (
                  <article
                    className="flex min-w-0 flex-col justify-between rounded-lg border bg-white p-4 shadow-sm"
                    key={item.ItemID}
                  >
                    <div className="min-w-0">
                      <h3 className="break-words font-medium">{getItemName(item)}</h3>
                      {item.ItemCategoryID != null && (
                        <p className="mt-1 text-sm text-gray-500">Category {item.ItemCategoryID}</p>
                      )}
                      <p className="mt-3 text-lg font-semibold">{formatPrice(item.priceInCents)}</p>
                      <p className="mt-1 text-sm text-gray-600">{item.Stock} in stock</p>
                    </div>
                    <button
                      className="mt-4 rounded bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      disabled={isSubmitting || isOutOfStock || reachedStockLimit}
                      onClick={() => addItem(item)}
                    >
                      {isOutOfStock ? 'Out of stock' : reachedStockLimit ? 'Stock limit reached' : 'Add to sale'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="h-fit rounded-lg border bg-white p-5 shadow-sm" aria-labelledby="sale-heading">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="sale-heading" className="text-xl font-medium">Current sale</h2>
            {cart.length > 0 && (
              <button
                className="text-sm text-red-700 underline hover:text-red-900"
                type="button"
                disabled={isSubmitting}
                onClick={() => setCart([])}
              >
                Clear sale
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="rounded bg-gray-50 p-5 text-center text-gray-600">No items added yet.</p>
          ) : (
            <ul className="divide-y">
              {cart.map(({ item, quantity }) => (
                <li className="flex items-center justify-between gap-3 py-4" key={item.ItemID}>
                  <div className="min-w-0">
                    <p className="break-words font-medium">{getItemName(item)}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatPrice(item.priceInCents)} each
                    </p>
                    <p className="mt-1 font-medium">
                      {formatPrice(item.priceInCents * quantity)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      className="h-9 w-9 rounded border text-lg disabled:opacity-50"
                      type="button"
                      aria-label={`Remove one ${getItemName(item)}`}
                      disabled={isSubmitting}
                      onClick={() => changeQuantity(item.ItemID, -1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center" aria-label={`Quantity ${quantity}`}>
                      {quantity}
                    </span>
                    <button
                      className="h-9 w-9 rounded border text-lg disabled:opacity-50"
                      type="button"
                      aria-label={`Add one ${getItemName(item)}`}
                      disabled={isSubmitting || quantity >= item.Stock}
                      onClick={() => changeQuantity(item.ItemID, 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-4 text-xl font-semibold">
            <span>Total</span>
            <span aria-live="polite">{formatPrice(totalInCents)}</span>
          </div>

          <form className="mt-5 space-y-4 border-t pt-5" onSubmit={checkout}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="customer-id">Customer ID</label>
              <input
                className="w-full rounded border px-3 py-2"
                id="customer-id"
                type="number"
                min="1"
                step="1"
                required
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="cashier-employee-id">
                Cashier employee ID
              </label>
              <input
                className="w-full rounded border px-3 py-2"
                id="cashier-employee-id"
                type="number"
                min="1"
                step="1"
                required
                value={employeeId}
                readOnly={Boolean(employeeId)}
                onChange={(event) => setEmployeeId(event.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Required to record which cashier handled the order.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="payment-method">Payment method</label>
              <select
                className="w-full rounded border px-3 py-2"
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Giftcard">Gift card</option>
              </select>
            </div>
            <button
              className="w-full rounded bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={cart.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Creating order...' : 'Checkout'}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
};

export default CashierCheckout;
