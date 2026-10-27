import { useEffect, useState } from 'react';

const orderColumns = [
  ['OrderID', 'Order ID'],
  ['EmployeeID', 'Employee ID'],
  ['CustomerID', 'Customer ID'],
  ['OrderType', 'Order type'],
  ['OrderTotal', 'Order total'],
  ['PaymentMethod', 'Payment method'],
  ['LastFourDigits', 'Last four digits'],
  ['OrderDate', 'Order date'],
  ['SeasonID', 'Season ID'],
  ['SaleID', 'Sale ID'],
  ['DiscountID', 'Discount ID']
];

const CashierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch('/api/orders');
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
    <section className="border-b border-r p-10">
      <h1 className="mb-6 text-3xl underline">Orders</h1>

      {isLoading && <p>Loading orders...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && orders.length === 0 && <p>No orders found.</p>}

      {!isLoading && !error && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {orderColumns.map(([, label]) => (
                  <th key={label} className="border p-2">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.OrderID ?? index}>
                  {orderColumns.map(([column]) => (
                    <td key={column} className="border p-2">
                      {column === 'OrderTotal' && order[column] != null
                        ? `$${Number(order[column]).toFixed(2)}`
                        : order[column] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CashierOrders;
