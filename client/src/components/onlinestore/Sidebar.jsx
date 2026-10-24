// React supplies useState so this component can remember whether its own category panel is open.
import { useState } from "react";

// React calls Sidebar to produce the menu; OnlineStorePage supplies the props listed below.
// Page fetches category labels and forwards Layout's selected IDs/functions, rather than owning that selection.
// ProductList reads the same Layout selection; no selected IDs means all categories can match there.
const Sidebar = ({
  categories, // Page's array of database rows, with ItemCategoryID and CategoryName.
  selectedCategoryIds, // Layout's string ID array tells each checkbox whether it is checked.
  onToggleCategory, // Page forwards Layout's function; a checkbox sends one string ID to toggle.
  onClearCategories, // Page forwards Layout's clear function; this does not reset search text.
  categoriesLoading, // Page keeps this true while its category request is still waiting.
  categoriesError, // Page supplies a readable error string, or "" when there is no error.
}) => {
  // React starts sidebarOpen at false; its setter changes this local value and asks React to render again.
  // Keep panel visibility here because opening Shop should not change the shared search, categories or cart.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Return the menu JSX for React to display; the parent page decides whether it sits beside or above products.
  return (
    // shrink-0 prevents the surrounding flex layout from squeezing this menu below its own content width.
    <div className="shrink-0">
      {/* Keep Shop outside the panel so the button remains available when the panel is closed. */}
      {/* The arrow waits for a browser click; ! flips the current flag and the setter redraws the panel. */}
      {/* aria-expanded reports the state to screen readers; aria-controls points to the panel ID. */}
      {/* type="button" avoids form submission; min-h-11 gives a 44px tap area; green marks the Shop control. */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-controls="customer-categories"
        className="m-2 min-h-11 rounded-lg border border-[#5FA37A] bg-[#97C1A9] px-3 py-2"
      >
        ☰ Shop
      </button>

      {/* The id below matches aria-controls on Shop, connecting the button to this exact panel. */}
      {/* ?: chooses the first class string when sidebarOpen is true, or the second when false. */}
      {/* w-56 opens the panel; w-0 shrinks it to 0. overflow-hidden hides content outside its width. */}
      {/* transition-all/duration-300 animate size changes over 300ms; motion-reduce disables the animation if requested. */}
      {/* When closed, !sidebarOpen is true: inert blocks interaction and Tab focus in hidden controls. */}
      <div
        id="customer-categories"
        className={
          sidebarOpen
            ? "w-56 overflow-hidden transition-all duration-300 motion-reduce:transition-none"
            : "w-0 overflow-hidden transition-all duration-300 motion-reduce:transition-none"
        }
        inert={!sidebarOpen}
      >
        {/* Keep this inner area 224px wide while the outer width animates, so names do not squeeze during motion. */}
        {/* aside marks supporting product navigation; border-r/p-4 provide the divider and 16px inner space. */}
        <aside className="w-56 border-r p-4" aria-label="Product categories">
          {/* fieldset groups related native filters; min-w-0 lets its content fit inside the fixed panel width. */}
          <fieldset className="min-w-0">
            {/* legend names that group; the inline styles override global nowrap and allow long words to break. */}
            <legend className="font-medium" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
              Categories
            </legend>
            {/* Pass the function without () so React waits for a click before clearing Layout's category IDs. */}
            {/* This stays available during loading/error too; min-h-11 gives a 44px target and w-full fills the panel. */}
            {/* type="button" avoids submitting a surrounding form; wrapping keeps the label inside its width. */}
            <button
              type="button"
              onClick={onClearCategories}
              className="mt-4 min-h-11 w-full rounded-lg bg-gray-100 px-3 py-2 text-left"
              style={{ textWrap: "wrap", overflowWrap: "anywhere" }}
            >
              All categories
            </button>

            {/* && renders this message only while Page is waiting; role="status" announces that loading state. */}
            {categoriesLoading && (
              <p className="mt-3 text-sm text-gray-600" role="status" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                Loading categories...
              </p>
            )}
            {/* After loading ends, a nonempty error string shows Page's message; role="alert" announces it. */}
            {!categoriesLoading && categoriesError && (
              <p className="mt-3 text-sm text-red-700" role="alert" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                {categoriesError}
              </p>
            )}
            {/* Show an empty result only after success; do not mistake waiting or an error for zero categories. */}
            {!categoriesLoading && !categoriesError && categories.length === 0 && (
              <p className="mt-3 text-sm text-gray-600" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                No categories available.
              </p>
            )}

            {/* Only a successful nonempty list reaches map; no category names or sample IDs are invented here. */}
            {!categoriesLoading && !categoriesError && categories.length > 0 && (
              <div className="mt-2">
                {/* map supplies one database row as category, then collects each returned label into this list. */}
                {categories.map(function (category) {
                  // Convert the row's numeric/string ID to the same string form that Layout stores.
                  const categoryId = String(category.ItemCategoryID);

                  return (
                    // Return one row; key lets React match this category across renders without using its position.
                    // Clicking any part of label toggles its native input; min-h-11 gives a 44px minimum target.
                    // flex/gap align the checkbox and name; hover adds a light background without changing selection.
                    <label key={categoryId} className="flex min-h-11 cursor-pointer items-center gap-3 rounded px-3 py-2 hover:bg-gray-100">
                      {/* type supplies native keyboard behavior; name groups submitted values and value holds this ID. */}
                      <input
                        type="checkbox"
                        name="category"
                        value={categoryId}
                        // includes returns true only for a selected ID, making this a controlled checkbox.
                        checked={selectedCategoryIds.includes(categoryId)}
                        // The browser calls this arrow after checking/unchecking; send the string ID to Layout.
                        // Layout updates its selection, then React sends the new checked value back through Page.
                        onChange={() => onToggleCategory(categoryId)}
                        // Keep a 16px square that cannot shrink; accent colors the native checked mark green.
                        className="h-4 w-4 shrink-0 accent-[#1f5735]"
                      />
                      {/* min-w-0 lets this flex child shrink; wrap/anywhere keep the database name inside the panel. */}
                      <span className="min-w-0" style={{ textWrap: "wrap", overflowWrap: "anywhere" }}>
                        {/* Insert the CategoryName from this API row; changing a label does not change its ID. */}
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

// Allow OnlineStorePage to import and display Sidebar.
export default Sidebar;
