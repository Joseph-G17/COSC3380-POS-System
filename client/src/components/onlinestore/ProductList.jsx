import { useState } from "react";
import { useEffect } from "react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        console.log("HTTP status:", response.status);
        const data = await response.json();
        console.log(data);
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

  return (
    <main className="min-w-0 flex-1 p-4">
      <h2>Products ({products.length})</h2>
      {errorMessage && <p>{errorMessage}</p>}
      {productsLoaded && products.length === 0 && (
        <p>No products found.</p>
      )}
      {/* Display one card for each product received from the API. */}
      <div className="flex gap-4">
        {products.map((product) => (
          <div key={product.ItemID} className="w-48 border p-4">
            <p>{product.ItemName}</p>
            <p>${product.ItemPrice}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProductList;
