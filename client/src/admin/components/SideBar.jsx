import React from 'react'

const SideBar = () => {
  return (
    <aside className='row-span-2 border'>
      <div className='p-7 border-b'>
        <h1 className='text-nowrap '>GROCERY STORE NAME</h1>
      </div>
      <div className='grid gap-8'>
          <button className='mt-5'>
            Manage Employees
          </button>
          <button className=''>
            Manage Items
          </button>
          <button className=''>
            Manage Inventory
          </button>
          <button className=''>
            Manage Shipments
          </button>
      </div>
    </aside>

  )
}

export default SideBar