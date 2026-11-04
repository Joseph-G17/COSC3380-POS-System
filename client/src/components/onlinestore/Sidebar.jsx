import { useState } from "react";

const Sidebar = ({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onClearCategories,
  categoriesLoading,
  categoriesError,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full shrink-0 md:w-auto">
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
            ? "w-full overflow-hidden md:w-56 md:transition-all md:duration-300 motion-reduce:transition-none"
            : "hidden overflow-hidden md:block md:w-0 md:transition-all md:duration-300 motion-reduce:transition-none"
        }
        inert={!sidebarOpen}
      >
        <aside className="max-h-[50dvh] w-full overflow-y-auto overscroll-contain border-y p-4 md:max-h-none md:w-56 md:overflow-visible md:border-y-0 md:border-r" aria-label="Product categories">
          <fieldset className="min-w-0">
            {/* Allow long category names to wrap despite the global no-wrap rule. */}
            <legend className="font-medium" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              Categories
            </legend>
            <button
              type="button"
              onClick={onClearCategories}
              className="mt-4 min-h-11 w-full rounded-lg bg-gray-100 px-3 py-2 text-left"
              style={{ textWrap: "wrap", overflowWrap: "anywhere" }}
            >
              All categories
            </button>

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
                {categories.map(function (category) {
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
