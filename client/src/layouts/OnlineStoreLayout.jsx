import React from 'react'
import Navbar from '../components/onlinestore/Navbar'

const OnlineStoreLayout = () => {
  return (
    <div>
      <Navbar />
      {/* flex puts the sidebar and products next to each other. */}
      <div className="flex">
        {/* w-56 sets width; shrink-0 keeps it from shrinking. */}
        {/* border-r adds a right border; p-4 adds space inside. */}
        <aside className="w-56 shrink-0 border-r p-4">
          <h2>Categories</h2>
          {/* A full-width button. Category filtering is not connected yet. */}
          <button type="button" className="mt-4 w-full rounded-lg bg-gray-100 px-3 py-2 text-left">
            All Products
          </button>
        </aside>
        {/* flex-1 fills the remaining width; min-w-0 lets this area shrink. */}
        <main className="min-w-0 flex-1 p-4">
          <h2>Products</h2>
          {/* Sample name and price typed here, not loaded from MySQL. */}
          <div className="flex gap-4">
            <div className="w-48 border p-4">
              <p>Milk</p>
              <p>$3.99</p>
            </div>

            <div className="w-48 border p-4">
              <p>Apple</p>
              <p>$0.99</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OnlineStoreLayout
