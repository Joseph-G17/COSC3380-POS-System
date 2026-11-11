import { useState } from 'react';
import AddNewEntity from './AddNewEntity';

const TitleHeader = ({entity, report, showAdd = false, onCreated = () =>{} }) => {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className='inline-flex p-10'>
      <h2 className='admin-entity-header text-3xl pr-4 underline'>{entity || report }</h2>
      {/*orders and returns are view only, they get made at the register / online store*/}
      {showAdd && entity != 'Orders' && entity != 'Returns' &&
      <button className="button-highlight p-1 border-2" onClick={() => setShowForm(true)}> 
          Add New 
      </button>}
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