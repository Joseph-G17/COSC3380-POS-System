import React from 'react'

const SideBar = () => {
  return (
    <aside className='row-span-2 border'>
      <div className='p-7 mb-1'>
        <h1 className='text-nowrap '>GROCERY STORE NAME</h1>
      </div>
      <div className='grid gap-y-0.5'>
          <button className='p-4 duration-50 ease-in hover:bg-amber-100 focus:bg-amber-100'>
            Manage Employees
          </button>
          <button className='p-4 duration-75 ease-in  hover:bg-amber-100  focus:bg-amber-100'>
            Manage Items
          </button>
          <button className='p-4 duration-75 ease-in  hover:bg-amber-100  focus:bg-amber-100'>
            Manage Inventory
          </button>
          <button className='p-4 duration-75 ease-in  hover:bg-amber-100  focus:bg-amber-100'>
            Manage Shipments
          </button>
      </div>
    </aside>

  )
}

export default SideBar