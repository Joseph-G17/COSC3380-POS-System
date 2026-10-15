/*
 * Customer navbar
 *
 * This component builds the top navigation for the storefront.
 * It has the store name, search input, cart, and account controls.
 * App.jsx renders it with <Navbar />. Storefront main.jsx loads index.css.
 *
 * JSX looks similar to HTML. className gives an element a CSS class name;
 * it is a label for styling, not a C++ class.
 * Example: className="store-name" connects to .store-name in index.css.
 * Comments inside the returned JSX need curly braces around the comment block.
 * The comments below show that syntax.
 *
 * Current behavior:
 * - CSS moves search below the first row at widths of 800px or less.
 * - Wide screens show Sign Up and Login. Small screens show the avatar.
 * - Search has a typing hint. Focusing the input clears and stops the hint.
 * - Leaving an empty input restarts the hint; customer text stays in the input.
 * - The input does not search or filter products yet.
 * - Cart and account controls do not have click actions connected yet.
 * - There is no login state or database connection in this component yet.
 *
 * Next account behavior to connect:
 * A guest can click the small-screen avatar to choose Login or Sign Up.
 * After a real login, wide screens can also show the customer's avatar.
 */

// useState stores values that React uses to update the screen.
// useEffect starts the typing timer and cleans it up when it is no longer needed.
import { useEffect, useState } from "react";

// Change this string if the search hint needs different wording later.
const SEARCH_HINT = "What are you looking for?";

// Times are in milliseconds. 1000 milliseconds = 1 second.
const TYPE_DELAY_MS = 90;
const DELETE_DELAY_MS = 45;
const FULL_HINT_PAUSE_MS = 1800;
const RESTART_PAUSE_MS = 500;

