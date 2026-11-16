import TitleHeader from "../../components/admin/TitleHeader"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react";

const FILTERS = {
  //maps report keys to an array of UI input definitions used to dynamically render filter forms
  RevenueReport: [
    { name: 'from', label: 'From date', type: 'date' },
    { name: 'to', label: 'To date', type: 'date' },
    { name: 'minSales', label: 'Min Gross Sales ($)', type: 'number', placeholder: 'e.g. 10' },
    { name: 'minNet', label: 'Min Net Sales ($)', type: 'number', placeholder: 'e.g. 10' },
    { name: 'minReturns', label: 'Min Returns ($)', type: 'number', placeholder: 'e.g. 1' }
  ],
  ItemSalesReport: [
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

//columns that need to be formatted money wise
const MONEY_COLUMNS = ['TotalSales', 'AvgOrder', 'Revenue', 'ItemPrice', 'TotalReturned', 'TotalSpent', 'SalesPerHour',
  'ReturnTotal', 'NetSales', 'InStoreSales', 'PickupSales', 'DeliverySales', 'CardSales', 'CashSales', 'GiftcardSales', 'NetSpent',
  'OrderTotal', 'PricePaid', 'LineTotal'];

//columns that need to be formatted percent wise 
const PERCENT_COLUMNS = ['ReturnRatePct'];

//format for percentages
const showPercent = (value) => `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;

//"TotalSales" -> "Total Sales", runs across whole string, $1 $2 is formatted string
const niceHeader = (header) => header.replace(/([a-z])([A-Z])/g, '$1 $2');

//format for money
const showMoney = (value) => '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });


/* 
formats a raw cell value for display based on its column header.
applies specialized formatting for percentages, currency, and ISO dates, 
while converting nullish values to dashes or empty strings.
*/
const showValue = (header, value) => {
  if (PERCENT_COLUMNS.includes(header)) return value === null || value === undefined ? '—' : showPercent(value); //no sales = no rate
  if (value === null || value === undefined) return '';
  if (MONEY_COLUMNS.includes(header)) return showMoney(value);
  if (header.includes('Date')) return String(value).slice(0, 10); //2026-10-01T05:00:00.000Z -> 2026-10-01
  return String(value);
}

const ReportsPage = () => {
  
  const {report} =  useParams(); //report comes from the route
  const [rows, setRows] = useState([]); //rows that match filters
  const [allRows, setAllRows] = useState([]); //the whole report
  const [filters, setFilters] = useState({}); //filters selected
   const [applied, setApplied] = useState(0);  //how many filters the last apply used
  const [message, setMessage] = useState(''); //error or validation message, empty if none
  const [loaded, setLoaded] = useState(false); //true once the first fetch finishes
  const [title, setTitle] = useState(''); //report name sent by the server
  const [description, setDescription] = useState(''); //short description under the title
  const [summary, setSummary] = useState([]); //totals shown in the summary boxes
  const [shown, setShown] = useState(false); //results stay hidden until Apply is clicked
  const [sources, setSources] = useState([]); //the records the report rows were added up from
  const [showSources, setShowSources] = useState(false); //source data is closed until clicked

  //call anytime our report changes, when user clicks Apply, and/or clicks enter
  const loadData = async (currentFilters, show = true) => {
    try{
      if (currentFilters.from && currentFilters.to && currentFilters.from > currentFilters.to) {
        setRows([]);
        setSummary([]);
        setSources([]);
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
      if (count === 0) setAllRows(data.rows);
      setTitle(data.title);
      setDescription(data.description);
      setSummary(data.summary);
      setSources(data.sources || []);
      setApplied(count);
      setMessage('');
      setLoaded(true);
      setShown(show);
    } catch(error){
      console.log(error);
      setRows([]);
      setSummary([]);
      setSources([]);
      setMessage(error.message);
      setShown(true); //always show load errors
    }
  }
    
  useEffect(() => {
    setFilters({});
    setRows([]);
    setAllRows([]);
    setSummary([]);
    setSources([]);
    setShowSources(false);
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

  //how many times each value shows up in a column, e.g. { Dairy: 2, Bakery: 1 }
  //used for the dropdown options and the autocomplete suggestions in the filters
  const getCounts = (column) => {
    const counts = {};
    allRows.forEach((row) => {
      const value = row[column];
      if (value === null || value === undefined || value === '') return;
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  //column names come from the first row's keys
  const headers = allRows.length > 0 ? Object.keys(allRows[0]) : [];
  const noMatch = loaded && !message && applied > 0 && rows.length === 0;

  //filter messages
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
      {/* Title & Description*/}
      <TitleHeader report={title || niceHeader(report)}/>
      <p className='px-10 -mt-6'>{description}</p>
      {shown && <p className='px-10 text-sm text-gray-500'>Generated {new Date().toLocaleString()}</p>}

      {/* Filters */}
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
        
        {/* Filters: Buttons */}
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
      
      {/* Message */}
      {status &&
        <p className={noMatch || (shown && message) ? 'p-4 text-red-600' : 'p-4'}>
          {status}
        </p>
      }

      {/* AFTER APPLY */}
      {shown && (
        <>
          {/* Summary Boxes */}
          {summary.length > 0 && (
            <div className='flex flex-wrap gap-4 px-4 pb-4'>
              {summary.map((stat) => (
                <div key={stat.label} className='border-2 p-4 min-w-40'>
                  <p className='text-sm text-gray-500'>{stat.label}</p>
                  <p className='text-2xl'>{stat.money ? showMoney(stat.value) : stat.percent ? showPercent(stat.value) : stat.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Main Data Headers  */}
          <div className='grid'
            style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
            {headers.map((header) => (
              <h2 className='border-b font-bold px-3 py-2' key={header}> {niceHeader(header)} </h2>
            ))}
          </div>
          
          {/* Main Data */}
          <div className='flex-1 overflow-y-auto'>
            {rows.map((row, i) => (
              <div key={i} className='grid border-b'
                style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
                {headers.map((header) => (
                  <p key={header} className='px-3 py-2.5'>{showValue(header, row[header])}</p>
                ))}
              </div>
            ))}
          </div>

          {/*where the numbers come from: every order/return/line behind the rows above*/}
          {sources.length > 0 && rows.length > 0 && (
            <div className='px-4 py-6'>
              <button className='button-highlight p-1 border-2' onClick={() => setShowSources(!showSources)}>
                {showSources ? '▾ Hide source data' : '▸ Show source data'}
                {' '}({sources.reduce((total, source) => total + source.rows.length, 0)} records)
              </button>

              {showSources && sources.map((section) => {
                const sourceHeaders = section.rows.length > 0 ? Object.keys(section.rows[0]) : [];
                const grid = { gridTemplateColumns: `repeat(${sourceHeaders.length || 1}, minmax(0, 1fr))` };

                return (
                  <div key={section.title} className='pt-6'>
                    <h2 className='text-xl underline pb-2'>{section.title}</h2>
                    {section.rows.length === 0 ? (
                      <p className='text-gray-500'>None for the rows above.</p>
                    ) : (
                      <>
                        <div className='grid' style={grid}>
                          {sourceHeaders.map((header) => (
                            <h3 className='border-b font-bold px-3 py-2' key={header}>{niceHeader(header)}</h3>
                          ))}
                        </div>
                        {section.rows.map((row, i) => (
                          <div key={i} className='grid border-b' style={grid}>
                            {sourceHeaders.map((header) => (
                              <p key={header} className='px-3 py-2.5'>{showValue(header, row[header])}</p>
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                    <p className='pt-2 text-sm text-gray-500'>
                      {section.rows.length} record(s)
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ReportsPage