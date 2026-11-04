import { filterProducts } from "./productFilters";

const ProductList = ({
  products,
  errorMessage,
  canAddOne,
  onAddToCart,
  searchText,
  selectedCategoryIds,
}) => {
  const visibleProducts = filterProducts(
    products,
    searchText,
    selectedCategoryIds,
  );

  return (
    <main className="w-full min-w-0 flex-1 p-4">
      <h2 aria-live="polite" aria-atomic="true">
        Products ({visibleProducts.length})
      </h2>
      {products === null && !errorMessage && <p>Loading products...</p>}
      {errorMessage && <p>{errorMessage}</p>}
      {products !== null && visibleProducts.length === 0 && (
        <p>No products found.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <div key={product.ItemID} className="min-w-0 border p-4">
            <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              {product.ItemName}
            </p>
            <p>
              ${(Math.round(Number(product.ItemPrice) * 100) / 100).toFixed(2)}
            </p>
            <p>In stock: {product.Stock ?? "Unavailable"}</p>
            <button
              type="button"
              disabled={!canAddOne(product.ItemID)}
              className="mt-2 min-h-11 border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ProductList;
