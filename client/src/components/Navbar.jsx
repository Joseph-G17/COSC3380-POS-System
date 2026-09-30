const Navbar = () => {
  return (
    <nav>
      <div className="store-name">
        {/* Store Name */}
        <h1>Team 2 Grocery Store</h1>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="What are you looking for?" />
      </div>

      <div className="cart">
        <span className="cart-icon">🛒</span>
        <span className="cart-count"></span>
      </div>

      <div className="signup-login">
        <button className="signup-button">Sign Up</button>
        <button className="login-button">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;
