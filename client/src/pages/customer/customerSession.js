const customerKey = "saveso.customer";

// Keep only the fields used to display this customer's account in this tab.
function profileFields(customer) {
  if (!customer || typeof customer.firstName !== "string") return null;
  let id = customer.customerID;
  if (typeof id === "string" && /^\d+$/.test(id)) id = Number(id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const profile = { customerID: id, firstName: customer.firstName };
  for (const field of ["lastName", "email", "username", "membershipExpirationDate", "phoneNumber"]) {
    if (typeof customer[field] === "string") profile[field] = customer[field];
  }
  return profile;
}

export function loadCustomer() {
  try {
    return profileFields(JSON.parse(sessionStorage.getItem(customerKey)));
  } catch {
    return null;
  }
}

// Checkout and order history send this saved customer ID to the server.
export function saveCustomer(customer) {
  const profile = profileFields(customer);
  if (!profile) return false;
  try {
    sessionStorage.setItem(customerKey, JSON.stringify(profile));
    //Tell the navbar that the saved customer changed
    window.dispatchEvent(new Event("saveso-customer-change"));
    return true;
  } catch {
    return false;
  }
}

export function clearCustomer() {
  try {
    sessionStorage.removeItem(customerKey);
  } catch {
    // The store can still clear its cart and greeting when storage is blocked.
  }
}

// Only these pages can ask the form to return a customer after sign-in.
export function customerReturnPath(path) {
  if (path === "/checkout" || path === "/customer/profile") return path;
  return "/";
}

export function customerFormUrl(formPath, nextPath) {
  const next = customerReturnPath(nextPath);
  return next === "/" ? formPath : formPath + "?next=" + next;
}
