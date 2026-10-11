import { useSearchParams } from "react-router-dom";

const SideBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const entities = ['Employee', 'Orders', 'Items', 'Discounts', 'Sales', 'Department', 'Returns'];
  const currentEntity = searchParams.get('entity') ?? 'Employee'

  return (
    <aside className='row-span-2 border'>
      <div className='p-7 mb-1'>
        <h1 className='text-nowrap '>GROCERY STORE NAME</h1>
      </div>
      <div className='grid gap-y-0.5'>
        {entities.map((entity) => 
          <button className='p-4 duration-50 ease-in hover:bg-amber-100 focus:bg-amber-100' 
            key={entity}
            onClick={() => setSearchParams({ entity })}
          >
            Manage {entity}
          </button>
        )}  
      </div>
    </aside>

  )
}

export default SideBar