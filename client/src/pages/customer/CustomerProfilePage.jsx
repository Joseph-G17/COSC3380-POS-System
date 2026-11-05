import { Link, Navigate } from "react-router-dom";
import { loadCustomer } from "./customerSession";
import CustomerOrderHistory from "./CustomerOrderHistory";

export default function CustomerProfilePage() {
  const customer = loadCustomer();
  if (!customer) return <Navigate to="/customer/login?next=/customer/profile" replace />;

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  const details = [
    ["Name", name],
    ["Username", customer.username],
    ["Email", customer.email],
    ["Membership expires", customer.membershipExpirationDate?.slice(0, 10)],
  ];

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
