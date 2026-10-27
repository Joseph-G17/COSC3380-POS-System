import { useEffect, useState } from 'react';

const CashierViewitems = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (!response.ok) throw new Error('Could not load items');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('The items response was invalid');

        setItems(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  const adjustStock = async (item, change) => {
    setError('');
    setUpdatingItemId(item.ItemID);

    try {
      const response = await fetch(`/api/items/${item.ItemID}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not adjust item stock');

      setItems((currentItems) => currentItems.map((currentItem) =>
        currentItem.ItemID === result.ItemID
          ? { ...currentItem, Stock: result.Stock }
          : currentItem
      ));
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const columns = items.length > 0
    ? Object.keys(items[0]).filter((column) => column !== 'Stock')
    : [];

  return (
    <section className="border-b border-r p-10">
      <h1 className="mb-6 text-3xl underline">Items</h1>

      {error && <p className="mb-4" role="alert">{error}</p>}
      {isLoading && <p>Loading items...</p>}
      {!isLoading && !error && items.length === 0 && <p>No items found.</p>}

      {!isLoading && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} className="border p-2">{column}</th>
                ))}
                <th className="border p-2">Stock</th>
                <th className="border p-2">Adjust stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stock = Number(item.Stock) || 0;
                const isUpdating = updatingItemId === item.ItemID;

                return (
                  <tr key={item.ItemID}>
                    {columns.map((column) => (
                      <td key={column} className="border p-2">
                        {item[column] ?? '—'}
                      </td>
                    ))}
                    <td className="border p-2">{stock}</td>
                    <td className="border p-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="border px-3 py-1 disabled:opacity-50"
                          type="button"
                          aria-label={`Remove one ${item.ItemName} from stock`}
                          disabled={isUpdating || stock === 0}
                          onClick={() => adjustStock(item, -1)}
                        >
                          −
                        </button>
                        <button
                          className="border px-3 py-1 disabled:opacity-50"
                          type="button"
                          aria-label={`Add one ${item.ItemName} to stock`}
                          disabled={isUpdating || stock >= 65535}
                          onClick={() => adjustStock(item, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CashierViewitems;