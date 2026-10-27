import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../../components/onlinestore/Sidebar";
import ProductList from "../../components/onlinestore/ProductList";

// Layout owns cart/search selections; this page loads category labels from the API.
const OnlineStorePage = () => {
  // Read shared values and callbacks from the parent route instead of copying its state.
  const { addToCart, searchText, selectedCategoryIds, toggleCategory, clearCategories } = useOutletContext();
  // Sidebar receives these rows plus their loading and failure states.
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // Load once when the shop opens; cancel on leaving or after 10 seconds.
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    // Load the labels once; Sidebar returns each chosen ID to Layout.
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", { signal: controller.signal });
        // A failed HTTP status must not become category rows.
        if (!response.ok) {
          throw new Error("Unable to load categories");
        }
        const data = await response.json();
        // Sidebar expects a list of category rows.
        if (!Array.isArray(data)) {
          throw new Error("Invalid category data");
        }
        if (isMounted) {
          setCategories(data);
        }
      } catch {
        // A category request failure leaves product-name search available.
        if (isMounted) {
          setCategoriesError("Unable to load categories. You can still search products.");
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <div className="flex flex-col items-start md:flex-row">
      {/* Sidebar reads the rows and calls Layout's category actions. */}
      <Sidebar
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={toggleCategory}
        onClearCategories={clearCategories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
      />
      {/* ProductList combines the shared name and category filters. */}
      <ProductList onAddToCart={addToCart} searchText={searchText} selectedCategoryIds={selectedCategoryIds} />
    </div>
  );
};

export default OnlineStorePage;
