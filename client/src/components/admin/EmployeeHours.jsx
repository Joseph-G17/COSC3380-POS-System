import { useState, useEffect } from 'react';

//2026-10-01T05:00:00.000Z -> Oct 1, 2026
const showDate = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

//12.5 -> 12h 30m
const showHours = (value) => {
  const totalMinutes = Math.round(Number(value) * 60);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

const EmployeeHours = ({ employeeId }) => {
  const [periods, setPeriods] = useState([]);   
  const [formData, setFormData] = useState({}); 
  const [message, setMessage] = useState('');

  const loadPeriods = async () => {
    try{
      const response = await fetch(`/api/${encodeURIComponent('Employee Hours')}/${employeeId}`);
      const data = await response.json();
      if (response.ok) setPeriods(data);
      else setPeriods([]); 
    } catch(error){
      console.log(error);
    }
  }

  useEffect(() => {
    loadPeriods();
  }, [employeeId]);

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  }

  const handleSave = async () => {
    try{
      const response = await fetch(`/api/${encodeURIComponent('Employee Hours')}`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ EmployeeID: employeeId, ...formData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormData({});
      setMessage('Hours saved!');
      loadPeriods(); 
    } catch(error){
      setMessage(error.message);
    }
  }

  return (
    <div className="pt-4">
      <h3 className="font-bold">Hours</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label>Pay Period Start</label>
          <input className="border" type="date" value={formData.PayPeriodStart ?? ''}
            onChange={(e) => handleChange('PayPeriodStart', e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label>Pay Period End</label>
          <input className="border" type="date" value={formData.PayPeriodEnd ?? ''}
            onChange={(e) => handleChange('PayPeriodEnd', e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label>Hourly Rate ($)</label>
          <input className="border" type="number" value={formData.HourlyRate ?? ''}
            onChange={(e) => handleChange('HourlyRate', e.target.value)} />
        </div>
      </div>

      <button className="button-highlight border px-2 mt-3" onClick={handleSave}>Save Hours</button>
      {message && <p className="pt-2">{message}</p>}

      {periods.map((p) => (
        <p key={p.PayPeriodStart} className="text-sm">
          {showDate(p.PayPeriodStart)} - {showDate(p.PayPeriodEnd)}: {showHours(p.HoursWorked)} at ${Number(p.HourlyRate).toFixed(2)}/hr
        </p>
      ))}
    </div>
  )
}

export default EmployeeHours