import TitleHeader from "../../components/admin/TitleHeader"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react";

const FILTERS = {
  SalesSummary: [
    { name: 'from', label: 'From date', type: 'date' },
    { name: 'to', label: 'To date', type: 'date' },
    { name: 'orderType', label: 'Order Type', type: 'select', column: 'OrderType' },
    { name: 'paymentMethod', label: 'Payment', type: 'select', column: 'PaymentMethod' },
    { name: 'minSales', label: 'Min Total Sales ($)', type: 'number', placeholder: 'e.g. 10' }
  ],
  StockReport: [
    { name: 'itemName', label: 'Item', type: 'text', column: 'ItemName', placeholder: 'e.g. Milk' },
    { name: 'category', label: 'Category', type: 'select', column: 'Category' },
    { name: 'supplier', label: 'Supplier', type: 'select', column: 'Supplier' },
    { name: 'status', label: 'Stock Status', type: 'select', column: 'StockStatus' },
    { name: 'maxStock', label: 'Stock At Most', type: 'number', placeholder: 'e.g. 10' }
  ],
  EmployeeSales: [
    { name: 'employee', label: 'Employee', type: 'text', column: 'EmployeeName', placeholder: 'e.g. Sam' },
    { name: 'department', label: 'Department', type: 'select', column: 'Department' },
    { name: 'from', label: 'From month', type: 'month' },
    { name: 'to', label: 'To month', type: 'month' },
    { name: 'minSales', label: 'Min Total Sales ($)', type: 'number', placeholder: 'e.g. 10' }
  ],
  CustomerPurchases: [
    { name: 'customer', label: 'Customer', type: 'text', column: 'CustomerName', placeholder: 'e.g. Maya' },
    { name: 'channel', label: 'Channel', type: 'select', column: 'Channel' },
    { name: 'orderType', label: 'Order Type', type: 'select', column: 'OrderType' },
    { name: 'paymentMethod', label: 'Payment', type: 'select', column: 'PaymentMethod' },
    { name: 'category', label: 'Category', type: 'select', column: 'Category' },
    { name: 'itemName', label: 'Item', type: 'text', column: 'ItemName', placeholder: 'e.g. Apples' },
    { name: 'from', label: 'From date', type: 'date' },
    { name: 'to', label: 'To date', type: 'date' }
  ],
  ItemPerformance: [
    { name: 'itemName', label: 'Item', type: 'text', column: 'ItemName', placeholder: 'e.g. Milk' },
    { name: 'category', label: 'Category', type: 'select', column: 'Category' },
    { name: 'minSold', label: 'Units Sold At Least', type: 'number', placeholder: 'e.g. 5' },
    { name: 'maxSold', label: 'Units Sold At Most', type: 'number', placeholder: 'e.g. 2' },
    { name: 'minReturned', label: 'Units Returned At Least', type: 'number', placeholder: 'e.g. 1' }
  ],
};

const ReportsPage = () => {
  const {report} =  useParams();
  const [rows, setRows] = useState([]); //rows that match filters
  const [allRows, setAllRows] = useState([]); //thw whole report
  const [filters, setFilters] = useState({});
   const [applied, setApplied] = useState(0);  //how many filters the last apply used
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  const loadData = async (currentFilters) => {
    try{
      if (currentFilters.from && currentFilters.to && currentFilters.from > currentFilters.to) {
        setRows([]);
        setMessage('"From" must be before "To".');
        return;
      }

      //blank filters are left out of the url
      const params = new URLSearchParams();
      let count = 0;
      for (const name in currentFilters) {
        if (currentFilters[name] !== '') {
          params.append(name, currentFilters[name]);
          count++;
        }
      }

      const response = await fetch(`/api/reports/${report}?${params}`);  //params = from=2026-10-01&orderType=Pickup
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setRows(data);
      if (count === 0) setAllRows(data); //no filters = the whole report
      setApplied(count);
      setMessage('');
      setLoaded(true);
    } catch(error){
      console.log(error);
      setRows([]);
      setMessage(error.message);
    }
  }
    
  useEffect(() => {
    setFilters({});
    setRows([]);
    setAllRows([]);
    setApplied(0);
    setLoaded(false);
    loadData({});
  }, [report]);

  const handleChange = (name, value) => {
    setFilters({...filters, [name]: value});
  }

  const handleReset = () => {
    setFilters({});
    loadData({});
  }

  //how many times each value shows up in a column
  const getCounts = (column) => {
    const counts = {};
    allRows.forEach((row) => {
      const value = row[column];
      if (value === null || value === undefined || value === '') return;
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  const headers = allRows.length > 0 ? Object.keys(allRows[0]) : [];
  const noMatch = loaded && !message && applied > 0 && rows.length === 0;

  let status = message;
  if (!message && loaded) {
    if (applied === 0 && rows.length === 0) status = 'No filters applied. This report has no data yet.';
    else if (applied === 0) status = `No filters applied. Showing all ${rows.length} rows.`;
    else if (noMatch) status = `No matches for ${applied} filter(s). Remove a filter or click Reset.`;
    else status = `${applied} filter(s) applied. ${rows.length} of ${allRows.length} rows match.`;
  }
  if (!message && !loaded) status = 'Loading...';

  return (
    <section className='border-b border-r'>
      <TitleHeader report={report}/>

      <div className='flex flex-wrap gap-4 p-4'>
        {(FILTERS[report] || []).map((filter) => {
          const counts = filter.column ? getCounts(filter.column) : {};

          return (
            <div key={filter.name} className='flex flex-col'>
              <label>
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  className='border'
                  value={filters[filter.name] ?? ''}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                >
                  <option value=''>All</option>
                  {Object.keys(counts).sort().map((value) => (
                    <option key={value} value={value}>{value} ({counts[value]})</option>
                  ))}
                </select>
              ) : (
                <input
                  className='border'
                  type={filter.type}
                  min={filter.type === 'number' ? '0' : undefined}
                  list={filter.type === 'text' ? `${filter.name}-list` : undefined}
                  placeholder={filter.placeholder}
                  value={filters[filter.name] ?? ''}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadData(filters); }}
                />
              )}
              {filter.type === 'text' && (
                <datalist id={`${filter.name}-list`}>
                  {Object.keys(counts).sort().map((value) => <option key={value} value={value} />)}
                </datalist>
              )}
            </div>
          )
        })}

        <button className='button-highlight p-1 border-2 self-end'
          onClick={() => loadData(filters)}
        >
          Apply
        </button>
        <button className='button-highlight p-1 border-2 self-end'
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      {status &&
        <p className={noMatch ? 'p-4 text-red-600' : 'p-4'}>
          {status}
        </p>
      }

      <div className='grid'
        style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
        {headers.map((h) => (
          <h2 className='border-b' key={h}> {h} </h2>
        ))}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {rows.map((row, i) => (
          <div key={i} className='grid border-b'
            style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
            {headers.map((h) => (
              <p key={h}>{String(row[h] ?? '')}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default ReportsPage