// useState lets ProductList keep its loaded products and messages between renders.
import { useState } from "react";
// useEffect starts the product request after React displays this component.
import { useEffect } from "react";
// This helper chooses the loaded products that match the current search and categories.
import { filterProducts } from "./productFilters";

// Layout owns the shared search, category selection, and cart; OnlineStorePage passes them here.
// React calls ProductList with these props; this component owns the products it fetches.
// onAddToCart is Layout's function; the other two props describe which cards to show.
const ProductList = ({ onAddToCart, searchText, selectedCategoryIds }) => {
  // Start with no loaded products; products is the current array from the API.
  // setProducts gives React a replacement array and asks it to display the component again.
  const [products, setProducts] = useState([]);
  // Track successful loading separately: an initial empty array is still waiting for the API.
  // true also allows a successful empty result to show "No products found."
  const [productsLoaded, setProductsLoaded] = useState(false);
  // Keep the user-facing loading error here; an empty string means no error message.
  const [errorMessage, setErrorMessage] = useState("");

  // React runs this effect when ProductList mounts; [] does not rerun it for search changes.
  // Typing or checking a category filters the saved products without starting another request.
  useEffect(() => {
    // This named async function holds the loading steps; defining it does not start them.
    // async allows await to pause this function while the request or JSON reading finishes.
    async function loadProducts() {
      // Try the request and data checks; any error moves execution to catch below.
      try {
        // Ask our products API for data with GET; await waits for its Response object.
        // The Response has the status and body; it is not the product array yet.
        const response = await fetch("/api/products");
        // Show the HTTP status in the browser console when checking a loading problem.
        console.log("HTTP status:", response.status);
        // Read the response body as a JavaScript value, then store that value in data.
        const data = await response.json();
        // Show the received value in the console so it can be compared with the cards.
        console.log(data);
        // Reject a failed HTTP status or a body that is not an array.
        // The filter and card list need an array even when the store has zero products.
        if (!response.ok || !Array.isArray(data)) {
          // Create an error and go to catch before invalid data reaches products.
          throw new Error("Unable to load products");
        }
        // Give React the valid array; the next render uses these products for filtering and cards.
        setProducts(data);
        // Record successful loading, including a valid empty array.
        setProductsLoaded(true);
      } catch (error) {
        // Handle a request, JSON, or validation error so the page can explain the failure.
        // Keep the technical error in the browser console for troubleshooting.
        console.log(error);
        // Save a readable message; React displays it in the error paragraph below.
        setErrorMessage("Unable to load products. Please try again");
      }
    }

    // Call the function now to start loading; its definition above only described the steps.
    loadProducts();
  }, []);

  // On each render, pass the loaded array and current shared selections to the helper.
  // Its returned array contains only matching cards; the loaded array and cart stay unchanged.
  const visibleProducts = filterProducts(products, searchText, selectedCategoryIds);

  // Return the page content for React to display; {} in JSX inserts JavaScript values.
  // Use the available page width; min-w-0 lets this area shrink beside the category panel.
  return (
    <main className="w-full min-w-0 flex-1 p-4">
      {/* Count the matching products after every search or category change. */}
      {/* aria-live announces the updated heading politely; aria-atomic reads the whole heading. */}
      <h2 aria-live="polite" aria-atomic="true">Products ({visibleProducts.length})</h2>
      {/* Show Loading only while no successful response or error has been saved. */}
      {!productsLoaded && !errorMessage && <p>Loading products...</p>}
      {/* && displays this paragraph only when errorMessage has text. */}
      {errorMessage && <p>{errorMessage}</p>}
      {/* After successful loading, zero matches can mean an empty store or filters with no match. */}
      {productsLoaded && visibleProducts.length === 0 && (
        <p>No products found.</p>
      )}
      {/* Arrange one column on narrow screens, then add columns as the available width grows. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* map calls this function once per visible product and collects each returned card. */}
        {/* product is the current entry; => (...) returns its JSX without writing return inside braces. */}
        {/* ItemID gives React a stable identity for each card as the filtered list changes. */}
        {visibleProducts.map((product) => (
          <div key={product.ItemID} className="min-w-0 border p-4">
            {/* Read this product's API name; allow long names to wrap inside the card. */}
            <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>{product.ItemName}</p>
            {/* Round this display to cents and show two decimals; the API price and cart data stay unchanged. */}
            <p>${(Math.round(Number(product.ItemPrice) * 100) / 100).toFixed(2)}</p>
            {/* React calls the arrow function when the user clicks; rendering does not add the product. */}
            {/* That function sends this full product to Layout's onAddToCart action. */}
            {/* type="button" keeps this click from submitting a surrounding form. */}
            {/* A 44px minimum height gives phone users a larger area to tap. */}
            <button type="button" className="mt-2 min-h-11 border px-2 py-1" onClick={()=>onAddToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </main>
  );
};

// Allow OnlineStorePage to import this component and pass the shared props to it.
export default ProductList;
