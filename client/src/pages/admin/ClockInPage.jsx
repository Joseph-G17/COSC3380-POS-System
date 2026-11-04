import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const ClockInPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(()=> {

      setCurrentTime(new Date());
    }, 1000); //updates every second

    return () => clearInterval(interval);
  }, []); //run once due to our dependency

  const [clockInMessage, setClockInMessage] = useState("");

  useEffect(() => {
    if (!clockInMessage)
      return;

    const timeout = setTimeout(() => { setClockInMessage("");}, 3000);
    return () => clearTimeout(timeout);

  }, [clockInMessage])
  const [timestamp, setTimestamp] = useState(() => {
    const saved = sessionStorage.getItem('saveso-timestamp');
    return saved ? Number(saved) : -1;
  });
  const { employee, setEmployee } = useOutletContext();

  const clockIn = async () => {
    if(employee.clockedIn == true)
      return;

    try {
      employee.clockedIn = true;
      sessionStorage.setItem('saveso-employee', JSON.stringify(employee));
      
      const now = Date.now();
      await setTimestamp(now);
      sessionStorage.setItem('saveso-timestamp', String(now));
      setClockInMessage(`Clocked in at ${currentTime.toLocaleTimeString()}`);
      
    } catch(error){
      
      console.log(error);
    }
  };
  const clockOut = () => {
    if(employee.clockedIn == false)
      return

    try {
      sessionStorage.setItem('saveso-employee', JSON.stringify(employee));
      const minutesWorked = Math.round((Date.now() - timestamp) / 60000);
      const hoursWorked = minutesWorked / 60;
      setClockInMessage(`Clocked out. You worked ${hoursWorked.toFixed(2)} hours.`);
      employee.clockedIn = false;
      sessionStorage.setItem('saveso-employee', JSON.stringify(employee));

      setTimestamp(-1);
      sessionStorage.removeItem('saveso-timestamp');
    
      const insertTime = async () => {
        const id = employee.id;
        const response = await fetch('/api/employee-hours',{
          method: "PUT",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ id, hoursWorked })
        }); //IN DB SET DEFAULT EMPLOYEE HOURS TO 0!
      }
      insertTime();

    } catch(error){
      
      console.log(error);
    }
  };

    
  return (
    <section className="text-center w-3/7 h-3/4 border self-center justify-self-center p-4">
      <div className="grid grid-rows-[200px_auto] gap-4">
        <div className="flex-col place-content-center-safe border min-w-0 ">
          <h1 className="text-2xl flex-grow-2 underline">Clock In</h1>
          <h2 className="text-3xl truncate bottom-0">{currentTime.toLocaleTimeString()}</h2>
        </div>

        <div className="grid grid-rows-[100px_auto] min-w-0">
          <div className="text-xl truncate">
            <p> Welcome, {employee && employee.firstName} </p>
            {clockInMessage && (
              <div className="">{clockInMessage} </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <button onClick={clockIn} className="border button-highlight p-1">CLOCK IN</button>
            <button onClick={clockOut} className="border button-highlight p-1 ">CLOCK OUT</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ClockInPage