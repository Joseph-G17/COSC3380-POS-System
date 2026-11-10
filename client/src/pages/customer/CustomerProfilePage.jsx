import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { loadCustomer, saveCustomer } from "./customerSession";
import CustomerOrderHistory from "./CustomerOrderHistory";

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState(loadCustomer());
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  if (!customer) return <Navigate to="/customer/login?next=/customer/profile" replace />;

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  const details = [
    ["Name", name],
    ["Email", customer.email],
    ["Phone number", customer.phoneNumber],
    ["Username", customer.username],
    ["Membership expires", customer.membershipExpirationDate?.slice(0, 10)],
  ];

  //Fill the form with the current info, then open it
  function startEdit(){
    setFirstName(customer.firstName || "");
    setLastName(customer.lastName || "");
    setEmail(customer.email || "");
    setPhoneNumber(customer.phoneNumber || "");
    setUsername(customer.username || "");
    setError("");
    setEditing(true);
  }

  //Send the new info to the server, then save the updated customer in this tab
  async function handleSave(event){
    event.preventDefault();
    setError("");
    try{
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.customerID, firstName, lastName, email, phoneNumber, username }),
      });
      const result = await response.json();
      if(!response.ok){
        setError(result.message);
        return;
      }
      saveCustomer(result.customer);
      setCustomer(loadCustomer());
      setEditing(false);
    }catch{
      setError("We couldn't reach the store. Check your connection and try again.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 text-gray-900">
      <Link to="/" className="text-sm text-green-900 underline">Back to store</Link>
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
        <h1 className="text-3xl">My profile</h1>
        <dl className="mt-5 divide-y divide-gray-200">
          {details.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <dt className="text-gray-600">{label}</dt>
              <dd className="min-w-0 text-wrap! wrap-anywhere">{value || "Unavailable"}</dd>
            </div>
          ))}
        </dl>
        {!editing && (
          <button type="button" onClick={startEdit} className="mt-4 min-h-11 rounded border px-4 py-2">Edit profile</button>
        )}
        {editing && (
          <form onSubmit={handleSave} className="mt-4 grid gap-3">
            <label className="block">
              First name
              <input type="text" maxLength={30} value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-1 block min-h-11 w-full rounded border px-3 py-2" />
            </label>
            <label className="block">
              Last name
              <input type="text" maxLength={30} value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-1 block min-h-11 w-full rounded border px-3 py-2" />
            </label>
            <label className="block">
              Email
              <input type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 block min-h-11 w-full rounded border px-3 py-2" />
            </label>
            <label className="block">
              Phone number
              <input type="tel" maxLength={10} value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="mt-1 block min-h-11 w-full rounded border px-3 py-2" />
            </label>
            <label className="block">
              Username
              <input type="text" maxLength={30} value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 block min-h-11 w-full rounded border px-3 py-2" />
            </label>
            {error && (
              <p className="text-red-700" role="alert">{error}</p>
            )}
            <button type="submit" className="min-h-11 rounded border px-4 py-2">Save changes</button>
            <button type="button" onClick={() => setEditing(false)} className="min-h-11 rounded border px-4 py-2">Cancel</button>
          </form>
        )}
        {/* Older logins only saved the customer's first name and ID. */}
        {!customer.username && (
          <p className="mt-4 text-sm text-wrap!">
            <Link to="/customer/login?next=/customer/profile" className="text-green-900 underline">Log in again</Link>
            {" "}to load the rest of your profile.
          </p>
        )}
      </section>
      <CustomerOrderHistory key={customer.customerID} customerId={customer.customerID} />
    </main>
  );
}
