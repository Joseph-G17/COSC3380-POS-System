import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'

import AdminMainLayout from './layouts/AdminMainLayout';
import HomePage from './pages/HomePage';

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/admin' element={<AdminMainLayout /> }>
        <Route index element={<HomePage /> } />
      </Route>
    )
  );
  
  return <RouterProvider router={router}/>
}

export default App