export function filterProducts(
  products,
  searchText = "",
  selectedCategoryIds = [],
) {
  if (!Array.isArray(products)) {
    return [];
  }

  const query =
    typeof searchText === "string" ? searchText.trim().toLowerCase() : "";
  // Checkbox IDs are strings, but the API may return numbers.
  const categoryIds = [];
  if (Array.isArray(selectedCategoryIds)) {
    for (let i = 0; i < selectedCategoryIds.length; i++) {
      categoryIds.push(String(selectedCategoryIds[i]));
    }
  }

  const visibleProducts = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!product || typeof product.ItemName !== "string") {
      continue;
    }

    const matchesName = product.ItemName.toLowerCase().includes(query);
    // With no categories selected, every category matches.
    const matchesCategory =
      categoryIds.length === 0 ||
      categoryIds.includes(String(product.ItemCategoryID));
    if (matchesName && matchesCategory) {
      visibleProducts.push(product);
    }
  }
  return visibleProducts;
}
