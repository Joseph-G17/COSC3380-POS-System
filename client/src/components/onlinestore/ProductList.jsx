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
            {/*Show the item picture from the ItemImage link in a square box*/}
            {product.ItemImage ? (
              <img
                src={product.ItemImage}
                alt={product.ItemName}
                loading="lazy"
                className="mb-3 aspect-square w-full rounded bg-white object-contain"
                onError={function(event){
                  //Hide a broken link but keep the box so the cards stay the same size
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            ) : (
              <div className="mb-3 aspect-square w-full rounded bg-gray-100" />
            )}
            <p style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              {product.ItemName}
            </p>
            {/*Show the deal price next to the regular price when the item is on sale this season*/}
            {product.SeasonName ? (
              <p>
                <span className="font-medium text-red-700">${Number(product.ItemPrice).toFixed(2)}</span>{" "}
                <span className="text-gray-500 line-through">${Number(product.RegularPrice).toFixed(2)}</span>{" "}
                <span className="text-sm">({product.SeasonName} deal)</span>
              </p>
            ) : (
              <p>
                ${(Math.round(Number(product.ItemPrice) * 100) / 100).toFixed(2)}
              </p>
            )}
            {/*Show "Out of stock" instead of "In stock: 0"*/}
            {Number(product.Stock) > 0 ? (
              <p>In stock: {product.Stock}</p>
            ) : (
              <p className="font-medium text-red-700">Out of stock</p>
            )}
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
