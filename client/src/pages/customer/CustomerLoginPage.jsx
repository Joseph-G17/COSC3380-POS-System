import { useState } from "react";

const inputStyle = "w-full rounded-lg border border-gray-400 px-3 py-3 focus:outline-green-800 disabled:bg-gray-100";

function CustomerLoginPage() {
  // The inputs send their current values here; React displays each new value.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Keep the reply message and waiting state separate from the form values.
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The form calls this after the browser accepts its required fields.
  async function logIn(event) {
    // Handle the reply here instead of letting the form reload the page.
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Send the form to the customer API. The server checks the password.
      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });
      // The API returns a customer on success or a message explaining the failure.
      const data = await response.json();

      // Stay on this form unless the reply confirms a customer ID and first name.
      if (!response.ok) {
        setErrorMessage(data.message || "Unable to log in. Please try again.");
      } else if (!data.customer || !data.customer.customerID ||
                 typeof data.customer.firstName !== "string") {
        setErrorMessage("The server did not confirm your account. Please try again.");
      } else {
        try {
          // This demo hint displays a greeting. It never authorizes an API request.
          sessionStorage.setItem("saveso.customer", JSON.stringify({
            customerID: data.customer.customerID,
            firstName: data.customer.firstName,
          }));
        } catch {
          // The account check succeeded even if browser storage is blocked.
        }
        // Reopen the store so Navbar reads the display hint. No password is saved here.
        window.location.href = "/";
        return;
      }
    } catch {
      setErrorMessage("Unable to reach the login server. Please try again.");
    }
    // A failed attempt enables the form again so the customer can correct it.
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
          <h1 className="whitespace-normal [text-wrap:wrap] text-3xl font-light">Customer login</h1>
          <p className="mt-2 whitespace-normal [text-wrap:wrap] text-sm text-gray-600">Log in to your SaveSo customer account.</p>

          {/* Each input updates its matching state value; submit sends those values to the API. */}
          <form onSubmit={logIn} className="mt-6 space-y-5" aria-busy={isSubmitting}>
            <div>
              <label htmlFor="customer-username" className="mb-2 block text-sm font-medium">Username</label>
              <input id="customer-username" name="username" value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3} maxLength={30} autoComplete="username" autoCapitalize="none"
                spellCheck={false} autoFocus required disabled={isSubmitting} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="customer-password" className="mb-2 block text-sm font-medium">Password</label>
              <input id="customer-password" name="password" type="password" value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8} maxLength={128} autoComplete="current-password"
                required disabled={isSubmitting} className={inputStyle} />
            </div>

            {errorMessage && <p role="alert" className="whitespace-normal [text-wrap:wrap] rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
            <button type="submit" disabled={isSubmitting}
              className="min-h-11 w-full rounded-lg bg-green-800 px-4 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-60">
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-5 whitespace-normal [text-wrap:wrap] text-center text-sm">
            New to SaveSo? <a href="/customer/signup" className="font-medium text-green-900 underline">Create an account</a>
          </p>
          {/* Staff use the existing employee login page instead of this customer flow. */}
          <p className="mt-6 border-t border-gray-200 pt-5 text-center text-sm">
            <a href="/login" className="inline-flex min-h-11 items-center text-gray-700 underline">Log in as staff member</a>
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
