import { useState, useEffect } from 'react'
import { Outlet, useOutletContext, useNavigate, replace } from 'react-router-dom'
import NavBar from '../components/admin/NavBar'
import SideBar from '../components/admin/SideBar'

const checkSessionEmployee = () => {
  try{
    const user = JSON.parse(sessionStorage.getItem('saveso-employee'));

    if(user && user.id && typeof user.firstName == 'string'){
      return { id: user.id, firstName: user.firstName }
    }
  } catch(error){
    console.log(error);
  }
  return null;
}

const AdminMainLayout = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(checkSessionEmployee);
  const employeeExists = !!employee;

  useEffect(() =>{
    if(!employeeExists)
      navigate('/login', {replace: true});

  }, [])

  return (
    <div className='grid min-h-dvh grid-cols-[15rem_1fr] grid-rows-[auto_1fr]'>
      <SideBar />
      <NavBar employee={employee} />
      <Outlet />
    </div>
  )
}

export default AdminMainLayout
