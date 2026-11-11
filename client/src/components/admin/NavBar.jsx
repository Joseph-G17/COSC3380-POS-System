import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"
import { useConfirm } from "../ConfirmPopup";


//shared by the admin pages and the cashier POS (CashNavBar just renders this)
const NavBar = ({ employee }) => {

  const navigate = useNavigate();
  const [popup, ask] = useConfirm();

  const logoutPopUp = async () => {
    if (!(await ask('Would you like to log out?'))) return;

    sessionStorage.removeItem("saveso-employee");
    sessionStorage.removeItem("saveso-timestamp")

    window.location.reload();
  }
  //on the POS the buttons point at the cashier pages; managers/admins (role 1/2) get a way back to admin
  const inPOS = useLocation().pathname.startsWith('/cashier');
  const canOpenAdmin = employee && (Number(employee.role) === 1 || Number(employee.role) === 2);
  const clockInPath = inPOS ? '/cashier/clock-in' : '/admin/clock-in';
  //when not set employee == null automatically
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  //everything in the bell comes from the notifications table; clearing one marks it read in the db
  const [dismissed, setDismissed] = useState([]);

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
    //pages that change stock (checkout, saving inventory/shipments) ask for a reload right away
    window.addEventListener('saveso-notifications-refresh', loadNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('saveso-notifications-refresh', loadNotifications);
    };
  }, []);

  //opening the bell always shows the latest
  const toggleNotifications = () => {
    if (!showNotifications) loadNotifications();
    setShowNotifications(!showNotifications);
  }

  //hides it from the list and the count
  const dismissNotification = async (n) => {
    setDismissed([...dismissed, n.key]);

    //shipment messages come from the triggers, so clearing one marks it read and it stays gone
    if (!n.NotificationID) return;
    try{
      const response = await fetch(`/api/notifications/${n.NotificationID}`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
    } catch(error){
      console.log(error);
    }
  }

  const visible = notifications.filter((n) => !dismissed.includes(n.key));

  return (
      <nav className='flex border-t border-r border-b'>
        {popup}
        <div className='flex flex-1 space-x-2 p-7'>
          <search>
            <form action='search' >
              <label htmlFor="" className='text-sm'>Search</label>
              <input className='input-bar border ml-1' type="search"/>
            </form>
          </search>
          <section className='flex space-x-4 ml-auto'>
            <div className="relative">
              <button className="p-1 border rounded button-highlight" onClick={toggleNotifications}>
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
                      <button className="button-highlight px-2" onClick={() => dismissNotification(n)}>x</button>
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
