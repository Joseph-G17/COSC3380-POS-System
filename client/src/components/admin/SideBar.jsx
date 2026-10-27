import { NavLink, useNavigate } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();

  const entities = ['Employees', 'Orders', 'Items', 'Item Categories', 'Discounts', 'Sales', 'Departments', 'Returns', 'Inventory', 'Customers'];
  const reports = ['SalesSummary', 'EmployeeSales','StockReport', 'ItemPerformance'];

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
            Manage {entity}
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
            Manage {report}
          </NavLink>
        )}  
      </div>
    </aside>
  )
}

export default SideBar