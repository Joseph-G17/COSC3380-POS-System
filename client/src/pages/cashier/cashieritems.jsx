import { useEffect, useState } from 'react';

const CashierViewitems = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/items')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load items');
        return response.json();
      })
      .then(setItems)
      .catch((error) => setError(error.message));
  }, []);

  return (
    <section className="border-b border-r p-10">
      <h1 className="mb-6 text-3xl underline">Items</h1>

      {error && <p role="alert">{error}</p>}
      {!error && items.length === 0 && <p>No items found.</p>}

      {items.length > 0 && (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {Object.keys(items[0]).map((column) => (
                <th key={column} className="border p-2">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.ItemID ?? index}>
                {Object.values(item).map((value, cellIndex) => (
                  <td key={cellIndex} className="border p-2">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default CashierViewitems;