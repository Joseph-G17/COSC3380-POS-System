import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormField from './formField';
import { loadOptions, isRequired, getLabel } from './fieldHelpers';
import EmployeeHours from './EmployeeHours';
import EmployeeLogin from './EmployeeLogin';
import NewCategory from './NewCategory';

const InspectDescription = ({entity, id, idField}) => { 
  const navigate = useNavigate();
  const [inspectedData, setInspectedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [options, setOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    const loadData = async() => {
      try{
        const [rowResponse, columnResponse] = await Promise.all([
          fetch(`/api/${entity}/${id}`),
          fetch(`/api/${entity}/columns`)
        ]);
        const rowData = await rowResponse.json();
        const columnData = await columnResponse.json();
        if (!rowResponse.ok) throw new Error(rowData.message);
        if (!columnResponse.ok) throw new Error(columnData.message);

        setInspectedData(rowData);
        setFormData(rowData[0] || {});
        setColumns(columnData);
        setOptions(await loadOptions(columnData));
      } catch(error){
        console.log(error);
        setMessage(error.message);
      } finally{
        setLoading(false);
      }
    }
    loadData();
  }, [entity, id]);

  const row = inspectedData[0];

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
    setMessage('');
  }

  //new category goes into the dropdown and gets picked
  const handleNewCategory = (newId, name) => {
    setOptions({...options, ItemCategoryID: [...(options.ItemCategoryID || []), { value: newId, label: name }]});
    handleChange('ItemCategoryID', newId);
  }

  //only the attributes that were actually changed
  const getChanges = () => {
    const changes = {};
    columns.forEach((col) => {
      const h = col.Field;
      if (h === idField) return;
      const before = String(row[h] ?? '');
      const after = String(formData[h] ?? '');
      if (before !== after) changes[h] = formData[h] === '' ? null : formData[h];
    });
    return changes;
  }

  const handleConfirm = async() => {
    try{
      const missing = columns
        .filter((col) => col.Field !== idField && isRequired(col) && !formData[col.Field])
        .map((col) => getLabel(col.Field));

      if (missing.length > 0) {
        setMessage(`Please fill in: ${missing.join(', ')}`);
        return;
      }

      const changes = getChanges();

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
    if (!window.confirm(`Delete this ${entity} record? This cannot be undone.`)) return;
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

  if (loading) return <p className="p-4">Loading...</p>;
  if (!row) return <p className="p-4">{message || 'No data found.'}</p>;

  const hasChanges = Object.keys(getChanges()).length > 0;

  return (
    <div className="p-4 max-w-3xl">
      <button className="button-highlight border px-2 mb-4" onClick={() => navigate(-1)}>Back</button>

      <p className="pb-4 text-sm text-gray-500"><span className="text-red-600">*</span> required</p>

      <div className="grid grid-cols-2 gap-4">
        {columns.map((col) => (
          <FormField
            key={col.Field}
            col={col}
            label={col.Field === idField ? 'ID' : undefined}
            value={formData[col.Field]}
            options={options[col.Field]}
            disabled={col.Field === idField}
            onChange={handleChange}
          />
        ))}
      </div>

      {entity === 'Items' && <NewCategory onCreated={handleNewCategory}/>}

      <div className="flex space-x-2 pt-4">
        <button
          className='button-highlight border px-2 disabled:opacity-50'
          disabled={!hasChanges}
          onClick={handleConfirm}
        >
          Confirm
        </button>
        <button className='button-highlight border px-2' onClick={handleDelete}>Delete</button>
      </div>

      {hasChanges && !message && <p className="pt-3 text-sm text-gray-500">You have unsaved changes.</p>}
      {message && (
        <p className={message === 'Saved!' ? 'pt-3 text-green-700' : 'pt-3 text-red-600'}>
          {message}
        </p>
      )}

      {entity === 'Employees' && <EmployeeLogin employeeId={id} />}
      {entity === 'Employees' && <EmployeeHours employeeId={id} />}
    </div>
  )
}

export default InspectDescription