// ProductList calls this helper while rendering and sends its products plus Layout's selections.
// Return the matching products for cards; default text and selection add no filter restrictions.
export function filterProducts(products, searchText = "", selectedCategoryIds = []) {
  // An invalid product value cannot be searched, so handle it before starting the loop.
  if (!Array.isArray(products)) {
    // Return an empty result to ProductList when the input is not an array.
    return [];
  }

  // Use text only when it is a string; otherwise search with an empty string.
  // trim removes spaces at both ends; lower case lets milk and MILK match the same name.
  const query = typeof searchText === "string" ? searchText.trim().toLowerCase() : "";
  // Build a separate list of selected IDs as strings without changing Layout's array.
  const categoryIds = [];
  // Only read selections when they arrive as an array; other values leave this list empty.
  if (Array.isArray(selectedCategoryIds)) {
    // Visit each selected ID from position 0; i increases until every selection has been read.
    for (let i = 0; i < selectedCategoryIds.length; i++) {
      // Read this selected ID, convert it to text, and append it to the comparison list.
      // This makes numeric API IDs and string checkbox IDs compare consistently.
      categoryIds.push(String(selectedCategoryIds[i]));
    }
  }

  // Collect matching product objects here in their original order.
  const visibleProducts = [];
  // Visit every loaded product once; i identifies its position in the input array.
  for (let i = 0; i < products.length; i++) {
    // Read the product at this position so the following checks use the same object.
    const product = products[i];
    // Skip a missing product or a name that is not text before calling name methods.
    if (!product || typeof product.ItemName !== "string") {
      // Move to the next product without adding this invalid entry to the results.
      continue;
    }

    // Check whether this lower-case name contains the prepared search text anywhere.
    // An empty query matches every valid name, so clearing Search restores name matches.
    const matchesName = product.ItemName.toLowerCase().includes(query);
    // No selected IDs allow every category; otherwise this product must match one selected ID.
    // || means either condition is enough; choosing several boxes allows any of those categories.
    const matchesCategory = categoryIds.length === 0 || categoryIds.includes(String(product.ItemCategoryID));
    // && requires both the name check and category check to pass before keeping this product.
    if (matchesName && matchesCategory) {
      // Append the original product object so Add to Cart still receives all of its API fields.
      // Only the result array grows; this does not edit the product or the loaded array.
      visibleProducts.push(product);
    }
  }
  // Send the completed result array back to ProductList for its count and cards.
  return visibleProducts;
}
