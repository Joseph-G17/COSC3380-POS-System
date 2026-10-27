import {useEffect, useState} from 'react'
import DataSnippet from './DataSnippet';

const DataSnippets = ({ entity, idField, refresh}) => {
  //let cols will be the main attributes of that entity
  const [rows, setRows] = useState([]);
  const [loading, isLoading] = useState(true);

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

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  while (headers.length > 7){
    headers.pop();
  }

  return (
    <main className=''>
      <div className='grid' 
      style={{ gridTemplateColumns: `repeat(${headers.length || 1}, minmax(0, 1fr))` }}>
        {headers.map((h) => (
          <h2 className="border-b" key={h}> 
            {h}
          </h2>
        ))}
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {rows.map((row) => 
          <DataSnippet key={row[idField]} entity={entity} idField={idField} row={row} headers={headers}/>
        )}
      </div>
      <div className="" >
      
      </div>
    </main>
  )
}

export default DataSnippets