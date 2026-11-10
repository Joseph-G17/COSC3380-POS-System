import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import CashNavBar from '../components/cashier/CashNavBar'
import CashSideBar from '../components/cashier/CashSideBar'

//Read the employee that the login page saved for this tab
function readEmployee(){
  try{
    return JSON.parse(sessionStorage.getItem('saveso-employee'));
  }catch{
    return null;
  }
}

const CashierMainLayout = () => {
  const navigate = useNavigate();
  const employee = readEmployee();
  //Cashiers (role 0) use the register, and managers or admins can open it from the POS button
  const role = employee ? Number(employee.role) : NaN;
  const allowed = role === 0 || role === 1 || role === 2;

  useEffect(() => {
    if(!allowed){
      navigate('/login', { replace: true });
    }
  }, [allowed, navigate]);

  //Show nothing while the page sends someone without access back to the login page
  if(!allowed){
    return null;
  }

  return (
    <div>
      <div className='grid min-h-dvh grid-cols-[15rem_1fr] grid-rows-[auto_1fr]'>
      <CashSideBar />
      <CashNavBar />
      <Outlet />
    </div>
    </div>
  )
}

export default CashierMainLayout
