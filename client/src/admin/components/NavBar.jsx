import React from 'react'

const NavBar = () => {
  return (
      <nav className='flex border-t border-r border-b'>
        <div className='flex flex-1 space-x-2 p-7'>
          <search>
            <form action='search' >
              <label htmlFor="" className='text-sm'>Search</label>
              <input className='border ml-1' type="search"/>
            </form>
          </search>
          <section className='flex space-x-4 ml-auto'>
            <button>
              POS
            </button>
            <button>
              BUTTON 1
            </button>
            <button>
              BUTTON 2
            </button>
          </section>
        </div>
      </nav>
  )
}
  
export default NavBar
