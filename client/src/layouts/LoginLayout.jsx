import { useNavigate } from "react-router-dom";


const LoginLayout = () => {
  const navigate = useNavigate();

  async function SubmitLogin(username, password) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password}),
    });
    try{
      const data =  await response.json();

      if(!data.employeeID)
        return;

      const currentEmployeeID = data.employeeID;

      if(data.Role == 0)
        navigate('/admin');
      else if(data.Role == 1)
        navigate('/admin');
      else
        navigate('/')
    }
    catch(error){
      console.log(error);
    }
  }
  return (
    <div className="mt-7">
      <div className="inline-flex justify-center items-center w-screen">
        <img src="/SaveSolLogo.png" alt="logo" className='w-30 h-30'/>
        <h1 className="text-6xl font-extralight">SaveSo</h1>
      </div>
      <form action="submit" className="justify-self-center mt-14 w-110"
      onSubmit={(e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        SubmitLogin(username, password);
      }}>
        <div className="mb-14">
          <p className="flex flex-col gap-2 p-2 font-light">
            <label htmlFor="" className="text-3xl">Email: </label>
            <input required className='input-bar p-3' type="email" id="username" />
          </p>
          <p className="flex flex-col gap-2 p-2 font-light">
            <label htmlFor="" className="text-3xl">Password: </label>
            <input required className='input-bar p-3' type="password" id="password"/>
          </p>
        </div>
        <div className="flex justify-between">
          <button className="rounded button-highlight p-2 text-2xl font-light border" 
            type="submit">
              Submit
          </button>
          <button className="rounded button-highlight  p-2 text-2xl font-light border"
            type="button" onClick={() => window.location.reload()}>
              Cancel 
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginLayout