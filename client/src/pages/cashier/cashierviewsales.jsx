import { useEffect, useState } from 'react';

const saleColumns = [
  ['SaleName', 'Sale name'],
  ['SaleStartDate', 'Start date'],
  ['SaleEndDate', 'End date'],
  ['RepeatableSaleStartDate', 'Repeatable start'],
  ['RepeatableSaleEndDate', 'Repeatable end']
];

const isPastSale = (sale) => {
  if (!sale.SaleEndDate) return false;

  const endDate = new Date(sale.SaleEndDate);
  return !Number.isNaN(endDate.getTime()) && endDate < new Date();
};

const CashierViewSales = () => {
  const [sales, setSales] = useState([]);
  const [showPastSales, setShowPastSales] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const response = await fetch('/api/sales');
        if (!response.ok) throw new Error('Could not load sales');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('The sales response was invalid');

        setSales(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSales();
  }, []);

  const visibleSales = sales.filter((sale) => isPastSale(sale) === showPastSales);

  return (
    <section className="border-b border-r p-10">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl underline">
          {showPastSales ? 'Past sales' : 'Current sales'}
        </h1>
        <button
          className="border-2 p-2"
          type="button"
          onClick={() => setShowPastSales((showPast) => !showPast)}
        >
          {showPastSales ? 'Show current sales' : 'Show past sales'}
        </button>
      </header>

      {isLoading && <p>Loading sales...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && visibleSales.length === 0 && (
        <p>No {showPastSales ? 'past' : 'current'} sales found.</p>
      )}

      {!isLoading && !error && visibleSales.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {saleColumns.map(([, label]) => (
                  <th key={label} className="border p-2">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleSales.map((sale, index) => (
                <tr key={sale.SaleID ?? index}>
                  {saleColumns.map(([column]) => (
                    <td key={column} className="border p-2">
                      {sale[column] ?? '—'}
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

export default CashierViewSales;
