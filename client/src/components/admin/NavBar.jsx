import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"

function logoutPopUp() {
    const confirmLogout = window.confirm('Would you like to log out?');
    
    if(!confirmLogout)
      return;
      
    sessionStorage.removeItem("saveso-employee");
    sessionStorage.removeItem("saveso-timestamp")

    window.location.reload();
  }


//shared by the admin pages and the cashier POS (CashNavBar just renders this)
const NavBar = ({ employee }) => {

  const navigate = useNavigate();
  //on the POS the buttons point at the cashier pages; managers/admins (role 1/2) get a way back to admin
  const inPOS = useLocation().pathname.startsWith('/cashier');
  const canOpenAdmin = employee && (Number(employee.role) === 1 || Number(employee.role) === 2);
  const clockInPath = inPOS ? '/cashier/clock-in' : '/admin/clock-in';
  //when not set employee == null automatically
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  //cleared stock alerts come back on refresh/logout, cleared shipments stay gone
  const [dismissed, setDismissed] = useState(() => JSON.parse(localStorage.getItem('saveso-cleared-shipments')) || []);

  const loadNotifications = async () => {
    try{
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setNotifications(data);
    } catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); //checks for new ones every 30 seconds

    return () => clearInterval(interval);
  }, []);

  //hides it from the list and the count
  const dismissNotification = (key) => {
    setDismissed([...dismissed, key]);

    //a shipment only arrives once so once you've seen it it's done
    if (key.startsWith('shipment')) {
      const cleared = JSON.parse(localStorage.getItem('saveso-cleared-shipments')) || [];
      localStorage.setItem('saveso-cleared-shipments', JSON.stringify([...cleared, key]));
    }
  }

  const visible = notifications.filter((n) => !dismissed.includes(n.key));

  return (
      <nav className='flex border-t border-r border-b'>
        <div className='flex flex-1 space-x-2 p-7'>
          <search>
            <form action='search' >
              <label htmlFor="" className='text-sm'>Search</label>
              <input className='input-bar border ml-1' type="search"/>
            </form>
          </search>
          <section className='flex space-x-4 ml-auto'>
            <div className="relative">
              <button className="p-1 border rounded button-highlight" onClick={() => setShowNotifications(!showNotifications)}>
                <img width="24" height="24" src="https://img.icons8.com/material-rounded/24/alarm.png" alt="alarm"/>
                <p className="absolute text-red-400">{visible.length}</p>
              </button>
              {showNotifications && (
                <div className="absolute right-0 z-50 mt-6 w-80 max-h-96 overflow-y-auto border bg-white">
                  {visible.length === 0 && <p className="p-3 text-sm text-gray-500">No new notifications</p>}
                  {visible.map((n) => (
                    <div key={n.key} className="flex items-start border-b p-3">
                      <p className="flex-1 text-wrap">
                        {n.Message}
                        {n.Date && <small className="block text-gray-500">{new Date(n.Date).toLocaleString()}</small>}
                      </p>
                      <button className="button-highlight px-2" onClick={() => dismissNotification(n.key)}>x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!inPOS && (
              <button className='button-highlight p-1 border' onClick={()=> navigate('/cashier')} >
                POS
              </button>
            )}
            {inPOS && canOpenAdmin && (
              <button className='button-highlight p-1 border' onClick={()=> navigate('/admin')} >
                DASHBOARD
              </button>
            )}
            <button className='button-highlight p-1 border' onClick={()=> navigate(clockInPath)}>
              CLOCK-IN
            </button>
            <button className='button-highlight p-1 border' onClick={logoutPopUp}> 
              LOG OUT
            </button>
          </section>
        </div>
      </nav>
  )
}
  
export default NavBar
