import { useEffect, useState } from 'react';

const discountColumns = [
  ['DiscountCode', 'Discount code'],
  ['ItemID', 'Item ID'],
  ['DiscountPercent', 'Discount'],
  ['NewItemPrice', 'New item price'],
  ['ExpirationDate', 'Expiration date']
];

const isPastDiscount = (discount) => {
  if (!discount.ExpirationDate) return false;

  const expiration = new Date(discount.ExpirationDate);
  return !Number.isNaN(expiration.getTime()) && expiration < new Date();
};

const CashierViewDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [showPastDiscounts, setShowPastDiscounts] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const response = await fetch('/api/discounts');
        if (!response.ok) throw new Error('Could not load discounts');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('The discounts response was invalid');

        setDiscounts(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscounts();
  }, []);

  const visibleDiscounts = discounts.filter((discount) =>
    isPastDiscount(discount) === showPastDiscounts
  );

  return (
    <section className="border-b border-r p-10">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl underline">
          {showPastDiscounts ? 'Past discounts' : 'Current discounts'}
        </h1>
        <button
          className="border-2 p-2"
          type="button"
          onClick={() => setShowPastDiscounts((showPast) => !showPast)}
        >
          {showPastDiscounts ? 'Show current discounts' : 'Show past discounts'}
        </button>
      </header>

      {isLoading && <p>Loading discounts...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && visibleDiscounts.length === 0 && (
        <p>No {showPastDiscounts ? 'past' : 'current'} discounts found.</p>
      )}

      {!isLoading && !error && visibleDiscounts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {discountColumns.map(([, label]) => (
                  <th key={label} className="border p-2">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleDiscounts.map((discount, index) => (
                <tr key={discount.DiscountID ?? index}>
                  {discountColumns.map(([column]) => (
                    <td key={column} className="border p-2">
                      {column === 'DiscountPercent' && discount[column] != null
                        ? `${discount[column]}%`
                        : discount[column] ?? '—'}
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

export default CashierViewDiscounts;
