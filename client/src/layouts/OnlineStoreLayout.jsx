import AnnouncementBar from "../components/onlinestore/AnnouncementBar";
import Navbar from "../components/onlinestore/Navbar";
import Cart from "../components/onlinestore/Cart";
import { useEffect, useState } from "react";
import {
  loadCartItems,
  saveCartItems,
} from "../components/onlinestore/cartStorage";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const OnlineStoreLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  // Restore the saved cart before the first save so refresh does not replace it with [].
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [products, setProducts] = useState(null);
  const [productsError, setProductsError] = useState("");
  const [stockVersion, setStockVersion] = useState(0);

  function refreshStock() {
    setStockVersion(version => version + 1);
  }

  // The shop and cart use the same stock, including after a refresh on Checkout.
  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setProducts(null);
      setProductsError("");
      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        const rows = await response.json();
        if (!response.ok || !Array.isArray(rows)) {
          throw new Error("Unable to load products");
        }
        if (!controller.signal.aborted) setProducts(rows);
      } catch {
        if (!controller.signal.aborted) setProductsError("Unable to load products. Please try again");
      }
    }
    loadProducts();
    return () => controller.abort();
  }, [location.pathname, stockVersion]);

  useEffect(
    function () {
      saveCartItems(cartItems);
    },
    [cartItems],
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  // The badge counts units, so two cartons of milk count as two.
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

  function toggleCategory(categoryID) {
    const id = String(categoryID);
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

  function clearCategories() {
    setSelectedCategoryIds([]);
  }

  const stockById = new Map();
  for (const product of products ?? []) {
    const stock = Number(product.Stock);
    if (product.Stock != null && String(product.Stock).trim() !== "" && Number.isSafeInteger(stock) && stock >= 0) {
      stockById.set(Number(product.ItemID), stock);
    }
  }

  function canAddOne(itemID, items = cartItems) {
    const id = Number(itemID);
    const stock = stockById.get(id);
    if (stock === undefined) return false;

    let quantityInCart = 0;
    for (const item of items) {
      if (Number(item.ItemID) === id) {
        quantityInCart = item.quantity ?? 0;
        break;
      }
    }
    return quantityInCart + 1 <= stock;
  }

  function addToCart(product) {
    const id = Number(product.ItemID);
    setCartItems(function (currentItems) {
      // Check the latest quantity again in case two clicks arrived together.
      if (!canAddOne(id, currentItems)) return currentItems;
      const index = currentItems.findIndex(item => Number(item.ItemID) === id);
      if (index === -1) return [...currentItems, { ...product, ItemID: id, quantity: 1 }];

      const updatedItems = [...currentItems];
      updatedItems[index] = { ...currentItems[index], quantity: currentItems[index].quantity + 1 };
      return updatedItems;
    });
  }

  function clearCart() {
    setCartItems([]);
  }

  // A customer may keep shopping while waiting for the order receipt.
  function removePurchasedItems(purchased) {
    const quantities = new Map(purchased.map(item => [item.itemId, item.quantity]));
    setCartItems(items => items.map(item => ({
      ...item, quantity: item.quantity - (quantities.get(Number(item.ItemID)) ?? 0),
    })).filter(item => item.quantity > 0));
  }

  function removeCartRow(itemID) {
    setCartItems(items => items.filter(item => item.ItemID !== itemID));
  }

  function deleteCartItem(itemID) {
    setCartItems(function (currentItems) {
      const updateItems = [];

      for (let i = 0; i < currentItems.length; i++) {
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

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }
  function openCheckout() {
    if (cartItems.length === 0) {
      return;
    }
    setIsCartOpen(false);
    navigate("/checkout");
  }

  return (
    <div>
      <AnnouncementBar />
      <Navbar
        totalItemsQuantity={totalQuantity}
        onOpenCart={openCart}
        isCartOpen={isCartOpen}
        searchText={searchText}
        onSearchChange={changeSearchText}
        onClearCart={clearCart}
      />

      <Outlet
        context={{
          cartItems,
          products,
          productsError,
          canAddOne,
          addToCart,
          deleteCartItem,
          removeCartRow,
          stockById,
          refreshStock,
          removePurchasedItems,
          totalQuantity,
          searchText,
          selectedCategoryIds,
          toggleCategory,
          clearCategories,
        }}
      />
      <Cart
        items={cartItems}
        canAddOne={canAddOne}
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
