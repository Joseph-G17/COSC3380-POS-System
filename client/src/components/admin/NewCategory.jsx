import { useState } from 'react';

//lets you make a category right from the item form
const NewCategory = ({ onCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  }

  const handleSave = async () => {
    try{
      if (!formData.CategoryName) {
        setMessage('Please fill in: Category Name');
        return;
      }

      const response = await fetch(`/api/${encodeURIComponent('Item Categories')}`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ CategoryName: formData.CategoryName, Aisle: formData.Aisle || null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      onCreated(data.id, formData.CategoryName);
      setFormData({});
      setMessage('');
      setShowForm(false);
    } catch(error){
      setMessage(error.message);
    }
  }

  if (!showForm) {
    return (
      <button className="button-highlight border px-2 mt-3" onClick={() => setShowForm(true)}>
        + New Category
      </button>
    )
  }

  return (
    <div className="border p-3 mt-3">
      <h3 className="font-bold">New Category</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label>Category Name <span className="text-red-600">*</span></label>
          <input className="border" type="text" value={formData.CategoryName ?? ''}
            onChange={(e) => handleChange('CategoryName', e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label>Aisle</label>
          <input className="border" type="text" maxLength={2} value={formData.Aisle ?? ''}
            onChange={(e) => handleChange('Aisle', e.target.value.toUpperCase())} />
          <small className="text-gray-500">One letter and one number, like A1</small>
        </div>
      </div>

      <div className="flex space-x-2 pt-3">
        <button className="button-highlight border px-2" onClick={handleSave}>Add Category</button>
        <button className="button-highlight border px-2" onClick={() => setShowForm(false)}>Cancel</button>
      </div>
      {message && <p className="pt-2 text-red-600">{message}</p>}
    </div>
  )
}

export default NewCategory
