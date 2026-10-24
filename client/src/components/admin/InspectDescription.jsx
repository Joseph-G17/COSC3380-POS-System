import { useState, useEffect } from "react";
import { Navigate, NavLink } from "react-router-dom";

const InspectDescription = ({entity, id}) => {  
  const [inspectedData, setInspectedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async() => {
      try{
        const response = await fetch(`/api/${entity}/${id}`,{
          method: 'GET',
          headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
      
        setInspectedData(data);
      } catch(error){
        console.log(error)
      } finally{
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const row = inspectedData[0];
  const headers = row ? Object.keys(row) : [];

  return (
    <div>
      {headers.map((h) => (
          <p key={h}>{row[h]}</p>
      ))}
    </div>
  )
}

export default InspectDescription
