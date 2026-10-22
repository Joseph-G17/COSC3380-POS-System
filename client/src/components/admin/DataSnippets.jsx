import {useEffect, useState} from 'react'
import DataSnippet from './DataSnippet';

const DataSnippets = ({ entity }) => {
  //let cols will be the main attributes of that entity
  const [cols, setCols] = useState([]);
  const [loading, isLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try{
        const response = await fetch(`/api/${entity}`,{
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        setCols(data);
        console.log(data);
      } catch(error) {
        console.log(error);
      }finally {
        isLoading(false);
      }
    }
    loadData();

  },[entity]);

  return (
    <main className=''>
      <div className="grid grid-flow-col border-t border-b border-r">
        {cols.map((col) => 
          <p key={col} className="border-l">{col.EmployeeID}</p>
        )}
      </div>
      <div className="" >
      
      </div>
    </main>
  )
}

export default DataSnippets