import { useState, useEffect } from 'react'
import { Outlet, useOutletContext, useNavigate, replace } from 'react-router-dom'
import NavBar from '../components/admin/NavBar'
import SideBar from '../components/admin/SideBar'

const checkSessionEmployee = () => {
  try{
    const user = JSON.parse(sessionStorage.getItem('saveso-employee'));

    if(user && user.id && typeof user.firstName == 'string'){
      return { id: user.id, firstName: user.firstName, clockedIn: user.clockedIn, department: user.department}
    }
  } catch(error){
    console.log(error);
  }
  return null;
}
//NEXT STEP IS TO ADD CHECKING ROLE TO THIS TO MAKE SURE THEY CAN'T USE ANOTHER DOMAIN (ADMIN IN CASHIER, CASHIER IN LOGIN, ETC.)
const AdminMainLayout = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(checkSessionEmployee());
  const employeeExists = !!employee;

  useEffect(() =>{
    if(!employeeExists)
      navigate('/login', {replace: true});
    


  }, [employeeExists, navigate]) //check if employee exists on navigate or if employee happens to not exist

  return (
    <div className='grid min-h-dvh grid-cols-[15rem_1fr] grid-rows-[auto_1fr]'>
      <SideBar />
      <NavBar employee={employee} />
      <Outlet context={{employee, setEmployee}} />
    </div>
  )
}

export default AdminMainLayout
