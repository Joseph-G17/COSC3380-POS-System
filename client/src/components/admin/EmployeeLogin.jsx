import { useState, useEffect } from 'react';

const EmployeeLogin = ({ employeeId }) => {
  const [username, setUsername] = useState('');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const loadLogin = async () => {
    try{
      const response = await fetch(`/api/employee-login/${employeeId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsername(data.username);
    } catch(error){
      console.log(error);
      setMessage(error.message); //so a server error doesn't look like "no login yet"
    }
  }

  useEffect(() => {
    loadLogin();
  }, [employeeId]);

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  }

  const handleSave = async () => {
    try{
      const response = await fetch('/api/employee-login',{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: employeeId, ...formData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFormData({});
      setMessage('Login saved!');
      loadLogin();
    } catch(error){
      setMessage(error.message);
    }
  }

  return (
    <div className="pt-4">
      <h3 className="font-bold">Login</h3>
      <p className="text-sm text-gray-500">
        {username ? `Current username: ${username}` : 'This employee has no login yet.'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label>{username ? 'New Username' : 'Username'}</label>
          <input className="border" type="text" maxLength={30} value={formData.username ?? ''}
            onChange={(e) => handleChange('username', e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label>{username ? 'New Password' : 'Password'}</label>
          <input className="border" type="password" value={formData.password ?? ''}
            onChange={(e) => handleChange('password', e.target.value)} />
        </div>
      </div>
      {username && <small className="text-gray-500">Leave a box blank to keep it the same</small>}

      <div>
        <button className="button-highlight border px-2 mt-3" onClick={handleSave}>Save Login</button>
      </div>
      {message && <p className="pt-2">{message}</p>}
    </div>
  )
}

export default EmployeeLogin
