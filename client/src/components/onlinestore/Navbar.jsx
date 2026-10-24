/*
 * Online Store header, displayed by OnlineStoreLayout.
 * Layout sends cart controls, search text and the function that changes the search.
 * Search filters the shop's products by name and animates a hint while empty.
 * Sign Up/Login have no action yet; the small avatar appears based on screen width.
 * Tailwind from index.css controls layout: one row above 800px; search moves down at <=800px.
 * At <=480px, smaller gaps and padding help the header fit the screen.
 */

// React supplies these two named hooks: useState remembers local values; useEffect manages browser work.
import { useEffect, useState } from "react";
// React Router supplies Link; it changes the child page without reloading the shared Layout.
import { Link } from "react-router-dom"; // The logo below uses this component to return to "/".

// The full hint text; change it here to update the typing animation.
const SEARCH_HINT = "What are you looking for?";

// Times use milliseconds: 1000ms = 1 second. These values control the animation speed.
// Wait 90ms between steps while adding letters.
const TYPE_DELAY_MS = 90;
// Wait 45ms between steps while deleting, faster than typing.
const DELETE_DELAY_MS = 45;
// Keep the complete hint visible for 1.8 seconds before deleting it.
const FULL_HINT_PAUSE_MS = 1800;
// Wait half a second before starting or typing the hint again.
const RESTART_PAUSE_MS = 500;

