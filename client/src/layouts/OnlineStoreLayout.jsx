// Import the three components displayed on the customer page.
import Navbar from "../components/onlinestore/Navbar";
import Sidebar from "../components/onlinestore/Sidebar";
import ProductList from "../components/onlinestore/ProductList";
import Cart from "../components/onlinestore/Cart";
import { useState } from "react";

function addToCart(product){
  console.log("Add to cart:", product);
}

const OnlineStoreLayout = () => {
  const [cartItems, setCartItems] = useState([]);
  return (
    <div>
      {/* Navbar stays above the sidebar and the product area. */}
      <Navbar />

      {/* flex places these two components beside each other. */}
      {/* items-start lines up their top edges. */}
      {/* Sidebar owns its open/closed state; this file only arranges components. */}
      <div className="flex items-start">
        <Sidebar />
        <ProductList onAddToCart={addToCart} />
      </div>
    </div>
  );
};

export default OnlineStoreLayout;
