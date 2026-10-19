import { useSearchParams, useNavigate } from "react-router-dom";

const SideBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const entities = ['Employee', 'Orders', 'Items', 'Discounts', 'Sales', 'Department', 'Returns'];
  const forms = ['Sales Form', 'Stock/Inventory Form', 'Employee Form'];
  const currentEntity = searchParams.get('entity') ?? 'Employee'

  return (
    <aside className='row-span-2 border'>
      <div className='p-7 mb-1 inline-flex items-center'>
        <img className='w-15 h-15' src='/SaveSolLogo.png'/>
        <h1 className='text-nowrap text-2xl pl-1 pt-2'>SaveSo</h1>
      </div>
      <h2 className='place-self-center text-xl underline'>Manage</h2>
      <div className='grid gap-y-0.5'>
        {entities.map((entity) => 
          <button className='p-3 button-highlight focus:bg-amber-100' 
            key={entity}
            onClick={() => {
              setSearchParams({ entity });

              if(window.location.pathname != '/admin')
                navigate(`/admin?entity=${entity}`)
            }}
          >
            Manage {entity}
          </button>
        )}  
      </div>
      <h2 className="place-self-center text-xl underline">Data Reports</h2>
      <div className='grid gap-y-0.5'>
        {forms.map((form) => 
          <button className='p-3 button-highlight focus:bg-amber-100' 
            key={form}
            onClick={() => {
              setSearchParams({ form });
              if(window.location.pathname != '/admin')
                navigate(`/admin?form=${form}`)
            }}
          >
            Manage {form}
          </button>
        )}  
      </div>
    </aside>

  )
}

export default SideBar