// Define Navbar as a function. React uses the JSX returned by this function.
const Navbar = () => {
  // searchText is only what the customer enters; the animation never changes it.
  const [searchText, setSearchText] = useState("");

  // true means the customer clicked the input or reached it with the keyboard.
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // searchHint is only the placeholder text shown while the input is empty.
  const [searchHint, setSearchHint] = useState("");

  // Read the device's motion preference once when this component starts.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    // Follow later preference changes too, without changing device settings.
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event) => {
      setPrefersReducedMotion(event.matches);
      setSearchHint("");
    };
    motionPreference.addEventListener("change", handleMotionChange);
    return () => motionPreference.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    // Skip animation on focus, existing customer text, or reduced-motion mode.
    // Reduced-motion mode uses the full still hint directly in the JSX below.
    if (isSearchFocused || searchText !== "" || prefersReducedMotion) {
      return;
    }

    // These values belong to this typing cycle, not to the customer's input.
    let characterCount = 0;
    let isDeleting = false;
    let timerId;

    function updateHint() {
      if (isDeleting) {
        // Remove one character from the hint on each step.
        characterCount--;
      } else {
        // Add one character to the hint on each step.
        characterCount++;
      }

      // slice(0, count) keeps only the first count characters of the full string.
      setSearchHint(SEARCH_HINT.slice(0, characterCount));

      if (!isDeleting && characterCount === SEARCH_HINT.length) {
        // Keep the complete question visible before starting to remove it.
        isDeleting = true;
        timerId = window.setTimeout(updateHint, FULL_HINT_PAUSE_MS);
        return;
      }

      if (isDeleting && characterCount === 0) {
        // The hint is empty. Pause, then begin a fresh typing cycle.
        isDeleting = false;
        timerId = window.setTimeout(updateHint, RESTART_PAUSE_MS);
        return;
      }

      // Schedule only one next step. Removing letters is faster than typing them.
      const nextDelay = isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS;
      timerId = window.setTimeout(updateHint, nextDelay);
    }

    // Wait briefly before showing the first character.
    timerId = window.setTimeout(updateHint, RESTART_PAUSE_MS);

    // React runs this cleanup on focus/text changes or when Navbar is removed.
    // It stops the pending timer so an old typing cycle cannot keep running.
    return () => window.clearTimeout(timerId);
  }, [isSearchFocused, searchText, prefersReducedMotion]);

  // Parentheses let us write the returned JSX across several lines.
  return (
    // <nav> tells the browser that this group is a navigation area.
    <nav>
      {/*
        Store logo
        Keep the store-name div so the logo stays in the navbar's brand grid area.
        The image already contains SaveSo lettering, so it replaces the old text.
        Vite serves public files from the site root: /SaveSo logo.png.
        Do not include /public in src; this public URL does not need an import.
        className="store-logo" connects the image to its size and alignment rules.
        alt="SaveSo" names the store for screen readers and if the image cannot load.
        Keep h1 so the store name remains available as a heading.
        width and height describe the original image and reserve its aspect ratio.
        CSS controls the displayed size; the image is not shown at its full 451px width.
      */}
      <div className="store-name">
        <h1>
          <img
            className="store-logo"
            src="/SaveSo logo.png"
            alt="SaveSo"
            width={451}
            height={438}
          />
        </h1>
      </div>

      {/*
        Search input
        The outer div provides the border, rounded corners, and maximum width.
        The input is the part where a customer can type.
        type="text" makes it a normal text input.
        placeholder shows the typing hint; value contains the customer's text.
        onChange stores what the customer types in searchText.
        onFocus runs on a click or keyboard focus: stop and clear the hint.
        onBlur runs when the customer leaves: reset the hint for the next cycle.
        The effect restarts only if the input is empty and no longer focused.
        aria-label keeps the input name stable for screen readers while the hint changes.
        CSS centers the text and adds space between the text and border.
        This input still needs product-search logic later.
      */}
      <div className="search-bar">
        <input
          type="text"
          aria-label="Search products"
          value={searchText}
          placeholder={
            isSearchFocused || searchText !== ""
              ? ""
              : prefersReducedMotion
                ? SEARCH_HINT
                : searchHint
          }
          onChange={(event) => setSearchText(event.target.value)}
          onFocus={() => {
            setIsSearchFocused(true);
            setSearchHint("");
          }}
          onBlur={() => {
            setIsSearchFocused(false);
            setSearchHint("");
          }}
        />
      </div>

      {/*
        Shopping cart
        A span holds a small piece of content inside the cart group.
        cart-icon shows the shopping-cart emoji.
        cart-count is empty for now. It can display the item count later,
        after it is connected to actual cart data.
        This group does not open a cart page or update a count yet.
      */}
      <div className="cart">
        <span className="cart-icon">🛒</span>
        <span className="cart-count"></span>
      </div>

      {/*
        Account controls
        Keep these controls together so CSS can place the group on the right.
        All three controls exist in this JSX. CSS chooses which ones are visible:
        above 800px, show Sign Up/Login; at 800px or less, show the avatar.
        Screen size does not tell us whether a customer has logged in.
      */}
      <div className="signup-login">
        {/* These two buttons still need actions to open the account screens. */}
        <button className="signup-button">Sign Up</button>
        <button className="login-button">Login</button>

        {/*
          Account avatar
          type="button" prevents this button from submitting a form if it is
          placed inside a form later.
          aria-label gives the icon-only button the name Account for screen readers.
          The SVG file is stored at client/public/account-avatar.svg.
          Vite serves files from public at the site root, so the URL starts with /.
          alt is empty because the button already has the accessible name Account;
          the person image is decorative and does not need a second announcement.
          CSS makes this button round and centers the gray person image.
          A click action and real login state still need to be connected later.
        */}
        <button className="account-avatar" type="button" aria-label="Account">
          <img src="/account-avatar.svg" alt="" />
        </button>
      </div>
    </nav>
  );
};

// Let App.jsx import this component and render it with <Navbar />.
export default Navbar;
