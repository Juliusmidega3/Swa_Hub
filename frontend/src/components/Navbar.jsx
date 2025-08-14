import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "🏠 Home" },
    { path: "/lessons", label: "📚 Lessons" },
    { path: "/tests", label: "📝 Tests" },
    { path: "/results", label: "📊 Results" },
    { path: "/teacher", label: "👩‍🏫 Teacher" },
    { path: "/dashboard", label: "📈 Dashboard" },
  ];

  return (
    <nav className="navbar">
      <h1 className="logo">🌟 FunLearn</h1>

      <div className="hamburger" onClick={() => setOpen(!open)}>
        <span className={`bar ${open ? "open" : ""}`}></span>
        <span className={`bar ${open ? "open" : ""}`}></span>
        <span className={`bar ${open ? "open" : ""}`}></span>
      </div>

      <ul className={`nav-links ${open ? "open" : ""}`}>
        {navLinks.map(
          (link) =>
            (token || link.path === "/login") && (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={location.pathname === link.path ? "active" : ""}
                  onClick={() => setOpen(false)} // close menu on click
                >
                  {link.label}
                </Link>
              </li>
            )
        )}
        {token && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              🔒 Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
