import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./Layout.css"; // סגנונות לסרגל ניווט

const Layout = () => {
  return (
    <div>
      <nav className="nav-bar">
        <Link to="/">דף הבית</Link>
        <Link to="/category">קטגוריות</Link>
        <Link to="/about">עלינו</Link>
      </nav>

      <div className="content">
        <Outlet /> {/* כאן ייכנסו כל הדפים */}
      </div>
    </div>
  );
};

export default Layout;
