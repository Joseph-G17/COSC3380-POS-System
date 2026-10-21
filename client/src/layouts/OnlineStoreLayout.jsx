// Import the three components displayed on the customer page.
import Navbar from "../components/onlinestore/Navbar";
import Sidebar from "../components/onlinestore/Sidebar";
import ProductList from "../components/onlinestore/ProductList";

const OnlineStoreLayout = () => {
  return (
    <div>
      {/* Navbar stays above the sidebar and the product area. */}
      <Navbar />

      {/* flex places these two components beside each other. */}
      {/* items-start lines up their top edges. */}
      {/* Sidebar owns its open/closed state; this file only arranges components. */}
      <div className="flex items-start">
        <Sidebar />
        <ProductList />
      </div>
    </div>
  );
};

export default OnlineStoreLayout;
