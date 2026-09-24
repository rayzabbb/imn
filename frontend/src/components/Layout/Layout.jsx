import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import "./Layout.css"; // סגנונות לסרגל ניווט

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div>
      <header className="site-navbar" dir="rtl">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <span className="brand-icon">
              <StorefrontIcon fontSize="small" />
            </span>
            <span className="brand-name">פכים קטנים</span>
          </Link>

          <nav className="navbar-links navbar-links--desktop">
            <Link to="/" className="navbar-link">דף הבית</Link>
            <Link to="/category" className="navbar-link">קטגוריות</Link>
            <Link to="/about" className="navbar-link">עלינו</Link>
          </nav>

          <div className="navbar-actions">
            <button
              type="button"
              className={`icon-btn navbar-search-toggle ${isSearchOpen ? "icon-btn--active" : ""}`}
              onClick={() => setIsSearchOpen((open) => !open)}
              aria-label="חיפוש"
              aria-expanded={isSearchOpen}
            >
              <SearchIcon fontSize="small" />
            </button>

            <Link to="/publish" className="publish-btn" onClick={closeMenu}>
              <AddIcon fontSize="small" />
              <span>פרסום חפץ</span>
            </Link>

            <button type="button" className="icon-btn navbar-user" aria-label="אזור אישי">
              <PersonOutlineIcon fontSize="small" />
            </button>

            <button
              type="button"
              className="icon-btn navbar-menu-toggle"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="תפריט"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="navbar-search-panel">
            <SearchIcon fontSize="small" className="navbar-search-panel-icon" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="חיפוש חפצים..."
              autoFocus
            />
          </div>
        )}

        {isMenuOpen && (
          <div className="navbar-mobile-panel">
            <nav className="navbar-links navbar-links--mobile">
              <Link to="/" className="navbar-link" onClick={closeMenu}>דף הבית</Link>
              <Link to="/category" className="navbar-link" onClick={closeMenu}>קטגוריות</Link>
              <Link to="/about" className="navbar-link" onClick={closeMenu}>עלינו</Link>
            </nav>
            <button type="button" className="navbar-user-mobile">
              <PersonOutlineIcon fontSize="small" />
              <span>אזור אישי</span>
            </button>
          </div>
        )}
      </header>

      <div className="content">
        <Outlet /> {/* כאן ייכנסו כל הדפים */}
      </div>
    </div>
  );
};

export default Layout;
