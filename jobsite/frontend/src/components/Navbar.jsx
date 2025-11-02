import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Globe, Menu, X, User } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn("Failed to parse user from localStorage");
      }
    }
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Redirect to Explore page with search param
    navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        {/* Logo */}
        <div className="logo-container">
          <Link to="/" className="logo">
            Sideline
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="nav-links">
          <NavLink to="/explore" className="nav-link">
            Explore
          </NavLink>
          <NavLink to="/find-work" className="nav-link">
            Find Work
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
        </nav>

        {/* Search */}
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search jobs, skills, companies..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Auth Buttons */}
        <div className="header-right">
          <button className="icon-btn">
            <Globe size={20} />
          </button>
          {user ? (
            <Link to="/profile" className="icon-btn">
              <User size={20} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
          <button className="icon-btn menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
