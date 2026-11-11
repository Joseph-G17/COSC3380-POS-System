import { NavLink, useNavigate } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();

  const entities = ['Employees', 'Departments', 'Orders', 'Items', 'Item Categories', 'Discounts', 'Sales', 'Sale Items', 'Seasons', 'Seasonal Deals', 'Returns', 'Inventory', 'Shipments', 'Customers'];
  const reports = ['SalesSummary', 'ItemPerformance', 'CustomerReport'];
  //what the user sees instead of the view name
  const reportNames = { SalesSummary: 'Revenue', ItemPerformance: 'Item Sales', CustomerReport: 'Customer' };

  return (
    <aside className='row-span-2 border h-screen overflow-y-auto'>
      <div className='p-7 mb-1 inline-flex items-center'>
        <img className='w-15 h-15' src='/SaveSolLogo.png'/>
        <h1 className='text-nowrap text-2xl pl-1 pt-2'>SaveSo</h1>
      </div>
      <h2 className='place-self-center text-xl underline'>Manage</h2>
      <div className='grid gap-y-0.5'>
        {entities.map((entity) => 
          <NavLink className='p-4 button-highlight focus:bg-amber-100'
            key={entity}
            to={`/admin/manage/${entity}`}
          >
            {entity === 'Returns' ? 'View' : 'Manage'} {entity}
          </NavLink>
        )}  
      </div>
      <h2 className="place-self-center text-xl underline">Data Reports</h2>
      <div className='grid gap-y-0.5'>
        {reports.map((report) => 
          <NavLink className='p-4 button-highlight focus:bg-amber-100'
            key={report}
            to={`/admin/reports/${report}`}
          >
            {reportNames[report]} Report
          </NavLink>
        )}  
      </div>
    </aside>
  )
}

export default SideBar