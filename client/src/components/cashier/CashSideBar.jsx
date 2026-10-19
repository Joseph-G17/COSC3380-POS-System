
import { Link, useSearchParams } from "react-router-dom";

const CashSideBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const entities = ['Orders', 'Items', 'Discounts', 'Sales', 'Returns'];
  const currentEntity = searchParams.get('entity') ?? 'Employee'

  return (
    <aside className='row-span-2 border'>
      <div className='p-7 mb-1'>
        <h1 className='text-nowrap '>SaveSo</h1>
      </div>
      <div className='grid gap-y-0.5'>
        {entities.map((entity) => (
          ['Items', 'Orders', 'Discounts', 'Sales'].includes(entity) ? (
            <Link
              className='p-4 duration-50 ease-in hover:bg-amber-100 focus:bg-amber-100'
              key={entity}
              to={`/cashier/${entity.toLowerCase()}`}
            >
               {entity}
            </Link>
          ) : (
            <button
              className='p-4 duration-50 ease-in hover:bg-amber-100 focus:bg-amber-100'
              key={entity}
              onClick={() => setSearchParams({ entity })}
            >
               {entity}
            </button>
          )
        ))}
      </div>
    </aside>

  )
}

export default CashSideBar