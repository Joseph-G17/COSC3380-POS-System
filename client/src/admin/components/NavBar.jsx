import React from 'react'

const NavBar = () => {
  return (
      <nav className='border-t border-r border-b'>
        <div className=' inline-flex  space-x-2 p-7'>
          <search>
            <form action='search' >
              <label htmlFor="" className='text-sm'>Search</label>
              <input className='border ml-1' type="search"/>
            </form>
          </search>
          <div className=''>
            <button>
              POS
            </button>
          </div>
          <div className=''>
            <button>
              BUTTON 2
            </button>
          </div>
          <div className=''>
            <button>
              BUTTON 3
            </button>
          </div>
        </div>
      </nav>
  )
}
  
export default NavBar
