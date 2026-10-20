/*
 * Customer storefront navbar
 *
 * OnlineStoreLayout renders this component at the storefront route. The shared
 * src/main.jsx loads Tailwind through src/index.css; this component needs no
 * separate navbar stylesheet. All presentation classes below are Tailwind utilities.
 *
 * Responsive layout, measured in CSS viewport pixels:
 * - Above 800px: logo, flexible search, cart, and Sign Up/Login share one row.
 * - At 800px or below: center the logo between balanced left/right spaces,
 *   keep cart/account icons on the right, and move search to a full second row.
 * - At 480px or below: reduce horizontal gaps to 8px and padding to 12px.
 * Explicit media variants preserve these original boundaries instead of using
 * Tailwind's default screen-size breakpoints.
 *
 * Search behavior is independent of the layout classes:
 * - The animated hint is placeholder text, never the customer's input value.
 * - Focus stops and clears the hint; leaving an empty field restarts it.
 * - Typed text remains when focus leaves the field.
 * - Reduced-motion mode shows a still hint instead of the typing animation.
 *
 * This component currently provides the navigation UI only. Product search,
 * cart actions/counts, account dialogs, and real authentication remain future work.
 * The small-screen avatar is selected by screen width, not by a login check.
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

  // Return the navigation markup. The state and timer logic above stay separate
  // from these Tailwind classes, which only control presentation and placement.
  return (
    /*
     * Grid places the four direct child groups in their own columns.
     * Desktop: auto-sized logo/cart/account columns; search gets the remaining space.
     * Narrow layouts explicitly place search on row 2 and the other groups on row 1.
     *
     * At 481-800px, the empty left column is 96px: two 40px controls + a 16px gap.
     * At 480px or below, it becomes 88px: two 40px controls + an 8px gap.
     * Matching the left reservation to the right controls centers the logo in the page.
     * The two column overrides use non-overlapping media conditions so their order
     * in generated CSS cannot change which layout wins at 480px or 800px.
     *
     * gap controls spacing BETWEEN groups; px/py control padding INSIDE the navbar.
     * Only the column gap shrinks on the smallest screens; row spacing stays 16px.
     */
    <nav
      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-6 py-4 [@media(480px<width<=800px)]:grid-cols-[96px_minmax(0,1fr)_40px_40px] [@media(max-width:480px)]:grid-cols-[88px_minmax(0,1fr)_40px_40px] [@media(max-width:480px)]:gap-x-[8px] [@media(max-width:480px)]:p-[12px]"
    >
      {/*
        Store logo
        min-w-0 lets the logo's grid cell shrink without widening the page.
        At 800px or below, column 2 / row 1 is the centered brand position.
        Vite serves public assets from the site root, so this image URL needs no import.
        w-[96px] sets the display width; max-w-full keeps it within its grid cell.
        h-auto preserves its proportions; block and mx-auto center the image in its cell.
        width/height retain the original image dimensions, while Tailwind sets its size.
        alt supplies the store name for assistive technology and a missing image.
      */}
      <div className="min-w-0 [@media(max-width:800px)]:col-start-2 [@media(max-width:800px)]:row-start-1 [@media(max-width:800px)]:text-center">
        <h1>
          <img
            className="w-[96px] max-w-full h-auto block mx-auto"
            src="/SaveSo logo.png"
            alt="SaveSo"
            width={451}
            height={438}
          />
        </h1>
      </div>

      {/*
        Search box
        w-full fills the available grid cell, capped at 640px on wide screens.
        min-w-0 allows shrinking; justify-self-center centers the BOX in its cell.
        The wrapper draws the single gray border and pill-shaped outer corners.
        At 800px or below, col-span-full covers every column on the second row.
        The input then fills that wrapper, inherits its corners, and adds no second border.
        px/py add space around the text; text-center aligns BOTH the hint and typed text.
        Keep the browser's focus outline so keyboard focus remains visible.
        value/onChange manage customer text; placeholder is only the empty-field hint.
        Focus/blur handlers pause or restart the hint without deleting customer text.
      */}
      <div className="w-full max-w-[640px] min-w-0 justify-self-center rounded-full border border-[#808080] [@media(max-width:800px)]:col-span-full [@media(max-width:800px)]:row-start-2">
        <input
          className="w-full min-w-0 px-[14px] py-[10px] border-0 rounded-[inherit] text-center"
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
        Equal 40px width/height plus rounded-full produce a circle.
        The explicit minimum width keeps the icon frame from collapsing.
        Flex with items-center/justify-center centers its contents on both axes.
        The 1px gray border matches search and the guest account buttons.
        On narrow screens the cart occupies column 3 of the top row.
        The count span is a placeholder: real cart data and click behavior are not connected.
      */}
      <div className="flex h-[40px] w-[40px] min-w-[40px] items-center justify-center rounded-full border border-[#808080] [@media(max-width:800px)]:col-start-3 [@media(max-width:800px)]:row-start-1">
        <span className="cart-icon">🛒</span>
        <span className="cart-count"></span>
      </div>

      {/*
        Account controls
        Flex groups the controls in a row; gap adds space between visible controls.
        justify-self-end aligns the whole group to the right of its grid cell.
        At 800px or below the group moves to column 4 of the top row.
        Sign Up/Login are visible above 800px and hidden at smaller widths.
        Each guest button has a 110px minimum width, 8px/20px padding, and gray pill border.
        whitespace-nowrap keeps labels such as "Sign Up" on one line.
        type="button" prevents accidental form submission if this navbar is later in a form.
        These controls still need account-page/dialog actions; width is not authentication state.
      */}
      <div className="flex gap-[10px] justify-self-end [@media(max-width:800px)]:col-start-4 [@media(max-width:800px)]:row-start-1 [@media(max-width:480px)]:gap-[6px]">
        <button
          className="min-w-[110px] whitespace-nowrap rounded-full border border-[#808080] px-[20px] py-[8px] [@media(max-width:800px)]:hidden"
          type="button"
        >
          Sign Up
        </button>
        <button
          className="min-w-[110px] whitespace-nowrap rounded-full border border-[#808080] px-[20px] py-[8px] [@media(max-width:800px)]:hidden"
          type="button"
        >
          Login
        </button>

        {/*
          Small-screen avatar
          hidden removes it from desktop layout; the media variant shows it as flex at <=800px.
          A 40px circle, 6px inner padding, and light gray border/background match the old design.
          The image fills the space inside the padding and stays centered by flex alignment.
          aria-label names the button; empty alt avoids announcing the decorative image twice.
          This is the compact guest account entry point, not evidence that a user is logged in.
        */}
        <button
          className="hidden h-[40px] w-[40px] min-w-[40px] items-center justify-center rounded-full border border-[#d1d5db] bg-[#f3f4f6] p-[6px] [@media(max-width:800px)]:flex"
          type="button"
          aria-label="Account"
        >
          <img className="h-full w-full" src="/account-avatar.svg" alt="" />
        </button>
      </div>
    </nav>
  );
};

// OnlineStoreLayout imports Navbar and places it on the customer storefront.
export default Navbar;
