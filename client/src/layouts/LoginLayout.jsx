import { useNavigate } from "react-router-dom";


// The store's Login/Account links open this shared team page at /login.
// Flow: form fields -> /api/login -> employee ID and role -> next page.
// WIP: customer sign-in and saved sign-in state are not connected here.
const LoginLayout = () => {
  // React Router supplies a function that changes the page after the server replies.
  const navigate = useNavigate();

  // The form below passes its current email (username) and password to this function.
  async function SubmitLogin(username, password) {
    // Send JSON to the backend; server.js currently routes this POST to employee login.
    // await waits for the HTTP reply before the response is read below.
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password}),
    });
    // Read the reply and choose a page. The fetch above is outside this try block,
    // so a failed network request is not handled by the catch below yet.
    try{
      // Turn the response JSON into an object such as {employeeID, Role}.
      const data =  await response.json();

      // A failed login has no employeeID: stay here. No visible error is shown yet.
      if(!data.employeeID)
        return;

      // This local value is not used below and does not save a signed-in session.
      const currentEmployeeID = data.employeeID;

      // Follow the current employee-role paths: 0 or 1 -> admin, others -> store.
      // Returning to the store here does not authenticate a customer account.
      if(data.Role == 0)
        navigate('/admin');
      else if(data.Role == 1)
        navigate('/admin');
      else
        navigate('/')
    }
    catch(error){
      // Report the error for debugging; this catch does not display a message in the form.
      console.log(error);
    }
  }
  return (
    <div className="mt-7">
      <div className="inline-flex justify-center items-center w-screen">
        <img src="/SaveSolLogo.png" alt="logo" className='w-30 h-30'/>
        <h1 className="text-6xl font-extralight">SaveSo</h1>
      </div>
      {/* The browser checks required fields, then calls onSubmit with its submit event. */}
      <form action="submit" className="justify-self-center mt-14 w-110"
      onSubmit={(e) => {
        // Stop the normal HTML form navigation so SubmitLogin can handle the reply.
        e.preventDefault();
        // Read the current inputs; the email field is sent under the name username.
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
          {/* Cancel reloads this login page and clears the fields; it does not return to the store. */}
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