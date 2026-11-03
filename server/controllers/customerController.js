const Customers = require('../models/customerModel');

// The signup form sends account fields here through POST /api/customer/signup.
// This demo checks credentials only; protected APIs will need server sessions later.
async function signupCustomer(req, res) {
  try {
    const body = await readJsonBody(req);
    const fields = signupFields(body);
    const customer = await Customers.createCustomer(fields);
    sendJson(res, 201, { customer: publicCustomer(customer) });
  } catch (error) {
    sendError(res, error);
  }
}

// The login form sends a username and password; read the account, then compare them.
// Customer Logins stays separate from Joseph's staff login.
async function loginCustomer(req, res) {
  try {
    const body = await readJsonBody(req);
    const fields = loginFields(body, false);
    const customer = await Customers.findCustomerLogin(fields.username);
    if (!customer || fields.password !== customer.storedPassword) {
      throw requestError(401, 'Invalid username or password.');
    }
    sendJson(res, 200, { customer: publicCustomer(customer) });
  } catch (error) {
    sendError(res, error);
  }
}

// Send only these public fields, never the password or input-only fields.
function publicCustomer(customer) {
  return {
    customerID: customer.customerID,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    username: customer.username,
    membershipExpirationDate: customer.membershipExpirationDate,
  };
}

// Both handlers send a status and JSON for the form to read; account replies are not cached.
function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(body));
}

// Validation helpers attach a status so sendError can return the right form message.
function requestError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Expected input and duplicate-account errors get messages the form can show.
function sendError(res, error) {
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return sendJson(res, error.status, { message: error.message });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return sendJson(res, 409, { message: 'Username or email is already in use.' });
  }
  // Keep SQL text and passwords out of replies and logs.
  console.error('Customer account request failed:', error.code || error.name || 'UnknownError');
  sendJson(res, 500, { message: 'Unable to complete the request. Please try again.' });
}

// Accept a JSON form body and resolve it after Node has received all its parts.
function readJsonBody(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') {
    throw requestError(403, 'Use the store website to submit this request.');
  }
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
    throw requestError(415, 'Send the request as application/json.');
  }
  return new Promise((resolve, reject) => {
    let text = '';
    req.setEncoding('utf8');
    // Node calls this for each part of the body; collect at most 16 KB.
    req.on('data', (chunk) => {
      if (text === null) return;
      if (Buffer.byteLength(text) + Buffer.byteLength(chunk) > 16 * 1024) {
        // null tells later data/end callbacks that this request was already rejected.
        text = null;
        reject(requestError(413, 'The request is too large.'));
        return;
      }
      text += chunk;
    });
    // Once the body is complete, give its object to signup/login or reject invalid JSON.
    req.on('end', () => {
      if (text === null) return;
      try {
        const body = JSON.parse(text);
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
        resolve(body);
      } catch {
        reject(requestError(400, 'Send a valid JSON object.'));
      }
    });
    req.on('aborted', () => reject(requestError(400, 'The request was interrupted.')));
    req.on('error', () => reject(requestError(400, 'Unable to read the request.')));
  });
}

// Field checks use this to require a string, trim its edges and limit its length.
function limitedText(body, name, label, maximum) {
  let value = '';
  if (typeof body[name] === 'string') value = body[name].trim();
  if (!value || value.length > maximum) {
    throw requestError(400, `${label} must contain 1 to ${maximum} characters.`);
  }
  return value;
}

// Both forms use these fields; a new signup has stricter username/password rules.
function loginFields(body, signup) {
  const username = limitedText(body, 'username', 'Username', 30);
  if (signup && !/^[A-Za-z0-9._-]{3,30}$/.test(username)) {
    throw requestError(400, 'Username must contain 3 to 30 letters, numbers, dots, underscores or hyphens.');
  }
  // Spaces at the ends are part of a password, so do not trim it.
  if (typeof body.password !== 'string' || body.password.length > 128 ||
      body.password.length < (signup ? 8 : 1)) {
    throw requestError(400, signup ? 'Password must contain 8 to 128 characters.' : 'Password is required.');
  }
  return { username, password: body.password };
}

// Keep only the signup inputs needed by Customers and Customer Logins.
function signupFields(body) {
  const fields = loginFields(body, true);
  fields.firstName = limitedText(body, 'firstName', 'First name', 30);
  fields.lastName = limitedText(body, 'lastName', 'Last name', 30);
  fields.email = limitedText(body, 'email', 'Email', 255).toLowerCase();
  fields.phoneNumber = limitedText(body, 'phoneNumber', 'Phone number', 10);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    throw requestError(400, 'Enter a valid email address.');
  }
  if (!/^[0-9]{10}$/.test(fields.phoneNumber)) {
    throw requestError(400, 'Phone number must contain exactly 10 digits.');
  }
  return fields;
}

module.exports = { signupCustomer, loginCustomer };
