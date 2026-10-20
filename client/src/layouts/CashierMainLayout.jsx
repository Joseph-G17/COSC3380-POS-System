import React from 'react'
import { Outlet } from 'react-router-dom'
import CashNavBar from '../components/cashier/CashNavBar'
import CashSideBar from '../components/cashier/CashSideBar'

const CashierMainLayout = () => {
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
