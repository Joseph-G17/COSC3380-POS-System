import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { customerFormUrl, customerReturnPath, saveCustomer } from "./customerSession";

const inputStyle = "w-full rounded-lg border border-gray-400 px-3 py-3 focus:outline-green-800 disabled:bg-gray-100";

function CustomerLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = customerReturnPath(params.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Ask the staff login when the customer login says no
  async function staffLogIn(){
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    });
    const staff = await response.json();

    if(!response.ok){
      return false;
    }
    //Save the employee the same way the staff pages read it
    sessionStorage.setItem("saveso-employee", JSON.stringify({ id: staff.employeeID, firstName: staff.firstName, clockedIn: false, department: staff.departmentID }));
    //Role 0 is a cashier, the other roles use the admin pages
    if(staff.Role === 0){
      navigate("/cashier");
    }else{
      navigate("/admin");
    }
    return true;
  }

  async function logIn(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });
      const data = await response.json();

      if(response.status === 401){
        //Not a customer, so try the staff login before showing an error
        const isStaff = await staffLogIn();
        if(isStaff){
          return;
        }
        setErrorMessage("Invalid username or password.");
      }else if(!response.ok){
        setErrorMessage(data.message || "Unable to log in. Please try again.");
      } else if (!data.customer || !data.customer.customerID ||
                 typeof data.customer.firstName !== "string") {
        setErrorMessage("The server did not confirm your account. Please try again.");
      } else if (saveCustomer(data.customer)) {
        navigate(next, { replace: true });
        return;
      } else {
        setErrorMessage("Unable to save this login in your browser. Allow site storage and try again.");
      }
    } catch {
      setErrorMessage("Unable to reach the login server. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#fafaf5] px-4 py-8 text-gray-900 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <a href="/" aria-label="SaveSo home" className="mx-auto mb-6 flex w-fit items-center gap-3">
          <img src="/SaveSolLogo.png" alt="" className="h-16 w-16 object-contain" />
          <span className="text-4xl font-extralight">SaveSo</span>
        </a>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-wrap! text-3xl font-light">Log in</h1>

          <form onSubmit={logIn} className="mt-6 space-y-5" aria-busy={isSubmitting}>
            <div>
              <label htmlFor="customer-username" className="mb-2 block text-sm font-medium">Username</label>
              <input id="customer-username" name="username" value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={30} autoComplete="username" autoCapitalize="none"
                spellCheck={false} autoFocus required disabled={isSubmitting} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="customer-password" className="mb-2 block text-sm font-medium">Password</label>
              <input id="customer-password" name="password" type="password" value={password}
                onChange={(event) => setPassword(event.target.value)}
                maxLength={128} autoComplete="current-password"
                required disabled={isSubmitting} className={inputStyle} />
            </div>

            {errorMessage && <p role="alert" className="text-wrap! rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
            <button type="submit" disabled={isSubmitting}
              className="min-h-11 w-full rounded-lg bg-green-800 px-4 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-60">
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-wrap! text-center text-sm">
            New to SaveSo? <Link to={customerFormUrl("/customer/signup", next)} className="font-medium text-green-900 underline">Create an account</Link>
          </p>
        </section>

        <p className="mt-5 text-center text-sm">
          <a href="/" className="inline-flex min-h-11 items-center text-green-900 underline">Back to Online Store</a>
        </p>
      </div>
    </main>
  );
}

export default CustomerLoginPage;
