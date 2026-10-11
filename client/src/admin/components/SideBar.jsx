import React from 'react'

const SideBar = () => {
  const entities = ['Employee', 'Orders', 'Items', 'Discounts', 'Sales', 'Department', 'Returns']

  return (
    <aside className='row-span-2 border'>
      <div className='p-7 mb-1'>
        <h1 className='text-nowrap '>GROCERY STORE NAME</h1>
      </div>
      <div className='grid gap-y-0.5'>
        {entities.map((entity) => 
          <button className='p-4 duration-50 ease-in hover:bg-amber-100 focus:bg-amber-100' key={entity}>
            Manage {entity}
          </button>
        )}  
      </div>
    </aside>

  )
}

export default SideBar