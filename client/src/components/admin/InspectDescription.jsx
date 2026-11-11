import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormField from './formField';
import { loadOptions, isRequired, getLabel } from './fieldHelpers';
import EmployeeHours from './EmployeeHours';
import EmployeeLogin from './EmployeeLogin';
import NewCategory from './NewCategory';
import OrderItems from './OrderItems';

//tables whose id is two columns; the URL id is "SaleID-ItemID" / "SeasonID-ItemID"
const TWO_COLUMN_KEYS = {
  'Sale Items': ['SaleID', 'ItemID'],
  'Seasonal Deals': ['SeasonID', 'ItemID']
};

const InspectDescription = ({entity, id, idField}) => { 
  const navigate = useNavigate();
  const [inspectedData, setInspectedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [options, setOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showHours, setShowHours] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [moveTo, setMoveTo] = useState('');

  //deleting a department moves its employees somewhere else first
  useEffect(() => {
    if (entity !== 'Departments') return;
    fetch('/api/Departments')
      .then((response) => response.json())
      .then((rows) => setDepartments(Array.isArray(rows) ? rows.filter((d) => String(d.DepartmentID) !== String(id)) : []))
      .catch((error) => console.log(error));
  }, [entity, id]);

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
      //stock/shipment changes can set off the notification triggers
      if (entity === 'Inventory' || entity === 'Shipments') window.dispatchEvent(new Event('saveso-notifications-refresh'));

      //picked a different sale/season or item: the record's id changed, so move to its new address
      const keys = TWO_COLUMN_KEYS[entity];
      if (keys && keys.some((k) => k in changes)) {
        const newId = keys.map((k) => ({...row, ...changes})[k]).join('-');
        navigate(`/admin/inspectData/${entity}/${newId}`, { replace: true });
      }
    } catch(error){
      console.log(error);
      setMessage(error.message);
    }
  }

  //delete whole entity
  const handleDelete = async() => {
    const target = departments.find((d) => String(d.DepartmentID) === String(moveTo));
    const prompt = target
      ? `Move this department's employees to ${target.DepartmentName} and delete it? This cannot be undone.`
      : `Delete this ${entity} record? This cannot be undone.`;
    if (!window.confirm(prompt)) return;
    try{
      const query = entity === 'Departments' && moveTo ? `?moveTo=${moveTo}` : '';
      const response = await fetch(`/api/${entity}/${id}${query}`,{
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

  //the only change an admin can make to an order
  const handleCancelOrder = async() => {
    if (!window.confirm(`Cancel order #${id}? This cannot be undone.`)) return;
    try{
      const response = await fetch(`/api/Orders/${id}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ OrderStatus: 'Canceled' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);

      const canceled = {...row, OrderStatus: 'Canceled', CanceledDate: new Date().toISOString()};
      setInspectedData([canceled]);
      setFormData(canceled);
      setMessage('Order canceled.');
    } catch(error){
      console.log(error);
      setMessage(error.message);
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (!row) return <p className="p-4">{message || 'No data found.'}</p>;

  //orders and returns are history, a shipment is too once it has arrived
  const arrived = entity === 'Shipments' && row.ArrivalDate !== null && row.ArrivalDate !== undefined;
  const readOnly = entity === 'Orders' || entity === 'Returns' || arrived;
  const readOnlyNote = {
    Orders: row.OrderStatus === 'Canceled' ? 'This order is canceled.' : 'Orders are view only. You can cancel a completed order.',
    Returns: 'Returns are view only.',
    Shipments: 'This shipment has arrived and can no longer be edited or deleted.'
  }[entity];

  const hasChanges = !readOnly && Object.keys(getChanges()).length > 0;
  const isSuccess = message === 'Saved!' || message === 'Order canceled.';

  return (
    <div className="p-4 max-w-3xl">
      <button className="button-highlight border px-2 mb-4" onClick={() => navigate(-1)}>Back</button>

      {readOnly
        ? <p className="pb-4 text-sm text-gray-500">{readOnlyNote}</p>
        : <p className="pb-4 text-sm text-gray-500"><span className="text-red-600">*</span> required</p>}

      <div className="grid grid-cols-2 gap-4">
        {columns.map((col) => (
          <FormField
            key={col.Field}
            col={col}
            label={col.Field === idField ? 'ID' : undefined}
            value={formData[col.Field]}
            options={options[col.Field]}
            disabled={readOnly || col.Field === idField}
            onChange={handleChange}
          />
        ))}
      </div>

      {entity === 'Items' && <NewCategory onCreated={handleNewCategory}/>}

      {entity === 'Departments' && (
        <div className="flex flex-col pt-4 max-w-xs">
          <label htmlFor="moveTo">Move employees to (needed to delete a department that has employees)</label>
          <select id="moveTo" className="border" value={moveTo} onChange={(e) => { setMoveTo(e.target.value); setMessage(''); }}>
            <option value=''>None</option>
            {departments.map((d) => <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>)}
          </select>
        </div>
      )}

      {!readOnly && (
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
      )}

      {entity === 'Orders' && row.OrderStatus !== 'Canceled' && (
        <div className="flex space-x-2 pt-4">
          <button className='button-highlight border px-2 text-red-600' onClick={handleCancelOrder}>Cancel Order</button>
        </div>
      )}

      {hasChanges && !message && <p className="pt-3 text-sm text-gray-500">You have unsaved changes.</p>}
      {message && (
        <p className={isSuccess ? 'pt-3 text-green-700' : 'pt-3 text-red-600'}>
          {message}
        </p>
      )}

      {entity === 'Orders' && <OrderItems orderId={id} />}
      {entity === 'Employees' && <EmployeeLogin employeeId={id} />}
      {entity === 'Employees' && <EmployeeHours employeeId={id} />}
    </div>
  )
}

export default InspectDescription