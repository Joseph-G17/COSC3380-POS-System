// Use one key so this tab's cart does not overwrite other saved page data.
const CART_STORAGE_KEY = "saveso.cart.v1";

// Restore this tab's cart after refresh. Browser storage is not the database.
export function loadCartItems() {
  try {
    const savedText = window.sessionStorage.getItem(CART_STORAGE_KEY);
    if (savedText === null) {
      return [];
    }

    // Check saved rows before using their IDs, prices or quantities.
    const savedItems = JSON.parse(savedText);
    // Ignore a saved value that is not an array.
    if (!Array.isArray(savedItems)) {
      return [];
    }

    const validItems = [];
    const seenIDs = [];
    for (let i = 0; i < savedItems.length; i++) {
      const item = savedItems[i];
      if (item === null || typeof item !== "object" || Array.isArray(item)) {
        continue;
      }

      const itemID = Number(item.ItemID);
      const price = Number(item.ItemPrice);
      const quantity = item.quantity;
      if (
        !Number.isSafeInteger(itemID) || itemID < 1 ||
        typeof item.ItemName !== "string" || item.ItemName.trim() === "" ||
        (typeof item.ItemPrice !== "number" && typeof item.ItemPrice !== "string") ||
        String(item.ItemPrice).trim() === "" || !Number.isFinite(price) || price < 0 ||
        !Number.isSafeInteger(quantity) || quantity < 1 ||
        !Number.isSafeInteger(Math.round(price * 100) * quantity) ||
        seenIDs.includes(itemID)
      ) {
        continue;
      }

      seenIDs.push(itemID);
      // Keep valid, unique rows and copy their checked values.
      validItems.push({ ...item, ItemID: itemID, ItemPrice: price, quantity });
    }
    return validItems;
  } catch {
    // Invalid JSON or blocked browser storage must not prevent the shop from opening.
    return [];
  }
}

// Save after React applies an Add, Minus or Clear cart update.
export function saveCartItems(items) {
  try {
    // Saving [] also clears a previously full cart.
    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // If storage is blocked, the current cart still works until the page reloads.
  }
}