// React calls Navbar during rendering; Layout supplies the values/functions inside these braces.
// totalItemsQuantity is Layout's sum of quantities; it is not the number of different products.
// onOpenCart opens Layout's cart panel; isCartOpen lets this header describe the same panel state.
// searchText is Layout's current text; onSearchChange sends a new typed value back to Layout.
const Navbar = ({ totalItemsQuantity, onOpenCart, isCartOpen, searchText, onSearchChange }) => {
  // Layout owns searchText; OnlineStorePage forwards that same value to ProductList for filtering.

  // useState(false) starts with an unfocused input and returns the value plus its setter.
  // The focus/blur handlers below call this setter so the hint pauses while the customer is typing.
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Start with an empty visible hint; the timer's setter changes only this text, not the customer's search.
  const [searchHint, setSearchHint] = useState("");

  // React calls this initializer function on mount instead of rereading the preference on every render.
  // The arrow implicitly returns .matches: true asks for less motion, false allows the typing effect.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // React runs this setup after Navbar mounts; [] keeps ordinary renders from adding more listeners.
  useEffect(() => {
    // Get the browser's media-query object so we can read and subscribe to this preference.
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    // The browser supplies event when its preference changes; event.matches holds the new true/false value.
    const handleMotionChange = (event) => {
      // Save the preference so the screen can choose a still hint or the typing animation.
      setPrefersReducedMotion(event.matches);
      // Clear the old hint before using the new mode.
      setSearchHint("");
    };
    // Pass the function itself, without (), so the browser can call it when a change occurs later.
    motionPreference.addEventListener("change", handleMotionChange);
    // React stores this returned cleanup function and calls it when the subscription is removed.
    // Use the same event name and function reference to remove exactly the listener added above.
    return () =>
      motionPreference.removeEventListener("change", handleMotionChange);
  }, []);

  // React reruns this effect when focus, shared search text or the motion preference changes.
  // Before restarting it, React runs the old cleanup so two typing timers do not run together.
  useEffect(() => {
    // || means any one condition is enough to stop: focus, existing text, or reduced motion.
    if (isSearchFocused || searchText !== "" || prefersReducedMotion) {
      return; // Leave the effect before creating a timer; the placeholder below chooses what to show.
    }

    // These three variables belong to this animation cycle, not to the typed search text.
    let characterCount = 0; // Number of hint characters to display, starting at 0.
    let isDeleting = false; // False: add letters; true: delete letters.
    let timerId; // Keep the timer ID so the pending step can be cancelled.

    // The timer calls updateHint one step at a time; each step adds/deletes one letter and schedules the next.
    function updateHint() {
      // The flag selects whether this timer step shortens or grows the visible prefix.
      if (isDeleting) {
        // While deleting, keep one fewer character.
        characterCount--;
      } else {
        // While typing, keep one more character.
        characterCount++;
      }

      // slice includes index 0 but stops before characterCount; the setter asks React to show that prefix.
      setSearchHint(SEARCH_HINT.slice(0, characterCount));

      // ! means "not": pause only when adding has reached the complete hint.
      if (!isDeleting && characterCount === SEARCH_HINT.length) {
        // The full hint is typed: switch to deleting, but wait 1.8 seconds for the user to read it.
        isDeleting = true;
        timerId = window.setTimeout(updateHint, FULL_HINT_PAUSE_MS); // Save this new timer so cleanup can cancel it.
        return; // Stop this call so it does not schedule another timer below.
      }

      // Once deletion reaches zero characters, wait before beginning a new adding cycle.
      if (isDeleting && characterCount === 0) {
        // The hint is empty: switch to typing and schedule a fresh start after half a second.
        isDeleting = false;
        timerId = window.setTimeout(updateHint, RESTART_PAUSE_MS); // The next callback starts after 500ms.
        return; // The next step is already scheduled, so skip the code below.
      }

      // ?: returns 45ms when deleting, otherwise 90ms; it does not change the flag itself.
      const nextDelay = isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS;
      // The browser calls updateHint after that delay; saving the ID lets cleanup stop the pending call.
      timerId = window.setTimeout(updateHint, nextDelay);
    }

    // Schedule the first call after half a second to begin the typing cycle.
    timerId = window.setTimeout(updateHint, RESTART_PAUSE_MS);

    // Return a cleanup callback, not clearTimeout's immediate result, so React can stop the latest timer later.
    // These three dependencies below restart this cycle only when their values change.
    return () => window.clearTimeout(timerId);
  }, [isSearchFocused, searchText, prefersReducedMotion]);

  // The JSX below describes the screen; className holds Tailwind classes for layout and appearance.
  return (
    /*
     * Grid gives logo / search / cart / account their own columns.
     * minmax(0,1fr) lets search use the remaining space and shrink when needed.
     * At <=800px, a blank left column balances the two 44px controls to keep the logo centered.
     * At 481-800px the blank column is 104px; at <=480px it is 96px with 12px outer padding.
     * gap sets space between groups; px/py set space inside the header.
     */
    <nav className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-6 py-4 [@media(480px<width<=800px)]:grid-cols-[104px_minmax(0,1fr)_44px_44px] [@media(max-width:480px)]:grid-cols-[96px_minmax(0,1fr)_44px_44px] [@media(max-width:480px)]:gap-x-[8px] [@media(max-width:480px)]:p-[12px]">
      {/*
        Clicking the logo returns to the store homepage at "/".
        Link uses React Router so Layout stays mounted and keeps its shared cart state.
        aria-label gives the whole link the accessible name "SaveSo home".
        At <=800px, the logo sits in column 2, row 1.
        min-w-0 lets the cell shrink; w-[96px]/max-w-full limit the image width.
        h-auto keeps its proportions; block/mx-auto center it inside its cell.
        width/height state the original image size; alt supplies a text name for the image.
      */}
      <Link to="/" aria-label="SaveSo home" className="min-w-0 [@media(max-width:800px)]:col-start-2 [@media(max-width:800px)]:row-start-1 [@media(max-width:800px)]:text-center">
        {/* h1 marks the brand heading; img supplies the visible logo rather than extra heading text. */}
        <h1>
          <img
            className="w-[96px] max-w-full h-auto block mx-auto"
            src="/SaveSolLogo.png" // The / URL loads this image from the client public folder.
            alt="SaveSo"
            width={451}
            height={438}
          />
        </h1>
      </Link>

      {/*
        The search wrapper fills its cell up to 640px, with rounded corners and one gray border.
        At <=800px, search fills row 2. The input fills the wrapper without adding a second border.
        type="text" accepts ordinary names; aria-label names the input even when its placeholder is hidden.
        value reads Layout's searchText; onChange sends new text back to Layout.
        Layout then updates the shared value and returns to the shop when searching from Checkout.
        placeholder is only an empty-input hint; hide it while focused or while typed text exists.
        Reduced motion uses the still SEARCH_HINT; otherwise use the animated searchHint.
        onFocus stops the hint; onBlur lets it restart if the input is empty. Typed text is kept.
        aria-label names the input for screen readers; the shared text filters products.
      */}
      <div className="w-full max-w-[640px] min-w-0 justify-self-center rounded-full border border-[#808080] [@media(max-width:800px)]:col-span-full [@media(max-width:800px)]:row-start-2">
        <input
          className="w-full min-w-0 px-[14px] py-[10px] border-0 rounded-[inherit] text-center"
          type="text"
          aria-label="Search products"
          value={searchText}
          // Choose no placeholder while focused/typed; otherwise choose the still or animated hint.
          placeholder={
            isSearchFocused || searchText !== ""
              ? ""
              : prefersReducedMotion
                ? SEARCH_HINT
                : searchHint
          }
          // The browser supplies event; target.value is the input's new string, sent to Layout's callback.
          onChange={(event) => onSearchChange(event.target.value)}
          // The browser calls this on focus; pause animation and remove its old partial hint.
          onFocus={() => {
            setIsSearchFocused(true); // React rerenders and the effect cleanup cancels the pending timer.
            setSearchHint(""); // Start the next idle cycle from an empty hint.
          }}
          // The browser calls this when focus leaves; an empty input may animate again after rerendering.
          onBlur={() => {
            setIsSearchFocused(false); // Let the animation effect reevaluate its three conditions.
            setSearchHint(""); // Keep a previous partial hint out of the next cycle.
          }}
        />
      </div>

      {/*
        The 44x44px cart button gives fingers more room; flex centers the icon inside its circle.
        relative anchors the absolute quantity badge to the top-right corner of this button.
        Layout already adds the quantities; totalItemsQuantity only displays that total in the red badge.
        At <=800px, cart moves to column 3, row 1. type="button" prevents accidental form submission.
        Clicking calls onOpenCart from Layout; that function changes the open-cart flag to true.
        Cart uses that same flag for its slide animation; aria-expanded reports whether it is open.
        SVG draws the icon: viewBox is the drawing area, strokeWidth is line width, currentColor uses text color.
        path/d describes the shape; round rounds line ends/corners; size-6 sets the icon size.
        aria-label names this button; aria-controls points to the matching cart panel ID.
      */}
      <button
        type="button"
        onClick={onOpenCart}
        aria-label="Open cart"
        aria-expanded={isCartOpen}
        aria-controls="shopping-cart"
        className="relative flex h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#808080] [@media(max-width:800px)]:col-start-3 [@media(max-width:800px)]:row-start-1"
      >
        {/* This wrapper keeps the cart-icon CSS hook around the supplied SVG graphic. */}
        <span className="cart-icon">
          {/* xmlns identifies SVG; fill="none" leaves its interior clear and stroke draws the outline. */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            {/* d holds the supplied cart coordinates; round caps/joins soften the line ends and corners. */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </span>
        {/* && renders the badge only above zero; the count comes from Layout, so this adds no duplicate state. */}
        {totalItemsQuantity > 0 && (
          // absolute positions this red badge against the relative button; min-w-4 allows more digits to grow.
          <span className="cart-count absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-xs leading-4 text-white">
            {totalItemsQuantity}
          </span>
        )}
      </button>

      {/*
        The account group sits on the right; flex/gap place buttons side by side with space between them.
        At <=800px, move the group to column 4 and replace Sign Up/Login with the small avatar below.
        min-w keeps buttons wide enough; whitespace-nowrap keeps labels on one line; px/py add inner padding.
        type="button" prevents form submission. These buttons do not have onClick handlers or links yet.
      */}
      <div className="flex gap-[10px] justify-self-end [@media(max-width:800px)]:col-start-4 [@media(max-width:800px)]:row-start-1 [@media(max-width:480px)]:gap-[6px]">
        {/* Show this signup label above 800px; type="button" prevents form submission and no action is wired yet. */}
        <button
          className="min-w-[110px] whitespace-nowrap rounded-full border border-[#808080] px-[20px] py-[8px] [@media(max-width:800px)]:hidden"
          type="button"
        >
          Sign Up
        </button>
        {/* This separate login control shares the same dimensions and screen-width rule, with no action yet. */}
        <button
          className="min-w-[110px] whitespace-nowrap rounded-full border border-[#808080] px-[20px] py-[8px] [@media(max-width:800px)]:hidden"
          type="button"
        >
          Login
        </button>

        {/*
          The avatar appears only at <=800px; this does not check whether the user is logged in.
          hidden/flex control visibility; h/w/min-w keep a 44px tap area, and p-[6px] adds inner padding.
          aria-label names the button "Account"; empty alt avoids reading the decorative image twice.
          This button does not have an action to open an account page yet.
        */}
        <button
          className="hidden h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#d1d5db] bg-[#f3f4f6] p-[6px] [@media(max-width:800px)]:flex"
          type="button"
          aria-label="Account"
        >
          {/* Size the decorative image to its circular button; empty alt keeps the Account label from repeating. */}
          <img className="h-full w-full" src="/account-avatar.svg" alt="" />
        </button>
      </div>
    </nav>
  );
};

// Allow OnlineStoreLayout to import and display Navbar.
export default Navbar;
