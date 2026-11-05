const { createOrder } = require('../models/itemModel');
const { getCustomerOrderHistory } = require('../models/customerModel');
const { readJsonBody, sendJson } = require('./customerController');

// The team assigned employee 1 to online orders.
const onlineEmployeeId = 1;

// Turn the customer ID from the browser into a whole number, or null if it is not valid.
function readCustomerId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    return null;
  }
  return id;
}

// GET /api/customer/orders?customerId=5
// The profile page sends the ID it saved at login and gets that customer's orders back.
async function getOrderHistory(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const customerId = readCustomerId(url.searchParams.get('customerId'));
    if (customerId === null) {
      return sendJson(res, 400, { message: 'Log in to view your orders.' });
    }
    const orders = await getCustomerOrderHistory(customerId);
    return sendJson(res, 200, { orders: orders });
  } catch (error) {
    console.error('Order history failed:', error.code || error.name);
    return sendJson(res, 500, { message: 'Unable to load your orders right now. Please try again.' });
  }
}

// POST /api/customer/orders
// The checkout page sends the customer ID, pickup or delivery, and the cart items.
async function placeOnlineOrder(req, res) {
  try {
    const body = await readJsonBody(req);
    const customerId = readCustomerId(body.customerId);
    const orderType = body.orderType;
    const items = body.items;

    if (customerId === null) {
      return sendJson(res, 400, { message: 'Log in to place your order.' });
    }
    if (orderType !== 'Pickup' && orderType !== 'Delivery') {
      return sendJson(res, 400, { message: 'Choose pickup or delivery.' });
    }

    // Only delivery orders keep an address.
    let deliveryAddress = null;
    if (orderType === 'Delivery') {
      if (typeof body.deliveryAddress === 'string') {
        deliveryAddress = body.deliveryAddress.trim();
      }
      if (!deliveryAddress || deliveryAddress.length > 255) {
        return sendJson(res, 400, { message: 'Enter a delivery address of up to 255 characters.' });
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return sendJson(res, 400, { message: 'Your cart is empty.' });
    }
    for (const item of items) {
      if (!Number.isSafeInteger(item.itemId) || item.itemId < 1 ||
          !Number.isInteger(item.quantity) || item.quantity < 1) {
        return sendJson(res, 400, { message: 'Each item needs a valid ID and quantity.' });
      }
    }

    // Payment is only simulated, so online orders are saved as Card with no card digits.
    const receipt = await createOrder({
      employeeId: onlineEmployeeId,
      customerId: customerId,
      orderType: orderType,
      deliveryAddress: deliveryAddress,
      paymentMethod: 'Card',
      items: items,
    });
    return sendJson(res, 201, receipt);
  } catch (error) {
    // 4xx errors are the customer's to fix, like low stock. Anything else is a server problem.
    const status = error.statusCode || error.status || 500;
    if (status < 500) {
      return sendJson(res, status, { message: error.message });
    }
    console.error('Online order failed:', error.code || error.name);
    return sendJson(res, 500, { message: 'Unable to place your order. Please try again.' });
  }
}

module.exports = { getOrderHistory, placeOnlineOrder };