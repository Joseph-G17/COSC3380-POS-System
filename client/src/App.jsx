import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'

import LoginLayout from './layouts/LoginLayout'

import AdminMainLayout from './layouts/AdminMainLayout';
import HomePage from './pages/admin/HomePage';
import ClockInPage from './pages/admin/ClockInPage';
import EditProfilePage from './pages/admin/EditProfilePage';
import InspectDataPage from './pages/admin/InspectDataPage';
import UpdateDataPage from './pages/admin/UpdateDataPage';

import OnlineStoreLayout from './layouts/OnlineStoreLayout';

const App = () => {
  const router = createBrowserRouter(
    // Group storefront and admin routes in one router using a JSX fragment.
    createRoutesFromElements(
      <>
        {/* Render the customer storefront at the site's root URL. */}
        <Route path='/' element={<OnlineStoreLayout />} />

        {/* Login for Employee's and Customer's */}
        <Route path='/login' element={<LoginLayout />} />

        {/* Preserve the existing admin layout and its default page. */}
        <Route path='/admin' element={<AdminMainLayout /> }>
          <Route index element={<HomePage /> } />
          <Route path='/admin/clock-in' element={<ClockInPage />}/>
          <Route path='/admin/profile' element={<EditProfilePage />}/>
          <Route path='/admin/inspectData' element={<InspectDataPage />}/>
          <Route path='/admin/updateData' element={<UpdateDataPage />}/>
        </Route>
      </>
    )
  );
  
  return <RouterProvider router={router}/>
}

export default App