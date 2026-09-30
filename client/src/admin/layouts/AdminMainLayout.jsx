import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'

const AdminMainLayout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}

export default AdminMainLayout
