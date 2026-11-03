import AnnouncementBar from "../components/onlinestore/AnnouncementBar";
import Navbar from "../components/onlinestore/Navbar";
import Cart from "../components/onlinestore/Cart";
import { useEffect, useState } from "react";
import {
  loadCartItems,
  saveCartItems,
} from "../components/onlinestore/cartStorage";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// Layout owns the cart and filters shared by shop and checkout.
const OnlineStoreLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Navbar changes the search; Sidebar changes the selected category IDs.
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  // Restore the saved cart before the first save so refresh does not replace it with [].
  const [cartItems, setCartItems] = useState(loadCartItems);
  // Save the current cart whenever its array changes.
  useEffect(
    function () {
      saveCartItems(cartItems);
    },
    [cartItems],
  );
  // Panel visibility is separate from the saved cart rows.
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Count units, not rows: Milk x2 + Apple x3 gives a total of 5.
  let totalQuantity = 0;
  for (let i = 0; i < cartItems.length; i++) {
    totalQuantity += cartItems[i].quantity;
  }
  // Navbar sends each typed value here; open the shop when searching from Checkout.
  function changeSearchText(value) {
    setSearchText(value);
    if (location.pathname !== "/") {
      navigate("/");
    }
  }

  // Sidebar sends one category ID; React supplies the previous checkbox selection.
  function toggleCategory(categoryID) {
    const id = String(categoryID);
    // Return the next checked-ID list to React without changing the old list.
    setSelectedCategoryIds(function (currentIds) {
      const updatedIds = [];
      let wasSelected = false;
      for (let i = 0; i < currentIds.length; i++) {
        if (currentIds[i] === id) {
          wasSelected = true;
        } else {
          updatedIds.push(currentIds[i]);
        }
      }
      if (!wasSelected) {
        updatedIds.push(id);
      }
      return updatedIds;
    });
  }

  // Sidebar calls this to show every category while keeping the name search.
  function clearCategories() {
    setSelectedCategoryIds([]);
  }

  // ProductList calls this on Add and sends the selected product object.
  function addToCart(product) {
    // A new cart row starts with one unit.
    const newItem = { ...product, quantity: 1 };

    // React supplies the old cart; return a new array without changing the old objects.
    setCartItems(function (currentItems) {
      const updatedItems = [...currentItems];

      // Search the cart for this product before adding a new row.
      for (let i = 0; i < updatedItems.length; i++) {
        // An existing product gains one unit instead of creating a duplicate row.
        if (updatedItems[i].ItemID === product.ItemID) {
          updatedItems[i] = {
            ...updatedItems[i],
            quantity: updatedItems[i].quantity + 1,
          };
          return updatedItems;
        }
      }
      // No ID matched, so append the new product to the cart.
      return [...updatedItems, newItem];
    });
  }

  // Clear Cart removes every item from the frontend cart.
  function clearCart() {
    setCartItems([]);
  }

  // Minus removes one unit; the last unit removes the row.
  function deleteCartItem(itemID) {
    setCartItems(function (currentItems) {
      const updateItems = [];

      for (let i = 0; i < currentItems.length; i++) {
        // Keep other products; reduce this row or omit it when its last unit is removed.
        if (currentItems[i].ItemID !== itemID) {
          updateItems.push(currentItems[i]);
        } else if (currentItems[i].quantity > 1) {
          updateItems.push({
            ...currentItems[i],
            quantity: currentItems[i].quantity - 1,
          });
        }
      }
      return updateItems;
    });
  }

  // Navbar calls this when the customer opens the cart.
  function openCart() {
    setIsCartOpen(true);
  }

  // Close and Escape hide the cart without removing its items.
  function closeCart() {
    setIsCartOpen(false);
  }
  // Checkout closes the panel and opens the summary with the same cart.
  function openCheckout() {
    if (cartItems.length === 0) {
      return;
    }
    setIsCartOpen(false);
    navigate("/checkout");
  }

  return (
    <div>
      {/* The bar reads campaigns and hides itself when none are active. */}
      <AnnouncementBar />
      <Navbar
        totalItemsQuantity={totalQuantity}
        onOpenCart={openCart}
        isCartOpen={isCartOpen}
        searchText={searchText}
        onSearchChange={changeSearchText}
      />

      {/* Child pages share the cart, search text and category actions. */}
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
      <Cart
        items={cartItems}
        onAddToCart={addToCart}
        onClearCart={clearCart}
        onDeleteCartItem={deleteCartItem}
        isCartOpen={isCartOpen}
        onCloseCart={closeCart}
        onCheckout={openCheckout}
      />
    </div>
  );
};

export default OnlineStoreLayout;
