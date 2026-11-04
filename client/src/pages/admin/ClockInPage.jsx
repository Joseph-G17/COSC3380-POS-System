import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const ClockInPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timestamp, setTimestamp] = useState(-1);
  const { employee, setEmployee } = useOutletContext();

  useEffect(() => {
    const interval = setInterval(()=> {

      setCurrentDate(new Date());
    }, 1000); //updates every second

    return () => clearInterval(interval);
  }, []); //run once due to our dependency

  const clockIn = () => {
    try {
      employee.clockedIn = true;
      sessionStorage.setItem('saveso-employee', JSON.stringify(employee));
      //CHANGE DATA IN DATA BASE 
      setTimestamp(currentDate.getHours());
    } catch(error){
      
      console.log(error);
    }
  };
  const clockOut = () => {
    try {
      employee.clockedIn = false;
      sessionStorage.setItem('saveso-employee', JSON.stringify(employee));
      setTimestamp(-1);
      const hoursWorked = currentDate.getHours() - timestamp;
      console.log(hoursWorked);
      
      const insertTime = async () => {
        const response = await fetch('api/employee hours',{
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(employee.id, hoursWorked)
        }); //IN DB SET DEFAULT EMPLOYEE HOURS TO 0!
      }
    } catch(error){
      
      console.log(error);
    }
  };

    
  return (
    <section className="text-center w-1/2 h-3/4 border self-center justify-self-center">
      <div className="grid grid-rows-[120px_auto] gap-4">
        <div className="flex-col place-content-center-safe border min-w-0 ">
          <h1 className="text-2xl flex-grow-2 underline">Clock In</h1>
          <h2 className="text-3xl truncate bottom-0">{currentDate.toLocaleTimeString()}</h2>
        </div>
        <div className="grid grid-rows-[100px_auto]">
          <div>
            Welcome, {employee.firstName}
          </div>
          <div>
            <button onClick={clockIn} className="button-highlight">CLOCK IN</button>
            <button onClick={clockOut} className="button-highlight">CLOCK OUT</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ClockInPage