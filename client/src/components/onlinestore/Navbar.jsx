// Online Store header: shared search, cart controls and customer account links.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Show this animated hint only while the search field is idle.
const SEARCH_HINT = "What are you looking for?";

// Typing, deleting and pause delays are in milliseconds.
const TYPE_DELAY_MS = 90;
const DELETE_DELAY_MS = 45;
const FULL_HINT_PAUSE_MS = 1800;
const RESTART_PAUSE_MS = 500;

// This browser value is only a demo greeting, never proof of API access.
function loadCustomer() {
  try {
    const customer = JSON.parse(sessionStorage.getItem("saveso.customer"));
    if (customer && customer.customerID && typeof customer.firstName === "string") {
      return { customerID: customer.customerID, firstName: customer.firstName };
    }
  } catch {
    // Invalid or blocked storage leaves the public store in guest mode.
  }
  return null;
}

// Layout supplies the cart controls and shared search value.
const Navbar = ({ totalItemsQuantity, onOpenCart, isCartOpen, searchText, onSearchChange }) => {
  // Read the greeting once when this header first opens.
  const [customer, setCustomer] = useState(loadCustomer);

  // Log out clears this tab's greeting only; it does not revoke server access.
  function logOutCustomer() {
    try {
      sessionStorage.removeItem("saveso.customer");
    } catch {
      // The greeting on this page can still be cleared if storage is blocked.
    }
    setCustomer(null);
  }

  // Pause the hint while the customer types in the shared search field.
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // The hint is separate from the customer's search text.
  const [searchHint, setSearchHint] = useState("");

  // Respect the visitor's reduced-motion preference.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Listen for preference changes and remove the listener when this header closes.
  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleMotionChange = (event) => {
      setPrefersReducedMotion(event.matches);
      setSearchHint("");
    };
    motionPreference.addEventListener("change", handleMotionChange);
    return () =>
      motionPreference.removeEventListener("change", handleMotionChange);
  }, []);

  // Restart the idle hint when focus, search text or motion preference changes.
  useEffect(() => {
    if (isSearchFocused || searchText !== "" || prefersReducedMotion) {
      return;
    }

    // Keep these values inside one animation cycle.
    let characterCount = 0;
    let isDeleting = false;
    let timerId;

    // Each timer step adds or removes one letter, then schedules the next step.
    function updateHint() {
      if (isDeleting) {
        characterCount--;
      } else {
        characterCount++;
      }

      setSearchHint(SEARCH_HINT.slice(0, characterCount));

      // Pause at the complete hint before deleting.
      if (!isDeleting && characterCount === SEARCH_HINT.length) {
        isDeleting = true;
        timerId = window.setTimeout(updateHint, FULL_HINT_PAUSE_MS);
        return;
      }

      // Pause at an empty hint before typing again.
      if (isDeleting && characterCount === 0) {
        isDeleting = false;
        timerId = window.setTimeout(updateHint, RESTART_PAUSE_MS);
        return;
      }

      const nextDelay = isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS;
      timerId = window.setTimeout(updateHint, nextDelay);
    }

    timerId = window.setTimeout(updateHint, RESTART_PAUSE_MS);

    // Cancel the pending step when this effect restarts or the header closes.
    return () => window.clearTimeout(timerId);
  }, [isSearchFocused, searchText, prefersReducedMotion]);

  return (
    // Keep logo, search, cart and account controls usable on narrow screens.
    <nav className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-6 py-4 [@media(480px<width<=800px)]:grid-cols-[104px_minmax(0,1fr)_44px_44px] [@media(max-width:480px)]:grid-cols-[96px_minmax(0,1fr)_44px_44px] [@media(max-width:480px)]:gap-x-[8px] [@media(max-width:480px)]:p-[12px]">
      {/* Return to the shop without clearing the shared cart. */}
      <Link to="/" aria-label="SaveSo home" className="min-w-0 [@media(max-width:800px)]:col-start-2 [@media(max-width:800px)]:row-start-1 [@media(max-width:800px)]:text-center">
        <h1>
          <img
            className="w-[96px] max-w-full h-auto block mx-auto"
            src="/SaveSolLogo.png"
            alt="SaveSo"
            width={451}
            height={438}
          />
        </h1>
      </Link>

      {/* Search stays in Layout so typing from Checkout can open matching shop results. */}
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
          // Send new text to Layout; the updated value returns through props.
          onChange={(event) => onSearchChange(event.target.value)}
          // Focus pauses the animation without changing the customer's search.
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

      {/* Display Layout's quantity and open its cart panel. */}
      <button
        type="button"
        onClick={onOpenCart}
        aria-label="Open cart"
        aria-expanded={isCartOpen}
        aria-controls="shopping-cart"
        className="relative flex h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#808080] [@media(max-width:800px)]:col-start-3 [@media(max-width:800px)]:row-start-1"
      >
        <span className="cart-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </span>
        {/* Show the badge only when the cart contains units. */}
        {totalItemsQuantity > 0 && (
          <span className="cart-count absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-xs leading-4 text-white">
            {totalItemsQuantity}
          </span>
        )}
      </button>

      {/* Desktop and mobile controls open the same customer account flow. */}
      <div className="relative flex min-w-0 gap-[10px] justify-self-end [@media(max-width:800px)]:col-start-4 [@media(max-width:800px)]:row-start-1 [@media(max-width:480px)]:gap-[6px]">
        {customer ? (
          <div className="hidden items-center gap-3 [@media(min-width:801px)]:flex">
            <span className="max-w-40 truncate" title={customer.firstName}>Hi, {customer.firstName}</span>
            <button type="button" onClick={logOutCustomer} className="min-h-11 rounded-full border border-[#808080] px-5 py-2">
              Log out
            </button>
          </div>
        ) : (
          <>
            <a className="hidden min-h-11 min-w-[110px] items-center justify-center whitespace-nowrap rounded-full border border-[#808080] px-[20px] py-[8px] [@media(min-width:801px)]:inline-flex" href="/customer/signup">Sign Up</a>
            <a className="hidden min-h-11 min-w-[110px] items-center justify-center whitespace-nowrap rounded-full border border-[#808080] px-[20px] py-[8px] [@media(min-width:801px)]:inline-flex" href="/customer/login">Login</a>
          </>
        )}

        {customer ? (
          <details className="relative hidden [@media(max-width:800px)]:block">
            <summary aria-label={`Customer account for ${customer.firstName}`} className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#d1d5db] bg-[#f3f4f6] p-[6px] [&::-webkit-details-marker]:hidden">
              <img className="h-full w-full" src="/account-avatar.svg" alt="" />
            </summary>
            <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
              <p className="whitespace-normal break-words text-sm [text-wrap:wrap]">Hi, {customer.firstName}</p>
              <button type="button" onClick={logOutCustomer} className="mt-3 min-h-11 w-full rounded-lg border border-gray-500 px-3 py-2">
                Log out
              </button>
            </div>
          </details>
        ) : (
          <a className="hidden h-11 w-11 min-w-11 items-center justify-center rounded-full border border-[#d1d5db] bg-[#f3f4f6] p-[6px] [@media(max-width:800px)]:flex" href="/customer/login" aria-label="Customer account">
            <img className="h-full w-full" src="/account-avatar.svg" alt="" />
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
