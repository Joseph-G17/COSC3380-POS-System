import { useState } from "react";
import { useEffect } from "react";
import { filterProducts } from "./productFilters";

// Load products here; Layout owns the cart, search and category selection.
const ProductList = ({ onAddToCart, searchText, selectedCategoryIds }) => {
  // Track loaded rows, a successful response, and a readable loading error.
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch once when the product list opens; search filters the saved rows.
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        console.log("HTTP status:", response.status);
        const data = await response.json();
        console.log(data);
        // The filter and cards require an array, including a valid empty result.
        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Unable to load products");
        }
        setProducts(data);
        setProductsLoaded(true);
      } catch (error) {
        console.log(error);
        setErrorMessage("Unable to load products. Please try again");
      }
    }

    loadProducts();
  }, []);

  // Filter a separate display list without changing the loaded products or cart.
  const visibleProducts = filterProducts(products, searchText, selectedCategoryIds);

  return (
    <main className="w-full min-w-0 flex-1 p-4">
      {/* Show loading, failure, empty results, or matching product cards. */}
      <h2 aria-live="polite" aria-atomic="true">Products ({visibleProducts.length})</h2>
      {!productsLoaded && !errorMessage && <p>Loading products...</p>}
      {errorMessage && <p>{errorMessage}</p>}
      {productsLoaded && visibleProducts.length === 0 && (
        <p>No products found.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <div key={product.ItemID} className="min-w-0 border p-4">
            <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>{product.ItemName}</p>
            <p>${(Math.round(Number(product.ItemPrice) * 100) / 100).toFixed(2)}</p>
            {/* A click sends this product to Layout's shared Add action. */}
            <button type="button" className="mt-2 min-h-11 border px-2 py-1" onClick={()=>onAddToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProductList;
