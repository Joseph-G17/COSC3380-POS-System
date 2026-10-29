import { useState } from "react";
import { useNavigate } from "react-router-dom"

const checkSessionEmployee = () => {
  const user = JSON.parse(sessionStorage.getItem('saveso-employee'));

  if(user && user.id && typeof user.firstName == 'string'){
    return { id: user.id, firstName: user.firstName }
  }
}

const NavBar = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(checkSessionEmployee)
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
            <button className='button-highlight p-1 border'>
              Welcome, {employee && employee.firstName}
            </button>
          </section>
        </div>
      </nav>
  )
}
  
export default NavBar
