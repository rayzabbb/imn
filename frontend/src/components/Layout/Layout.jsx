import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { logoutUser } from "../../slices/userSlice";
import "./Layout.css"; // סגנונות לסרגל ניווט

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useSelector((state) => state.user);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    closeMenu();
    navigate("/");
  };

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

            {isLoggedIn ? (
              <div className="navbar-user navbar-user--logged-in">
                <Link to="/profile" className="navbar-user-name" onClick={closeMenu}>
                  <PersonOutlineIcon fontSize="small" />
                  {currentUser.username}
                </Link>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="התנתקות"
                  onClick={handleLogout}
                >
                  <LogoutIcon fontSize="small" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="icon-btn navbar-user" aria-label="התחברות">
                <PersonOutlineIcon fontSize="small" />
              </Link>
            )}

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
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="navbar-user-mobile" onClick={closeMenu}>
                  <PersonOutlineIcon fontSize="small" />
                  <span>אזור אישי ({currentUser.username})</span>
                </Link>
                <button type="button" className="navbar-user-mobile" onClick={handleLogout}>
                  <LogoutIcon fontSize="small" />
                  <span>התנתקות</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar-user-mobile" onClick={closeMenu}>
                <PersonOutlineIcon fontSize="small" />
                <span>התחברות</span>
              </Link>
            )}
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
