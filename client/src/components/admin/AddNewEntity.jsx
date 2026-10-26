import { useState, useEffect } from 'react';

const AddNewEntity = ({ entity, onClose, onCreated }) => {
  const [columns, setColumns] = useState([]);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadColumns = async() => {
      try{
        const response = await fetch(`/api/${entity}/columns`);
        const data = await response.json();
        setColumns(data.filter((col) => col.Extra !== 'auto_increment'));
      } catch(error){
        console.log(error);
      }
    }
    loadColumns();
  }, [entity]);

  const handleConfirm = async() => {
    try{
      const newRow = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== '')
      );

      const response = await fetch(`/api/${entity}`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newRow)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      onCreated();
      onClose();
    } catch(error){
      setMessage(error.message);
    }
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border-2 bg-white p-6">
        <h2 className="text-2xl underline pb-4">New {entity}</h2>

        {columns.map((col) => (
          <div key={col.Field} className="flex flex-col">
            <label>{col.Field}</label>
            <input
              className="border"
              onChange={(e) => setFormData({...formData, [col.Field]: e.target.value})}
            />
          </div>
        ))}

        <div className="flex pt-4">
          <button className="button-highlight p-1 border-2" onClick={handleConfirm}>Confirm</button>
          <button className="button-highlight p-1 border-2" onClick={onClose}>Cancel</button>
        </div>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

export default AddNewEntity