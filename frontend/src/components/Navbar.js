import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <nav className="container nav-shell" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">C.</span>
          <span>
            COFFEE HOUSE<small>YOUR DAILY LITTLE JOY</small>
          </span>
        </Link>
        <button
          className="btn btn-outline-dark menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <div
          className={`nav-links ${open ? "is-open" : ""}`}
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/products">Our menu</NavLink>
          {user && <NavLink to="/orders">My orders</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to="/cart">
            Bag{" "}
            <span className="cart-count">
              {cartItems.reduce((sum, p) => sum + p.quantity, 0)}
            </span>
          </NavLink>
          {user ? (
            <>
              <span className="user-name">Hi, {user.name.split(" ")[0]}</span>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link className="btn btn-dark btn-sm" to="/login">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
