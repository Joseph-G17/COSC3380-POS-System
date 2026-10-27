// Use one key so this tab's cart does not overwrite other saved page data.
const CART_STORAGE_KEY = "saveso.cart.v1";

// Layout calls this once when it first opens, including after F5 on Checkout.
export function loadCartItems() {
  try {
    // sessionStorage keeps this tab's data through refresh; it is not a database.
    const savedText = window.sessionStorage.getItem(CART_STORAGE_KEY);
    // No saved cart means the customer starts with an empty array.
    if (savedText === null) {
      return [];
    }

    // Storage holds text; JSON.parse turns that text back into JavaScript data.
    const savedItems = JSON.parse(savedText);
    // Cart code expects an array, so ignore a saved value of another type.
    if (!Array.isArray(savedItems)) {
      return [];
    }

    const validItems = []; // Build the rows that Layout can safely display and count.
    const seenIDs = []; // Keep each product only once, like the normal Add to Cart flow.
    for (let i = 0; i < savedItems.length; i++) {
      const item = savedItems[i]; // Read one saved row at its array position.
      if (item === null || typeof item !== "object" || Array.isArray(item)) {
        continue; // Skip a broken row and check the next one.
      }

      const itemID = Number(item.ItemID); // Restore a numeric ID for Add to Cart's comparison.
      const price = Number(item.ItemPrice); // MySQL prices may arrive as numbers or numeric text.
      const quantity = item.quantity; // Quantity must already be a whole number from our cart.
      if (
        !Number.isSafeInteger(itemID) || itemID < 1 ||
        typeof item.ItemName !== "string" || item.ItemName.trim() === "" ||
        (typeof item.ItemPrice !== "number" && typeof item.ItemPrice !== "string") ||
        String(item.ItemPrice).trim() === "" || !Number.isFinite(price) || price < 0 ||
        !Number.isSafeInteger(quantity) || quantity < 1 ||
        !Number.isSafeInteger(Math.round(price * 100) * quantity) ||
        seenIDs.includes(itemID)
      ) {
        continue; // Ignore invalid values or duplicate rows instead of breaking Checkout.
      }

      seenIDs.push(itemID); // Later rows with this same ID will be skipped.
      // Copy the product details, using the checked ID, price and quantity for this row.
      validItems.push({ ...item, ItemID: itemID, ItemPrice: price, quantity });
    }
    return validItems; // React uses this array as the initial cartItems state.
  } catch {
    // Invalid JSON or blocked browser storage must not prevent the shop from opening.
    return [];
  }
}

// Layout calls this after React has applied an Add, Minus or Clear cart update.
export function saveCartItems(items) {
  try {
    // JSON.stringify turns the array into text; [] also replaces a previously full cart.
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // If the browser blocks storage, the current cart still works until the page reloads.
  }
}
