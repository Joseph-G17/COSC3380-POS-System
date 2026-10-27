import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'

import AdminMainLayout from './layouts/AdminMainLayout';
import LoginLayout from './layouts/LoginLayout';
import HomePage from './pages/admin/HomePage';
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
        <Route path='/login' element={<LoginLayout />} />
        <Route path='/admin' element={<AdminMainLayout />}>
          <Route index element={<HomePage />} />
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
