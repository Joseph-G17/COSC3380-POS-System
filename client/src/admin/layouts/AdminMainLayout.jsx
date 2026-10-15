import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'

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
