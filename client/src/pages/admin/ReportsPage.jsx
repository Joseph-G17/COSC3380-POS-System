import TitleHeader from "../../components/admin/TitleHeader"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react";

const FILTERS = {
  SalesSummary: [
    { name: 'from', label: 'From', type: 'date' },
    { name: 'to', label: 'To', type: 'date' },
    { name: 'orderType', label: 'Order Type', type: 'select', options: ['In-Store', 'Pickup', 'Delivery'] }
  ],
  StockReport: [
    { name: 'itemName', label: 'Item', type: 'text' },
    { name: 'supplier', label: 'Supplier', type: 'text' },
    { name: 'maxStock', label: 'Max Stock', type: 'number' }
  ],
  EmployeeSales: [
    { name: 'employee', label: 'Employee', type: 'text' },
    { name: 'from', label: 'From', type: 'month' },
    { name: 'to', label: 'To', type: 'month' }
  ],
  CustomerPurchases: [
    { name: 'customer', label: 'Customer', type: 'text' },
    { name: 'channel', label: 'Channel', type: 'select', options: ['In-Store', 'Online'] },
    { name: 'from', label: 'From', type: 'date' },
    { name: 'to', label: 'To', type: 'date' }
  ]
};

const ReportsPage = () => {
  const {report} =  useParams();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [message, setMessage] = useState('');

   const loadData = async (currentFilters) => {
      //blank filters are left out of the url
      const params = new URLSearchParams();
      for (const name in currentFilters) {
        if (currentFilters[name] !== '') params.append(name, currentFilters[name]);
      }

      const response = await fetch(`/api/reports/${report}?${params}`);  //params = ?from=2026-10-01&orderType=Pickup` if 'from' and 'orderType aren't empty'  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
    }
    
  
   useEffect(() => {
    setFilters({});
    loadData({});
  }, [report]);

  const handleChange = (name, value) => {
    setFilters({...filters, [name]: value});
  }

  const handleReset = () => {
    setFilters({});
    loadData({});
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <section className='border-b border-r'>
      <TitleHeader report={report}/>

      <div className='flex p-4'>
        {(FILTERS[report] || []).map((filter) => (
          <div key={filter.name} className='flex flex-col pr-4'>
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
                {filter.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className='border'
                type={filter.type}
                value={filters[filter.name] ?? ''}
                onChange={(e) => handleChange(filter.name, e.target.value)}
              />
            )}
          </div>
        ))}

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

      {message && 
        <p className='p-4'>
          {message}
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