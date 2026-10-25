import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";

const InspectDescription = ({entity, id, idField}) => { 
  const navigate = useNavigate();
  const [inspectedData, setInspectedData] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async() => {
      try{
        const response = await fetch(`/api/${entity}/${id}`,{
          method: 'GET',
          headers: {'Content-Type': 'application/json'}
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
      
        setInspectedData(data);
        setFormData(data[0] || {});
      } catch(error){
        console.log(error)
      } finally{
        setLoading(false);
      }
    }
    loadData();
  }, [entity, id]);

  const row = inspectedData[0];
  const headers = row ? Object.keys(row) : [];

  const handleChange = (h, value) => {
    setFormData({...formData, [h]: value});
  }

  //sends attributes that were actually changed
  const handleConfirm = async() => {
    try{
      const changes = {};
      headers.forEach((h) => {
        if (h === idField) return;
        if (formData[h] !== row[h]) {
          changes[h] = formData[h] === '' ? null : formData[h];
        }
      });

      if (Object.keys(changes).length === 0) {
        setMessage('No changes to save.');
        return;
      }

      const response = await fetch(`/api/${entity}/${id}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(changes)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);

      setInspectedData([{...row, ...changes}]);
      setMessage('Saved!');
    } catch(error){
      console.log(error);
      setMessage(error.message);
    }
  }

  //delete whole entity
  const handleDelete = async() => {
    if (!window.confirm(`Delete ${entity} ${id}? This cannot be undone.`)) return;
    try{
      const response = await fetch(`/api/${entity}/${id}`,{
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);

      navigate(-1);
    } catch(error){
      console.log(error);
      setMessage(error.message);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!row) return <p>No data found.</p>;

  return (
    <div>
      {headers.map((h) => (
        <div key={h} className="flex flex-col">
          <label htmlFor={h}>{h}</label>
            {typeof formData[h] === 'string' && formData[h].length > 80 ? (
            <textarea
              id={h}
              className="border"
              value={formData[h] ?? ''}
              onChange={(e) => handleChange(h, e.target.value)}
            />
          ) : (
            <input
              id={h}
              className="border"
              value={formData[h] ?? ''}
              disabled={h === idField}
              onChange={(e) => handleChange(h, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="flex space-x-2 p-3">
        <button className='button-highlight border' onClick={handleConfirm}>Confirm</button>
        <button className='button-highlight border' onClick={handleDelete}>Delete</button>
      </div>
      {message && <p className="p-5">{message}</p>}
    </div>
  )
}

export default InspectDescription
