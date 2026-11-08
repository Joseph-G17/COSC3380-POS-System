import {useEffect, useState} from 'react';
import { useOutletContext } from 'react-router-dom';
import DataSnippet from './DataSnippet';

const DataSnippets = ({ entity, idField, refresh}) => {
  //let cols will be the main attributes of that entity
  const [rows, setRows] = useState([]);
  const [loading, isLoading] = useState(true);
  const { employee } = useOutletContext();


  useEffect(() => {
    const loadData = async () => {
      setRows([]);
      try{
        const response = await fetch(`/api/${entity}`,{
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        setRows(data);
      } catch(error) {
        console.log(error);
      }finally {
        isLoading(false);
      }
    }
    loadData();
  },[entity, refresh]);

  const headers = rows.length > 0 ? Object.keys(rows[0]).filter((h) => h !== idField) : [];
  while (headers.length > 7){
    headers.pop();
  }

  return (
    <main className=''>
      <div className="pb-4 pl-4 text-sm text-gray-500" >
        Total Rows: {rows.length}
      </div>
      <div className='grid' 
      style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
        {headers.map((h) => (
          <h2 className="border-b" key={h}> 
            {h.replace(/([a-z])([A-Z])/g, '$1 $2')}
          </h2>
        ))}
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {rows.map((row) => 
          <DataSnippet key={row[idField]} entity={entity} idField={idField} row={row} headers={headers}/>
        )}
      </div>
    </main>
  )
}

export default DataSnippets