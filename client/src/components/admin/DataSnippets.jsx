

const DataSnippets = ({ entity }) => {
  //let cols will be the main attributes of that entity
  let cols = ['data1','data1','data1','data1','data1', entity]
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