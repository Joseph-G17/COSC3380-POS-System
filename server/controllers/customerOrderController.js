const { getLatestCustomerOrderId, createOrder } = require('../models/itemModel');
const { requireCustomerID } = require('../customerCheckoutToken');
const { getCustomerOrderHistory } = require('../models/customerModel');
const { readJsonBody, sendJson } = require('./customerController');

// The team assigned employee 1 to online orders.
const onlineEmployeeId = 1;

function sendCheckoutError(res, error) {
  const status = error.statusCode || error.status;
  if ((status >= 400 && status < 500) || status === 503) {
    const body = { message: error.message };
    if (['ORDER_HISTORY_CHANGED', 'LEGACY_CHECKOUT_NOT_PLACED'].includes(error.code)) body.code = error.code;
    if (status === 503) body.code = 'CHECKOUT_UNAVAILABLE';
    return sendJson(res, status, body);
  }
  console.error('Online order failed:', error.code || error.name);
  return sendJson(res, 500, { message: 'Unable to confirm your order. Please retry the same cart.' });
}

async function getOrderHistory(req, res) {
  try {
    const customerId = requireCustomerID(req);
    const orders = await getCustomerOrderHistory(customerId);
    return sendJson(res, 200, { orders });
  } catch (error) {
    if (error.status === 401) {
      return sendJson(res, 401, { message: 'Please log in again to view your orders.' });
    }
    console.error('Order history failed:', error.code || error.name);
    return sendJson(res, error.status === 503 ? 503 : 500, {
      message: 'Unable to load your orders right now. Please try again.',
    });
  }
}

async function getCheckout(req, res) {
  try {
    const customerId = requireCustomerID(req);
    const previousOrderId = await getLatestCustomerOrderId(customerId);
    return sendJson(res, 200, { previousOrderId });
  } catch (error) {
    return sendCheckoutError(res, error);
  }
}

async function placeOnlineOrder(req, res) {
  try {
    const customerId = requireCustomerID(req);
    const body = await readJsonBody(req);
    const { items, paymentMethod, previousOrderId } = body;
    const fields = ['items', 'paymentMethod', 'previousOrderId', 'orderType', 'deliveryAddress'];
    if (Object.keys(body).some((key) => !fields.includes(key))) {
      return sendJson(res, 400, { message: 'Unexpected checkout fields. Use the demo checkout form.' });
    }
    // An older tab can look up its pickup receipt, but cannot submit another cash or card order.
    const reconcileOnly = body.orderType === undefined && body.deliveryAddress === undefined &&
      ['Cash', 'Card'].includes(paymentMethod);
    const orderType = reconcileOnly ? 'Pickup' : body.orderType;
    if (!reconcileOnly && (paymentMethod !== 'Demo' || !['Pickup', 'Delivery'].includes(orderType))) {
      return sendJson(res, 400, { message: 'Choose pickup or delivery and use demo payment.' });
    }
    let deliveryAddress = null;
    if (orderType === 'Delivery') {
      deliveryAddress = typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() : '';
      if (!deliveryAddress || deliveryAddress.length > 255) {
        return sendJson(res, 400, { message: 'Enter a delivery address of up to 255 characters.' });
      }
    } else if (body.deliveryAddress != null) {
      return sendJson(res, 400, { message: 'Only delivery orders can include an address.' });
    }
    if (!Number.isSafeInteger(previousOrderId) || previousOrderId < 0 ||
        !Array.isArray(items) || !items.length) {
      return sendJson(res, 400, { message: 'Review your cart and try again.' });
    }

    const ids = new Set();
    for (const item of items) {
      if (!Number.isSafeInteger(item?.itemId) || item.itemId < 1 || ids.has(item.itemId) ||
          !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 65535 ||
          Object.keys(item).some((key) => key !== 'itemId' && key !== 'quantity')) {
        return sendJson(res, 400, { message: 'Each item needs one valid ID and a positive whole quantity.' });
      }
      ids.add(item.itemId);
    }

    const receipt = await createOrder({
      employeeId: onlineEmployeeId, orderType, deliveryAddress, customerId, items,
      paymentMethod, previousOrderId, reconcileOnly,
    });
    return sendJson(res, reconcileOnly ? 200 : 201, receipt);
  } catch (error) {
    return sendCheckoutError(res, error);
  }
}

module.exports = { getCheckout, getOrderHistory, placeOnlineOrder };
