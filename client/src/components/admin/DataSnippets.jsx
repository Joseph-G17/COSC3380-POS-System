import {useEffect, useState} from 'react'

async function GetColHeaders(cols){
    const response = await fetch(`/api/${entity}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({entity})
    });
    const data = await response.json();
    return data;
    console.log(data);
  }

const DataSnippets = ({ entity }) => {
  //let cols will be the main attributes of that entity
  [cols, setCols] = useState('');
  [loading, isLoading] = useState(false);

  useEffect(() =>{
    //
  },[entity])

  return (
    <main className=''>
      <div className="grid grid-flow-col border-t border-b border-r">
        {cols.map((col) => 
          <p key={col} className="border-l">{col}</p>
        )}
      </div>
      <div className="" >
      
      </div>
    </main>
  )
}

export default DataSnippets