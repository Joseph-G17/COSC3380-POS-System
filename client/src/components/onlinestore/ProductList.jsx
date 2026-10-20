import { useState } from "react";
import { useEffect } from "react";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        console.log("HTTP status:", response.status);
        const data = await response.json();
        console.log(data);
        setProducts(data);
      } catch (error) {
        console.log(error);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="min-w-0 flex-1 p-4">
      <h2>Products ({products.length})</h2>
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
  );
};

export default ProductList;
