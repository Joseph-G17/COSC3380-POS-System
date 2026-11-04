const { createHmac, randomBytes, timingSafeEqual } = require('node:crypto');
const path = require('node:path');

const tokenLifetimeSeconds = 2 * 60 * 60;
let localSecret;

function checkoutSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (secret !== undefined) return Buffer.byteLength(secret.trim(), 'utf8') >= 32 ? secret : null;

  // Local npm start/dev launches server.js directly. Its checkout tokens last only for this process.
  const directRun = require.main?.filename === path.join(__dirname, 'server.js');
  const devMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  if (!directRun || !devMode || process.env.VERCEL !== undefined || process.env.VERCEL_ENV !== undefined) return null;
  if (!localSecret) localSecret = randomBytes(32);
  return localSecret;
}

function signature(payload, secret) {
  return createHmac('sha256', secret).update('customer-checkout-v1:' + payload).digest();
}

// Only the server can sign the customer ID and expiration after a successful login or signup.
function issueCustomerToken(customerID) {
  const secret = checkoutSecret();
  if (!secret) return null;
  const id = Number(customerID);
  // MySQL can return an ID as text. Never sign an ID that JavaScript rounded.
  if (!Number.isSafeInteger(id) || id <= 0 || String(id) !== String(customerID)) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + tokenLifetimeSeconds;
  const payload = id + '.' + expiresAt;
  return payload + '.' + signature(payload, secret).toString('hex');
}

function checkoutError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Orders take the ID from the signed token, even if the browser sends a different ID in its cart.
function requireCustomerID(req) {
  const secret = checkoutSecret();
  if (!secret) throw checkoutError(503, 'Online checkout is temporarily unavailable.');
  const header = req.headers.authorization || '';
  const match = /^Bearer ([1-9]\d{0,15})\.([1-9]\d{0,10})\.([0-9a-f]{64})$/i.exec(header);
  if (match) {
    const id = Number(match[1]);
    const expiresAt = Number(match[2]);
    const expected = signature(match[1] + '.' + match[2], secret);
    if (Number.isSafeInteger(id) && expiresAt > Math.floor(Date.now() / 1000) &&
        timingSafeEqual(expected, Buffer.from(match[3], 'hex'))) return id;
  }
  throw checkoutError(401, 'Please log in again to place your order.');
}

module.exports = { issueCustomerToken, requireCustomerID };
