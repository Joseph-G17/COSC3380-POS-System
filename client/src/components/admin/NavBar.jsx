import { useState } from "react";
import { useNavigate } from "react-router-dom"

function logoutPopUp() {
    const confirmLogout = window.confirm('Would you like to log out?');
    
    if(!confirmLogout)
      return;
      
    sessionStorage.removeItem("saveso-employee");
    sessionStorage.removeItem("saveso-timestamp")

    window.location.reload();
  }


const NavBar = ({ employee }) => {
  
  const navigate = useNavigate();
  //when not set employee == null automatically

  return (
      <nav className='flex border-t border-r border-b'>
        <div className='flex flex-1 space-x-2 p-7'>
          <search>
            <form action='search' >
              <label htmlFor="" className='text-sm'>Search</label>
              <input className='input-bar border ml-1' type="search"/>
            </form>
          </search>
          <section className='flex space-x-4 ml-auto'>
            <button className='button-highlight p-1 border' onClick={()=> navigate('/cashier')} > 
              POS
            </button>
            <button className='button-highlight p-1 border' onClick={()=> navigate('/admin/clock-in')}>
              CLOCK-IN
            </button>
            <button className='button-highlight p-1 border' onClick={logoutPopUp}> 
              Welcome, {employee && employee.firstName}
            </button>
          </section>
        </div>
      </nav>
  )
}
  
export default NavBar
