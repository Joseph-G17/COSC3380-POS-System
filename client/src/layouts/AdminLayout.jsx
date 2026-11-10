import { useState, useEffect } from 'react'
import { Outlet, useOutletContext, useNavigate, replace } from 'react-router-dom'
import NavBar from '../components/admin/NavBar'
import SideBar from '../components/admin/SideBar'

const checkSessionEmployee = () => {
  try{
    const user = JSON.parse(sessionStorage.getItem('saveso-employee'));

    if(user && user.id && typeof user.firstName == 'string'){
      return { id: user.id, firstName: user.firstName, clockedIn: user.clockedIn, department: user.department, role: user.role}
    }
  } catch(error){
    console.log(error);
  }
  return null;
}
const AdminLayout = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(checkSessionEmployee());
  //Only managers (role 1) and admins (role 2) can open the admin pages
  const role = employee ? Number(employee.role) : NaN;
  const employeeExists = role === 1 || role === 2;

  useEffect(() =>{
    if(!employeeExists)
      navigate('/login', {replace: true});
    


  }, [employeeExists, navigate]) //check if employee exists on navigate or if employee happens to not exist

  //Show nothing while the page sends someone without access back to the login page
  if(!employeeExists){
    return null;
  }

  return (
    <div className='admin-layout grid h-dvh grid-cols-[15rem_1fr] grid-rows-[auto_minmax(0,1fr)]'>
      <SideBar />
      <NavBar employee={employee} />
      {/*only this part scrolls so the sidebar and nav bar stay put*/}
      <main className='admin-main grid overflow-y-auto'>
        <Outlet context={{employee, setEmployee}} />
      </main>
    </div>
  )
}

export default AdminLayout
