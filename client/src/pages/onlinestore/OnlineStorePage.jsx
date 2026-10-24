import { useEffect, useState } from "react"; // State holds category data; the effect loads it after mounting.
import { useOutletContext } from "react-router-dom"; // Read values/functions supplied by the shared Layout.
import Sidebar from "../../components/onlinestore/Sidebar"; // Sidebar displays category checkboxes.
import ProductList from "../../components/onlinestore/ProductList"; // ProductList loads and filters product cards.

// Layout keeps cart/search selections; this page loads the actual category labels from MySQL.
const OnlineStorePage = () => {
  // Give local names to Layout's shared values and actions; this page does not copy its cart.
  const { addToCart, searchText, selectedCategoryIds, toggleCategory, clearCategories } = useOutletContext();
  const [categories, setCategories] = useState([]); // Start with no rows until the API responds.
  const [categoriesLoading, setCategoriesLoading] = useState(true); // Show loading while the first request runs.
  const [categoriesError, setCategoriesError] = useState(""); // No error message is needed before a failure.

  // React runs this setup after adding the shop page to the screen.
  useEffect(() => {
    const controller = new AbortController(); // Give this API request a cancel switch.
    let isMounted = true; // Ignore a late response after the user leaves this page.
    const timeoutId = window.setTimeout(() => controller.abort(), 10000); // Stop waiting after 10 seconds.

    // async allows await to wait for the backend without freezing the page.
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", { signal: controller.signal }); // Ask our backend for real category rows.
        // A failed HTTP status must use the error message rather than fill the checkboxes.
        if (!response.ok) {
          throw new Error("Unable to load categories");
        }
        const data = await response.json(); // Convert the JSON response into JavaScript values.
        // Sidebar expects a list, so reject any different response shape.
        if (!Array.isArray(data)) {
          throw new Error("Invalid category data");
        }
        if (isMounted) {
          setCategories(data); // Save valid rows and let React render the new checkbox labels.
        }
      } catch {
        // Category failure leaves name search available; never substitute made-up labels.
        if (isMounted) {
          setCategoriesError("Unable to load categories. You can still search products."); // Explain only the failed category request.
        }
      } finally {
        window.clearTimeout(timeoutId); // Success or failure ends the need for the timeout.
        if (isMounted) {
          setCategoriesLoading(false); // Replace loading with checkboxes or the error message.
        }
      }
    }

    loadCategories(); // Call the function now; declaring it above did not start the request.
    // React runs this cleanup before removing the shop page.
    return () => {
      isMounted = false; // Prevent unfinished work from changing a page that is gone.
      window.clearTimeout(timeoutId); // The removed page no longer needs a timeout.
      controller.abort(); // Cancel the category request when leaving the shop.
    };
  }, []); // Load once per page mount, rather than on each search or checkbox change.

  return (
    // On small screens the category panel sits above the cards so both remain usable.
    <div className="flex flex-col items-start md:flex-row">
      {/* Send the API rows and loading/error values so Sidebar can display the right state.
          selectedCategoryIds tells it which boxes are checked.
          onToggleCategory/onClearCategories are functions it calls after the visitor chooses an action. */}
      <Sidebar
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={toggleCategory}
        onClearCategories={clearCategories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
      />
      {/* Text matches AND a selected category matches; no selected category allows all of them.
          ProductList reads the filters and calls Layout's addToCart when a product button is clicked. */}
      <ProductList onAddToCart={addToCart} searchText={searchText} selectedCategoryIds={selectedCategoryIds} />
    </div>
  );
};

export default OnlineStorePage; // Allow App to display this page at the shop route.
