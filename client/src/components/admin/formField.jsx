import { getLabel, isRequired } from './fieldHelpers';

//small help text under a box
const HINTS = {
  PhoneNumber: '10 digits, no dashes',
  Email: 'name@example.com',
  Aisle: 'One letter and one number, like A1',
  LastFourDigits: 'Last 4 digits of the card',
  DiscountPercent: '0 to 100'
};

const getInputType = (type) => {
  if (type.startsWith('datetime')) return 'datetime-local';
  if (type.startsWith('date')) return 'date';
  if (/int|decimal|double|float/.test(type)) return 'number';
  return 'text';
}

const toInput = (value, inputType) => {
  if (value === null || value === undefined) return '';
  if (inputType === 'datetime-local') return String(value).replace(' ', 'T').slice(0, 16);
  if (inputType === 'date') return String(value).slice(0, 10);
  return value;
}

const FormField = ({ col, value, onChange, options, disabled = false, label }) => {
  const field = col.Field;
  const inputType = getInputType(col.Type);
  const isLongText = col.Type === 'text';
  const lengthMatch = col.Type.match(/char\((\d+)\)/); // varchar(30) -> 30

  //dropdown choices: enum values, or the names of another table's rows
  let choices = null;
  if (col.Type.startsWith('enum')) {
    choices = col.Type.match(/'([^']*)'/g).map((o) => ({ value: o.slice(1, -1), label: o.slice(1, -1) }));
  } else if (options) {
    choices = options;
  }

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (inputType === 'datetime-local' && newValue !== '') newValue = newValue.replace('T', ' ') + ':00';
    onChange(field, newValue);
  }

  return (
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
          <option value=''>{isRequired(col) ? 'Choose one...' : 'None'}</option>
          {choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
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
          step={inputType === 'number' && /decimal|double|float/.test(col.Type) ? 'any' : undefined}
          min={inputType === 'number' && col.Type.includes('unsigned') ? 0 : undefined}
          maxLength={lengthMatch ? Number(lengthMatch[1]) : undefined}
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