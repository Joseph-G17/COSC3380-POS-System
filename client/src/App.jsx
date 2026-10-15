import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'

import AdminMainLayout from './layouts/AdminMainLayout';
import HomePage from './pages/admin/HomePage';
import OnlineStoreLayout from './layouts/OnlineStoreLayout';

const App = () => {
  const router = createBrowserRouter(
    // Group storefront and admin routes in one router using a JSX fragment.
    createRoutesFromElements(
      <>
        {/* Render the customer storefront at the site's root URL. */}
        <Route path='/' element={<OnlineStoreLayout />} />

        {/* Preserve the existing admin layout and its default page. */}
        <Route path='/admin' element={<AdminMainLayout /> }>
          <Route index element={<HomePage /> } />
        </Route>
      </>
    )
  );
  
  return <RouterProvider router={router}/>
}

export default App