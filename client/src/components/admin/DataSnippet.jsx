import { NavLink } from "react-router-dom"
const DataSnippet = ({idField, entity, headers, row }) => {
  return (
    <>
      <NavLink
        to={`/admin/inspectData/${entity}/${row[idField]}`}
        className="grid grid-flow-col auto-cols-fr hover:bg-amber-50"
      >
        {headers.map((h) => (
          <span key={h} className="border-b py-4 px-3 truncate text-left">
            {row[h]}
          </span>
        ))}
      </NavLink>
    </>
  )
}

export default DataSnippet
