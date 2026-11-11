import TitleHeader from "../../components/admin/TitleHeader"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react";

const FILTERS = {
  //one row per day; the order type / payment split is in the columns now
  SalesSummary: [
    { name: 'from', label: 'From date', type: 'date' },
    { name: 'to', label: 'To date', type: 'date' },
    { name: 'minSales', label: 'Min Gross Sales ($)', type: 'number', placeholder: 'e.g. 10' },
    { name: 'minNet', label: 'Min Net Sales ($)', type: 'number', placeholder: 'e.g. 10' },
    { name: 'minReturns', label: 'Min Returns ($)', type: 'number', placeholder: 'e.g. 1' }
  ],
  ItemPerformance: [
    { name: 'itemName', label: 'Item', type: 'text', column: 'ItemName', placeholder: 'e.g. Milk' },
    { name: 'category', label: 'Category', type: 'select', column: 'Category' },
    { name: 'minSold', label: 'Units Sold At Least', type: 'number', placeholder: 'e.g. 5' },
    { name: 'maxSold', label: 'Units Sold At Most', type: 'number', placeholder: 'e.g. 2' },
    { name: 'minReturned', label: 'Units Returned At Least', type: 'number', placeholder: 'e.g. 1' }
  ],
  CustomerReport: [
    { name: 'customer', label: 'Customer', type: 'text', column: 'CustomerName', placeholder: 'e.g. Maya' },
    { name: 'membership', label: 'Membership', type: 'select', column: 'Membership' },
    { name: 'minSpent', label: 'Min Total Spent ($)', type: 'number', placeholder: 'e.g. 50' },
    { name: 'from', label: 'Last order from', type: 'date' },
    { name: 'to', label: 'Last order to', type: 'date' },
    { name: 'minCanceled', label: 'Canceled Orders At Least', type: 'number', placeholder: 'e.g. 1' }
  ],
};

//columns that should show as $12.50
const MONEY_COLUMNS = ['TotalSales', 'AvgOrder', 'Revenue', 'ItemPrice', 'TotalReturned', 'TotalSpent', 'SalesPerHour',
  'ReturnTotal', 'NetSales', 'InStoreSales', 'PickupSales', 'DeliverySales', 'CardSales', 'CashSales', 'GiftcardSales', 'NetSpent'];

//columns that should show as 12.5%
const PERCENT_COLUMNS = ['ReturnRatePct'];

const showPercent = (value) => `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;

//"TotalSales" -> "Total Sales"
const niceHeader = (header) => header.replace(/([a-z])([A-Z])/g, '$1 $2');

const showMoney = (value) => '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const showValue = (header, value) => {
  if (PERCENT_COLUMNS.includes(header)) return value === null || value === undefined ? '—' : showPercent(value); //no sales = no rate
  if (value === null || value === undefined) return '';
  if (MONEY_COLUMNS.includes(header)) return showMoney(value);
  if (header.includes('Date')) return String(value).slice(0, 10); //2026-10-01T05:00:00.000Z -> 2026-10-01
  return String(value);
}

const ReportsPage = () => {
  
  const {report} =  useParams();
  const [rows, setRows] = useState([]); //rows that match filters
  const [allRows, setAllRows] = useState([]); //thw whole report
  const [filters, setFilters] = useState({});
   const [applied, setApplied] = useState(0);  //how many filters the last apply used
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState([]);
  const [shown, setShown] = useState(false); //results stay hidden until Apply is clicked

  //show = false loads the report quietly (for the filter dropdowns) without displaying it
  const loadData = async (currentFilters, show = true) => {
    try{
      if (currentFilters.from && currentFilters.to && currentFilters.from > currentFilters.to) {
        setRows([]);
        setSummary([]);
        setMessage('"From" must be before "To".');
        setShown(show);
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

      setRows(data.rows);
      if (count === 0) setAllRows(data.rows); //no filters = the whole report
      setTitle(data.title);
      setDescription(data.description);
      setSummary(data.summary);
      setApplied(count);
      setMessage('');
      setLoaded(true);
      setShown(show);
    } catch(error){
      console.log(error);
      setRows([]);
      setSummary([]);
      setMessage(error.message);
      setShown(true); //always show load errors
    }
  }
    
  useEffect(() => {
    setFilters({});
    setRows([]);
    setAllRows([]);
    setSummary([]);
    setTitle('');
    setDescription('');
    setApplied(0);
    setLoaded(false);
    setShown(false);
    loadData({}, false);
  }, [report]);

  const handleChange = (name, value) => {
    setFilters({...filters, [name]: value});
  }

  //clear the filters and hide the results until Apply is clicked again
  const handleReset = () => {
    setFilters({});
    setMessage('');
    setShown(false);
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
  if (!shown) status = loaded ? 'Set your filters and click Apply to run the report.' : 'Loading...';

  return (
    <section className='report-page border-b border-r'>
      <TitleHeader report={title || niceHeader(report)}/>
      <p className='px-10 -mt-6'>{description}</p>
      {shown && <p className='px-10 text-sm text-gray-500'>Generated {new Date().toLocaleString()}</p>}

      {/*filters come first; nothing below them shows until Apply*/}
      <div className='no-print flex flex-wrap gap-4 p-4'>
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
        <button className='button-highlight p-1 border-2 self-end disabled:opacity-50'
          disabled={!shown}
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>

      {status &&
        <p className={noMatch || (shown && message) ? 'p-4 text-red-600' : 'p-4'}>
          {status}
        </p>
      }

      {shown && (
        <>
          {/*summary boxes, they change with the filters*/}
          {summary.length > 0 && (
            <div className='flex flex-wrap gap-4 px-4 pb-4'>
              {summary.map((s) => (
                <div key={s.label} className='border-2 p-4 min-w-40'>
                  <p className='text-sm text-gray-500'>{s.label}</p>
                  <p className='text-2xl'>{s.money ? showMoney(s.value) : s.percent ? showPercent(s.value) : s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          <div className='grid'
            style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
            {headers.map((h) => (
              <h2 className='border-b font-bold px-3 py-2' key={h}> {niceHeader(h)} </h2>
            ))}
          </div>

          <div className='flex-1 overflow-y-auto'>
            {rows.map((row, i) => (
              <div key={i} className='grid border-b'
                style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
                {headers.map((h) => (
                  <p key={h} className='px-3 py-2.5'>{showValue(h, row[h])}</p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default ReportsPage