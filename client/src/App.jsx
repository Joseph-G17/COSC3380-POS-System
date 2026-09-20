import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
const App = () => {
  const [count, setCount] = useState(0);
  const [array, setArray] = useState([]);

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/api");
    setArray(response.data.users);
    console.log(response.data.users);
  };

  useEffect(() => {
    fetchAPI();
  }, []); //runs on end of inital render of this component

  return (  
    <div>App
      { array.map((user, index)=> (  
        <div key={index}>
          <p>{user}</p>
          <br></br>
        </div>
      ))}
    </div>
  )
}

export default App