import { useState } from "react";

// Page supplies category rows and forwards Layout's shared filter actions.
const Sidebar = ({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onClearCategories,
  categoriesLoading,
  categoriesError,
}) => {
  // Keep panel visibility local; opening Shop does not change filters or the cart.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="shrink-0">
      {/* Keep Shop available when the category panel is closed. */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-controls="customer-categories"
        className="m-2 min-h-11 rounded-lg border border-[#5FA37A] bg-[#97C1A9] px-3 py-2"
      >
        ☰ Shop
      </button>

      {/* Animate panel width; inert prevents focus or clicks while closed. */}
      <div
        id="customer-categories"
        className={
          sidebarOpen
            ? "w-56 overflow-hidden transition-all duration-300 motion-reduce:transition-none"
            : "w-0 overflow-hidden transition-all duration-300 motion-reduce:transition-none"
        }
        inert={!sidebarOpen}
      >
        <aside className="w-56 border-r p-4" aria-label="Product categories">
          <fieldset className="min-w-0">
            {/* Allow long category names to wrap despite the global no-wrap rule. */}
            <legend className="font-medium" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              Categories
            </legend>
            {/* Clear category selection without clearing the search text. */}
            <button
              type="button"
              onClick={onClearCategories}
              className="mt-4 min-h-11 w-full rounded-lg bg-gray-100 px-3 py-2 text-left"
              style={{ textWrap: "wrap", overflowWrap: "anywhere" }}
            >
              All categories
            </button>

            {/* Show loading, request failure, or an empty category list. */}
            {categoriesLoading && (
              <p className="mt-3 text-sm text-gray-600" role="status" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                Loading categories...
              </p>
            )}
            {!categoriesLoading && categoriesError && (
              <p className="mt-3 text-sm text-red-700" role="alert" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                {categoriesError}
              </p>
            )}
            {!categoriesLoading && !categoriesError && categories.length === 0 && (
              <p className="mt-3 text-sm text-gray-600" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                No categories available.
              </p>
            )}

            {!categoriesLoading && !categoriesError && categories.length > 0 && (
              <div className="mt-2">
                {/* Each checkbox sends its category ID back to Layout. */}
                {categories.map(function (category) {
                  // Store and compare category IDs as strings.
                  const categoryId = String(category.ItemCategoryID);

                  return (
                    <label key={categoryId} className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-3 py-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        name="category"
                        value={categoryId}
                        checked={selectedCategoryIds.includes(categoryId)}
                        onChange={() => onToggleCategory(categoryId)}
                        className="h-4 w-4 shrink-0 accent-[#1f5735]"
                      />
                      <span className="min-w-0" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                        {category.CategoryName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        </aside>
      </div>
    </div>
  );
};

export default Sidebar;
