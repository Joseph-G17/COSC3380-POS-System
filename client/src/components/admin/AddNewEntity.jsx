import { useState, useEffect } from 'react';
import FormField from './formField';
import { loadOptions, isRequired, getLabel } from './fieldHelpers';

const AddNewEntity = ({ entity, onClose, onCreated }) => {
  const [columns, setColumns] = useState([]);
  const [options, setOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadColumns = async() => {
      try{
        const response = await fetch(`/api/${entity}/columns`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const cols = data.filter((col) => col.Extra !== 'auto_increment');
        setColumns(cols);
        setOptions(await loadOptions(cols));
      } catch(error){
        console.log(error);
        setMessage(error.message);
      } finally{
        setLoading(false);
      }
    }
    loadColumns();
  }, [entity]);

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  }

  const handleConfirm = async() => {
    try{
      // check the required boxes before asking the server
      const missing = columns
        .filter((col) => isRequired(col) && !formData[col.Field])
        .map((col) => getLabel(col.Field));

      if (missing.length > 0) {
        setMessage(`Please fill in: ${missing.join(', ')}`);
        return;
      }

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
        <h2 className="text-2xl underline pb-1">New {entity}</h2>
        <p className="pb-4 text-sm text-gray-500"><span className="text-red-600">*</span> required</p>

        {loading && <p>Loading...</p>}

        <div className="grid grid-cols-2 gap-3">
          {columns.map((col) => (
            <FormField
              key={col.Field}
              col={col}
              value={formData[col.Field]}
              options={options[col.Field]}
              onChange={handleChange}
            />
          ))}
        </div>

        <div className="flex space-x-2 pt-4">
          <button className="button-highlight p-1 border-2" onClick={handleConfirm}>Confirm</button>
          <button className="button-highlight p-1 border-2" onClick={onClose}>Cancel</button>
        </div>

        {message && <p className="pt-3 text-red-600">{message}</p>}
      </div>
    </div>
  )
}

export default AddNewEntity