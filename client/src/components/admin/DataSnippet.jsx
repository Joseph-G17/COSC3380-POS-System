import { NavLink } from "react-router-dom"

//2026-10-01T05:00:00.000Z -> 2026-10-01, anything else stays the same
const showDate = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
  return value;
}

const DataSnippet = ({idField, entity, headers, row }) => {
  return (
    <>
      <NavLink
        to={`/admin/inspectData/${entity}/${row[idField]}`}
        className="grid grid-flow-col auto-cols-fr hover:bg-amber-50"
      >
        {headers.map((h) => (
          <span key={h} className="border-b py-4 px-3 truncate text-left">
            {showDate(row[h])}
          </span>
        ))}
      </NavLink>
    </>
  )
}

export default DataSnippet
