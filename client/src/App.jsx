import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate  } from 'react-router-dom'

import LoginLayout from './layouts/LoginLayout'

import AdminMainLayout from './layouts/AdminMainLayout';
import HomePage from './pages/admin/HomePage';
import FormsPage from './pages/admin/FormsPage';
import ClockInPage from './pages/admin/ClockInPage';
import EditProfilePage from './pages/admin/EditProfilePage';
import InspectDataPage from './pages/admin/InspectDataPage';
import UpdateDataPage from './pages/admin/UpdateDataPage';

// The shared layout keeps one cart while these two customer pages change.
import OnlineStoreLayout from './layouts/OnlineStoreLayout'; // Holds the shared customer cart and navigation.
import OnlineStorePage from './pages/onlinestore/OnlineStorePage'; // Shows product search and category filters.
import CheckoutPage from './pages/onlinestore/CheckoutPage'; // Reads that same cart to show the order summary.

import CashierMainLayout from './layouts/CashierMainLayout';
import CashierCheckout from './pages/cashier/cashiercheckout';
import CashierItems from './pages/cashier/cashieritems';
import CashierOrders from './pages/cashier/cashierorders';
import CashierViewDiscounts from './pages/cashier/cashierviewdiscounts';
import CashierViewSales from './pages/cashier/cashierviewsales';

const App = () => {
  const router = createBrowserRouter(
    // The router chooses a page by URL; <> groups the routes without adding an HTML element.
    createRoutesFromElements(
      <>
        {/* Layout stays mounted; only its child page changes, so cart state is preserved. */}
        <Route path='/' element={<OnlineStoreLayout />}>
          {/* index selects the shop when the full URL path is /. */}
          <Route index element={<OnlineStorePage />} />
          {/* This child opens /checkout inside Layout; F5 restores its cart from this tab's saved data. */}
          <Route path='checkout' element={<CheckoutPage />} />
        </Route>

        {/* /login currently calls the employee login API; customer login is still unfinished. */}
        <Route path='/login' element={<LoginLayout />} />

        {/* Preserve the existing admin layout and its default page. */}
        <Route path='/admin' element={<AdminMainLayout /> }>
          <Route index element={<Navigate to="manage/Employee" replace />} />
          <Route path='manage/:entity' element={<HomePage /> } />
          <Route path='forms/:form' element={<FormsPage />}/>
          <Route path='clock-in' element={<ClockInPage />}/>
          <Route path='profile' element={<EditProfilePage />}/>
          <Route path='inspectData' element={<InspectDataPage />}/>
          <Route path='updateData' element={<UpdateDataPage />}/>
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
