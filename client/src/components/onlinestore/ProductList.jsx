import { useState } from "react";
import { useEffect } from "react";

const ProductList = ({onAddToCart}) => {
  // Store the API products here so React can update the cards.
  const [products, setProducts] = useState([]);
  // Show the empty message only after the request succeeds.
  const [productsLoaded, setProductsLoaded] = useState(false);
  // Store the error message shown on the page.
  const [errorMessage, setErrorMessage] = useState("");

  // Request products when this component is added to the page.
  useEffect(() => {
    async function loadProducts() {
      try {
        // Get product data from our own server.
        const response = await fetch("/api/products");
        console.log("HTTP status:", response.status);
        // Read the JSON response as a JavaScript value.
        const data = await response.json();
        console.log(data);
        // The card list needs a successful response containing an array.
        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Unable to load products");
        }
        // Save the products, then mark the successful load.
        setProducts(data);
        setProductsLoaded(true);
      } catch (error) {
        console.log(error);
        // Show a message on the page when loading fails.
        setErrorMessage("Unable to load products. Please try again");
      }
    }

    // Call the function above to start the request.
    loadProducts();
    // [] keeps state updates from starting another request.
  }, []);

  return (
    <main className="min-w-0 flex-1 p-4">
      {/* Use the same product array for the count and the cards. */}
      <h2>Products ({products.length})</h2>
      {/* An empty error message displays nothing. */}
      {errorMessage && <p>{errorMessage}</p>}
      {/* A successful request can still return an empty array. */}
      {productsLoaded && products.length === 0 && (
        <p>No products found.</p>
      )}
      {/* Display one card for each product received from the API. */}
      <div className="flex gap-4">
        {/* ItemID gives each card a stable key if names change. */}
        {products.map((product) => (
          <div key={product.ItemID} className="w-48 border p-4">
            <p>{product.ItemName}</p>
            <p>${product.ItemPrice}</p>
            <button type="button" className="mt-2 border px-2 py-1" onClick={()=>onAddToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProductList;
