import { useState } from 'react';
import AddNewEntity from './AddNewEntity';

const TitleHeader = ({entity, showAdd = false, onCreated = () =>{} }) => {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className='inline-flex p-10'>
      <h2 className='admin-entity-header text-3xl pr-4 underline'>{entity}</h2>
      {showAdd && <button className="button-highlight p-1 border-2" onClick={() => setShowForm(true)}> Add New </button>}
      {showForm && (
        <AddNewEntity
          entity={entity}
          onClose={() => setShowForm(false)}
          onCreated={onCreated}
        />
      )}
    </div>
  )
}

export default TitleHeader