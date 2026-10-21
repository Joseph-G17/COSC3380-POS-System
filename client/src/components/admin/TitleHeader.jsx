import { useSearchParams } from "react-router-dom";

const TitleHeader = ({title, showAdd = false}) => {

  return (
    <div className='inline-flex p-10'>
      <h2 className='admin-entity-header text-3xl pr-4 underline'>{title}</h2>
      {showAdd && <button className="button-highlight p-1 border-2"> Add New </button>}
  </div>
  )
}

export default TitleHeader