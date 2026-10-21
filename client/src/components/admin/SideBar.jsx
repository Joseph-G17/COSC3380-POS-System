import { NavLink, useNavigate } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();

  const entities = ['Employees', 'Orders', 'Items', 'Discounts', 'Sales', 'Department', 'Returns'];
  const forms = ['Sales Form', 'Inventory Form', 'Employee Form'];

  const dbName = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');



  return (
    <aside className='row-span-2 border'>
      <div className='p-7 mb-1 inline-flex items-center'>
        <img className='w-15 h-15' src='/SaveSolLogo.png'/>
        <h1 className='text-nowrap text-2xl pl-1 pt-2'>SaveSo</h1>
      </div>
      <h2 className='place-self-center text-xl underline'>Manage</h2>
      <div className='grid gap-y-0.5'>
        {entities.map((entity) => 
          <NavLink className='p-4 button-highligh focus:bg-amber-100'
            key={entity}
            to={`/admin/manage/${entity}`}
          >
            Manage {entity}
          </NavLink>
        )}  
      </div>
      <h2 className="place-self-center text-xl underline">Data Reports</h2>
      <div className='grid gap-y-0.5'>
        {forms.map((form) => 
          <NavLink className='p-4 button-highlight focus:bg-amber-100'
            key={form}
            to={`/admin/forms/${form}`}
          >
            Manage {form}
          </NavLink>
        )}  
      </div>
    </aside>
  )
}

export default SideBar