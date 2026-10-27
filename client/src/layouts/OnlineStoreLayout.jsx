import AnnouncementBar from "../components/onlinestore/AnnouncementBar"; // Active seasonal sale names above the header.
import Navbar from "../components/onlinestore/Navbar"; // Search bar, cart button and account controls.
import Cart from "../components/onlinestore/Cart"; // Displays the cart and its controls.
import { useEffect, useState } from "react"; // State remembers the cart; an effect saves applied changes.
import {
  loadCartItems,
  saveCartItems,
} from "../components/onlinestore/cartStorage"; // Read and write this tab's cart.
import { Outlet, useLocation, useNavigate } from "react-router-dom"; // Show a child page and change its URL without reloading.

// This shared Layout stays mounted on the shop and checkout pages, keeping the same cart.
const OnlineStoreLayout = () => {
  const navigate = useNavigate(); // React Router supplies this function for changing pages.
  const location = useLocation(); // Read the current page before opening search results.
  const [searchText, setSearchText] = useState(""); // Shared by Navbar and the product list.
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // Empty means all categories.
  // Layout owns one cart so ProductList, Cart, Checkout and Navbar share the same items.
  // Pass the function without (): React calls it on the first render to restore this tab's cart.
  // Reading before the first save prevents an empty initial array from replacing saved items.
  const [cartItems, setCartItems] = useState(loadCartItems);
  // React runs this after the cart changes, including after Minus removes the last unit or Clear.
  useEffect(
    function () {
      saveCartItems(cartItems); // Save the latest array; Checkout derives its total from these rows.
    },
    [cartItems],
  ); // Run again only when React receives a different cartItems array.
  // false means initially closed; this setter changes visibility, separate from the items.
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Each time Layout runs, calculate the total from current items; no extra state is needed.
  let totalQuantity = 0;
  // Visit each cart row; i is its position in the array, starting at 0.
  for (let i = 0; i < cartItems.length; i++) {
    // Add quantities rather than count rows: Milk x2 + Apple x3 gives a total of 5.
    totalQuantity += cartItems[i].quantity;
  }
  // Navbar sends each typed value here; open the shop when searching from Checkout.
  function changeSearchText(value) {
    setSearchText(value); // React sends this value back to Navbar and the product filter.
    if (location.pathname !== "/") {
      // Results live on the shop page.
      navigate("/"); // Change the child page while keeping Layout and its cart.
    }
  }

  // Sidebar sends one category ID; React supplies the previous checkbox selection.
  function toggleCategory(categoryID) {
    const id = String(categoryID); // Compare checkbox IDs using the same text format.
    setSelectedCategoryIds(function (currentIds) {
      const updatedIds = []; // Build a replacement selection without changing the old array.
      let wasSelected = false; // Remember whether this click should remove an existing ID.
      for (let i = 0; i < currentIds.length; i++) {
        // Visit each currently selected checkbox ID.
        if (currentIds[i] === id) {
          wasSelected = true; // Skip this ID to uncheck it.
        } else {
          updatedIds.push(currentIds[i]); // Keep every other checked category.
        }
      }
      if (!wasSelected) {
        updatedIds.push(id); // An unchecked ID joins the selection.
      }
      return updatedIds; // React replaces selectedCategoryIds with this completed array.
    });
  }

  function clearCategories() {
    setSelectedCategoryIds([]); // All categories become available; search text stays unchanged.
  }

  // ProductList calls this on Add and sends the selected product object.
  function addToCart(product) {
    // ...product copies its fields into a new object; quantity: 1 is for a new cart item.
    // Fields stay at the same level: newItem.ItemName, newItem.ItemPrice, newItem.quantity.
    const newItem = { ...product, quantity: 1 };

    // React calls this function with the current cart; the returned array becomes the next cart.
    setCartItems(function (currentItems) {
      // Copy the entries into a new array so we do not directly change the old state array.
      // Entries still refer to old objects; we copy the selected object separately before changing it.
      const updatedItems = [...currentItems];

      // Search the existing cart rows for the selected product.
      for (let i = 0; i < updatedItems.length; i++) {
        // The same ItemID means the same product: increase its quantity instead of adding a duplicate row.
        if (updatedItems[i].ItemID === product.ItemID) {
          // Replace this row with a new object; leave other rows unchanged.
          updatedItems[i] = {
            ...updatedItems[i], // Copy the old fields: ID, name, price and other details.
            quantity: updatedItems[i].quantity + 1, // Replace quantity with the old quantity + 1.
          };
          // Return the updated array to React and stop this updater before the new-item step.
          return updatedItems;
        }
      }
      // Reach this only if no ID matched: keep old items and append newItem to a new array.
      return [...updatedItems, newItem];
    });
  }

  // Cart calls this on Clear Cart to remove every item from the frontend cart.
  function clearCart() {
    setCartItems([]); // React receives an empty array and redraws the list and icon count.
  }

  // Cart sends the clicked row's itemID; each Delete click removes one unit.
  function deleteCartItem(itemID) {
    // React provides the current cart so this function can build its replacement.
    setCartItems(function (currentItems) {
      const updateItems = []; // This new array will contain only the rows we keep.

      for (let i = 0; i < currentItems.length; i++) {
        // Visit each current cart row.
        // A different ID means this is another product: keep its row unchanged.
        if (currentItems[i].ItemID !== itemID) {
          updateItems.push(currentItems[i]); // push appends one entry to the new array.
        } else if (currentItems[i].quantity > 1) {
          // Selected product with more than 1 unit: keep it as a new object with quantity reduced by 1.
          updateItems.push({
            ...currentItems[i], // Keep product details without changing the old state object.
            quantity: currentItems[i].quantity - 1, // Subtract one unit from only the clicked product.
          });
        }
        // Selected product with only 1 unit: skip push, so this row is left out of the new cart.
      }
      return updateItems; // React uses this completed array as the new cartItems.
    });
  }

  // Navbar calls this on an icon click; true tells Cart it should open.
  function openCart() {
    setIsCartOpen(true); // React passes true to Cart so its panel slides into view.
  }

  // Cart calls this from Close or Escape; items stay in cartItems.
  function closeCart() {
    setIsCartOpen(false); // Hide the panel while keeping the cart array.
  }
  // Cart calls this on Checkout; close the panel and change page without clearing its items.
  function openCheckout() {
    if (cartItems.length === 0) {
      return; // An empty cart cannot continue through the cart's Checkout button.
    }
    setIsCartOpen(false);
    navigate("/checkout"); // The shared Layout stays mounted, so cartItems is unchanged.
  }

  // Return JSX for React to display; these props send data and functions from Layout to its children.
  return (
    <div>
      {/* The bar reads real campaigns and hides itself when none are active. */}
      <AnnouncementBar />
      {/* Navbar receives the current total and open function; pass the function so it waits for a click. */}
      <Navbar
        totalItemsQuantity={totalQuantity} // Badge receives the number of units, not the number of rows.
        onOpenCart={openCart} // Navbar calls this function only when the customer clicks its cart icon.
        isCartOpen={isCartOpen} // Navbar uses this flag for its expanded accessibility state.
        searchText={searchText} // Send the current input text back to the search field.
        onSearchChange={changeSearchText} // Navbar sends typed text to this Layout function.
      />

      {/* Child pages share cart data; the shop also receives current search and category actions. */}
      <Outlet
        context={{
          cartItems,
          addToCart,
          searchText,
          selectedCategoryIds,
          toggleCategory,
          clearCategories,
        }}
      />
      {/* items receives the cartItems array; Plus/minus/Clear actions call the functions held in Layout. */}
      {/* Cart uses the flag to slide and calls the supplied close action without clearing items. */}
      <Cart
        items={cartItems} // Cart reads this array to display its rows and total.
        onAddToCart={addToCart} // Plus sends its product back to the shared Add function.
        onClearCart={clearCart} // The trash button asks Layout to replace the cart with [].
        onDeleteCartItem={deleteCartItem} // Minus supplies the selected product ID.
        isCartOpen={isCartOpen} // Cart uses this flag to choose its slide position.
        onCloseCart={closeCart} // Close and Escape ask Layout to hide the panel.
        onCheckout={openCheckout} // Checkout opens the summary page using the same cart.
      />
    </div>
  );
};

export default OnlineStoreLayout; // Allow other files to import and use this Layout.
