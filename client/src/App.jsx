import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate  } from 'react-router-dom'

import LoginLayout from './layouts/LoginLayout'

import AdminMainLayout from './layouts/AdminMainLayout';
import HomePage from './pages/admin/HomePage';
import ReportsPage from './pages/admin/ReportsPage';
import ClockInPage from './pages/admin/ClockInPage';
import EditProfilePage from './pages/admin/EditProfilePage';
import InspectDataPage from './pages/admin/InspectDataPage';

import OnlineStoreLayout from './layouts/OnlineStoreLayout';

import CashierMainLayout from './layouts/CashierMainLayout';
import CashierCheckout from './pages/cashier/cashiercheckout';
import CashierItems from './pages/cashier/cashieritems';
import CashierOrders from './pages/cashier/cashierorders';
import CashierViewDiscounts from './pages/cashier/cashierviewdiscounts';
import CashierViewSales from './pages/cashier/cashierviewsales';

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
          <Route index element={<Navigate to="manage/Employee" replace />} />
          <Route path='inspectData/:entity/:id' element={<InspectDataPage />}/>
          <Route path='manage/:entity' element={<HomePage /> } />
          <Route path='reports/:report' element={<ReportsPage />}/>
          <Route path='clock-in/:user' element={<ClockInPage />}/>
          <Route path='profile/:user' element={<EditProfilePage />}/>
        </Route>
        
        <Route path='/cashier' element={<CashierMainLayout />}>
          <Route index element={<CashierCheckout />} />
          <Route path='checkout' element={<CashierCheckout />} />
          <Route path='items' element={<CashierItems />} />
          <Route path='orders' element={<CashierOrders />} />
          <Route path='discounts' element={<CashierViewDiscounts />} />
          <Route path='sales' element={<CashierViewSales />} />
        </Route>
      </>
    )
  );
  
  return <RouterProvider router={router}/>
}

export default App
