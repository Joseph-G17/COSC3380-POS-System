import { Outlet } from 'react-router-dom'
import NavBar from '../components/admin/NavBar'
import SideBar from '../components/admin/SideBar'

const AdminMainLayout = () => {
  return (
    <div className='grid min-h-dvh grid-cols-[15rem_1fr] grid-rows-[auto_1fr]'>
      <SideBar />
      <NavBar />
      <Outlet />
    </div>
  )
}

export default AdminMainLayout
