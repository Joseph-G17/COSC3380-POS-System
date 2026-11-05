import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { customerFormUrl, customerReturnPath, saveCustomer } from "./customerSession";

const inputStyle = "w-full rounded-lg border border-gray-400 px-3 py-3 focus:outline-green-800 disabled:bg-gray-100";

function CustomerSignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = customerReturnPath(params.get("next"));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createAccount(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");

    // Confirm the password here. The API only needs one copy.
    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/customer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phoneNumber: phoneNumber,
          username: username,
          password: password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Unable to create your account. Please try again.");
      } else if (!data.customer || !data.customer.customerID ||
                 typeof data.customer.firstName !== "string") {
        setErrorMessage("The server did not confirm your account. Please try again.");
      } else if (saveCustomer(data.customer)) {
        navigate(next, { replace: true });
        return;
      } else {
        setErrorMessage("Your account was created. Allow site storage, then use the Log in link below.");
      }
    } catch {
      setErrorMessage("Unable to reach the signup server. Please try again.");
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
          <h1 className="text-wrap! text-3xl font-light">Create your customer account</h1>
          <p className="mt-2 text-wrap! text-sm text-gray-600">Your new membership is valid for one year from registration.</p>

          <form onSubmit={createAccount} className="mt-6 space-y-5" aria-busy={isSubmitting}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="customer-firstName" className="mb-2 block text-sm font-medium">First name</label>
                <input id="customer-firstName" name="firstName" value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  maxLength={30} autoComplete="given-name" autoFocus required disabled={isSubmitting} className={inputStyle} />
              </div>
              <div>
                <label htmlFor="customer-lastName" className="mb-2 block text-sm font-medium">Last name</label>
                <input id="customer-lastName" name="lastName" value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  maxLength={30} autoComplete="family-name" required disabled={isSubmitting} className={inputStyle} />
              </div>
            </div>
            <div>
              <label htmlFor="customer-email" className="mb-2 block text-sm font-medium">Email</label>
              <input id="customer-email" name="email" type="email" value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={255} autoComplete="email" required disabled={isSubmitting} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="customer-phoneNumber" className="mb-2 block text-sm font-medium">Phone number (10 digits)</label>
              <input id="customer-phoneNumber" name="phoneNumber" type="tel" value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                minLength={10} maxLength={10} pattern="[0-9]{10}" inputMode="numeric"
                autoComplete="tel-national" required disabled={isSubmitting} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="customer-username" className="mb-2 block text-sm font-medium">Username</label>
              <input id="customer-username" name="username" value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3} maxLength={30} pattern={"[A-Za-z0-9._\\-]{3,30}"}
                title="Use 3 to 30 letters, numbers, dots, underscores or hyphens."
                autoComplete="username" autoCapitalize="none" spellCheck={false}
                required disabled={isSubmitting} className={inputStyle} />
            </div>
            <div>
              <label htmlFor="customer-password" className="mb-2 block text-sm font-medium">Password</label>
              <input id="customer-password" name="password" type="password" value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8} maxLength={128} autoComplete="new-password"
                required disabled={isSubmitting} className={inputStyle} />
              <p className="mt-2 text-wrap! text-xs text-gray-600">Use at least 8 characters for your password.</p>
            </div>
            <div>
              <label htmlFor="customer-confirmPassword" className="mb-2 block text-sm font-medium">Confirm password</label>
              <input id="customer-confirmPassword" name="confirmPassword" type="password" value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8} maxLength={128} autoComplete="new-password"
                required disabled={isSubmitting} className={inputStyle} />
            </div>

            {errorMessage && <p role="alert" className="text-wrap! rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
            <button type="submit" disabled={isSubmitting}
              className="min-h-11 w-full rounded-lg bg-green-800 px-4 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-60">
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-wrap! text-center text-sm">
            Already have a customer account? <Link to={customerFormUrl("/customer/login", next)} className="font-medium text-green-900 underline">Log in</Link>
          </p>
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

export default CustomerSignupPage;
