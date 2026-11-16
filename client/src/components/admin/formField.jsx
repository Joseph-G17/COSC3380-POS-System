import { getLabel, isRequired } from './fieldHelpers';

//small help text under a box
const HINTS = {
  PhoneNumber: '10 digits, no dashes',
  Email: 'name@example.com',
  Aisle: 'One letter and one number, like A1',
  LastFourDigits: 'Last 4 digits of the card',
  DiscountPercent: '0 to 100'
};

//picks the html input type from the db column type
//'datetime' is checked before 'date' since 'datetime' also starts with 'date'
const getInputType = (type) => {
  if (type.startsWith('datetime')) return 'datetime-local';
  if (type.startsWith('date')) return 'date';
  if (/int|decimal|double|float/.test(type)) return 'number';
  return 'text';
}

//turns a db value into something the input can display
const toInput = (value, inputType) => {
  if (value === null || value === undefined) return ''; 
  if (inputType === 'datetime-local') return String(value).replace(' ', 'T').slice(0, 16); //'2026-10-01 14:30:00' -> '2026-10-01T14:30'
  if (inputType === 'date') return String(value).slice(0, 10); //'2026-10-01T05:00:00.000Z' -> '2026-10-01'
  return value;
}

//one labeled input for a db column, picks a dropdown, textarea, or input based on the column type
//col: the column info (Field, Type, Null, ...), options: dropdown choices from loadOptions
//label: optional, overrides the label made from the column name
const FormField = ({ col, value, onChange, options, disabled = false, label }) => {
  const field = col.Field; //column name, e.g. 'FirstName'
  const inputType = getInputType(col.Type);
  const isLongText = col.Type === 'text'; 
  const lengthMatch = col.Type.match(/char\((\d+)\)/); // varchar(30) -> 30

  //dropdown choices: enum values, or the names of another table's rows
  let choices = null;
  if (col.Type.startsWith('enum')) {
    //"enum('Pickup','Delivery')" -> [{ value: 'Pickup', label: 'Pickup' }, ...]
    //slice(1, -1) strips the quotes off each match
    choices = col.Type.match(/'([^']*)'/g).map((quoted) => ({ value: quoted.slice(1, -1), label: quoted.slice(1, -1) }));
  } else if (options) {
    choices = options;
  }

  //passes the new value up to the form
  const handleChange = (event) => {
    let newValue = event.target.value;
    //the input gives '2026-10-01T14:30', the db wants '2026-10-01 14:30:00'
    if (inputType === 'datetime-local' && newValue !== '') newValue = newValue.replace('T', ' ') + ':00';
    onChange(field, newValue);
  }

  return (
    //long text boxes take up two grid columns
    <div className={isLongText ? 'flex flex-col col-span-2' : 'flex flex-col'}>
      <label htmlFor={field}>
        {label ?? getLabel(field)}
        {isRequired(col) && <span className="text-red-600"> *</span>}
      </label>

      {choices ? (
        <select
          id={field}
          className="border"
          value={value ?? ''}
          disabled={disabled}
          onChange={handleChange}
        >
          {/*blank first option: forces a pick if required, otherwise means no value*/}
          <option value=''>{isRequired(col) ? 'Choose one...' : 'None'}</option>
          {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
        </select>
      ) : isLongText ? (
        <textarea
          id={field}
          className="border"
          rows={3}
          value={value ?? ''}
          disabled={disabled}
          onChange={handleChange}
        />
      ) : (
        <input
          id={field}
          className="border disabled:bg-gray-100"
          type={inputType}
          step={inputType === 'number' && /decimal|double|float/.test(col.Type) ? 'any' : undefined} //allow decimals for money/decimal columns
          min={inputType === 'number' && col.Type.includes('unsigned') ? 0 : undefined} //unsigned columns can't go negative
          maxLength={lengthMatch ? Number(lengthMatch[1]) : undefined} //stop typing past the column's length
          value={toInput(value, inputType)}
          disabled={disabled}
          onChange={handleChange}
        />
      )}

      {HINTS[field] && <small className="text-gray-500">{HINTS[field]}</small>}
    </div>
  )
}

export default FormField
