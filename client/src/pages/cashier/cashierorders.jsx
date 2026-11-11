import { useEffect, useState } from 'react';

const formatOrderDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const CashierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const columns = orders.length > 0
    ? Object.keys(orders[0]).filter((column) => column !== 'OrderID')
    : [];

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch('/api/Orders');
        if (!response.ok) throw new Error('Could not load orders');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('The orders response was invalid');

        setOrders(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <section className="min-w-0 border-b border-r">
      <h1 className="admin-entity-header p-10 text-3xl underline">Orders</h1>

      {isLoading && <p className="p-4">Loading orders...</p>}
      {error && <p className="p-4" role="alert">{error}</p>}
      {!isLoading && !error && orders.length === 0 && <p className="p-4">No orders found.</p>}

      {!isLoading && !error && orders.length > 0 && (
        <div className="overflow-x-auto">
          <p className="pb-4 pl-4 text-sm text-gray-500">Total Rows: {orders.length}</p>
          <div
            className="sticky top-0 grid bg-white"
            style={{ gridTemplateColumns: `repeat(${columns.length || 1}, minmax(10rem, 1fr))` }}
          >
            {columns.map((column) => (
              <h2 className="border-b" key={column}>
                {column.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </h2>
            ))}
          </div>
          <div>
            {orders.map((order, index) => (
              <div
                className="grid grid-flow-col auto-cols-fr hover:bg-amber-50"
                key={order.OrderID ?? index}
              >
                {columns.map((column) => (
                  <span className="truncate border-b px-3 py-4 text-left" key={column}>
                    {column === 'OrderTotal' && order[column] != null
                      ? `$${Number(order[column]).toFixed(2)}`
                      : column === 'OrderDate'
                        ? formatOrderDate(order[column])
                        : order[column] ?? '—'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CashierOrders;
