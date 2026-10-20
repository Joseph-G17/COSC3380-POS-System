// useState lets this component remember whether categories are open or closed.
import { useState } from "react";

const Sidebar = () => {
  // Start closed. sidebarOpen is the current value; setSidebarOpen changes it.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Keep this column from being squeezed by the product area beside it.
    <div className="shrink-0">
      {/* Keep the button outside the panel so it is still visible when closed. */}
      {/* Clicking runs the arrow function. ! changes false to true, or true to false. */}
      {/* aria-expanded reports the state; aria-controls points to the panel's id. */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-controls="customer-categories"
        className="m-2 rounded-lg border border-[#5FA37A] bg-[#97C1A9] px-3 py-2"
      >
        ☰ Shop
      </button>

      {/* condition ? valueIfTrue : valueIfFalse chooses the panel's width. */}
      {/* w-56 opens it; w-0 closes it. overflow-hidden clips the content inside. */}
      {/* The width changes over 300ms; reduced-motion settings turn animation off. */}
      {/* This panel stays in the layout, so its width pushes the products aside. */}
      {/* inert blocks clicks and keyboard focus inside the closed panel. */}
      <div
        id="customer-categories"
        className={
          sidebarOpen
            ? "w-56 overflow-hidden transition-all duration-300 motion-reduce:transition-none"
            : "w-0 overflow-hidden transition-all duration-300 motion-reduce:transition-none"
        }
        inert={!sidebarOpen}
      >
        {/* Keep the inside at w-56 while the outside opens/closes around it. */}
        {/* border-r draws the right border; p-4 adds space inside. */}
        <aside className="w-56 border-r p-4" aria-label="Product categories">
          <h2>Categories</h2>
          {/* Category filtering is not connected yet. */}
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-gray-100 px-3 py-2 text-left"
          >
            All Products
          </button>
        </aside>
      </div>
    </div>
  );
};

// Let OnlineStoreLayout import and display this component.
export default Sidebar;
