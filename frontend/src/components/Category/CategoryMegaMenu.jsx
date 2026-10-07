/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { resolveImageUrl } from "../../services/imageUrl";
import { iconForCategory, TINT_COUNT } from "../common/categoryIcons";
import "./CategoryMegaMenu.css";

const OPEN_DELAY = 90; // hover intent: sweeping the cursor across the bar shouldn't flash every panel
const CLOSE_DELAY = 180; // grace period for moving from the bar down into the panel

const asList = (value) => (Array.isArray(value) ? value : []);

/**
 * Horizontal category bar with a mega-menu panel per category, listing that
 * category's real subcategories. Hover opens it (mouse), tap toggles it
 * (touch), and focus/Enter/Escape work from the keyboard. The bar and the
 * panel live in one wrapper, so moving the cursor between them keeps it open.
 */
const CategoryMegaMenu = ({ categories, subCategoryList, selectedCategoryId, onSelectCategory, onNeedSubCategories }) => {
  const [openId, setOpenId] = useState(null);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const lastPointerType = useRef("mouse");
  const wrapperRef = useRef(null);
  const [stickyTop, setStickyTop] = useState(64);

  // Stick right under the site's (sticky) navbar, whatever its height on this screen
  useLayoutEffect(() => {
    const navbar = document.querySelector(".site-navbar");
    if (!navbar) return undefined;
    const update = () => setStickyTop(navbar.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  // Close when tapping/clicking anywhere outside the menu
  useEffect(() => {
    if (openId === null) return undefined;
    const handlePointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpenId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openId]);

  const subCategoriesOf = (category) => {
    if (Array.isArray(category.subCategories)) return category.subCategories;
    return asList(subCategoryList[category.id]);
  };

  const open = (categoryId, immediate = false) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    const category = categories.find((c) => c.id === categoryId);
    if (category && !Array.isArray(category.subCategories) && subCategoryList[categoryId] === undefined) {
      onNeedSubCategories(categoryId);
    }
    // Switching between categories while a panel is already open should feel instant
    if (immediate || openId !== null) {
      setOpenId(categoryId);
    } else {
      openTimer.current = setTimeout(() => setOpenId(categoryId), OPEN_DELAY);
    }
  };

  const scheduleClose = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY);
  };

  const close = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    setOpenId(null);
  };

  const handleItemClick = (categoryId) => {
    // Touch has no hover: the first tap opens the panel, a second tap selects the category
    if (lastPointerType.current === "touch" && openId !== categoryId) {
      open(categoryId, true);
      return;
    }
    close();
    onSelectCategory(categoryId);
  };

  const openCategory = categories.find((c) => c.id === openId);
  const openIndex = categories.findIndex((c) => c.id === openId);
  const openSubCategories = openCategory ? subCategoriesOf(openCategory) : [];
  const isLoadingOpen =
    openCategory && !Array.isArray(openCategory.subCategories) && subCategoryList[openCategory.id] === undefined;

  if (categories.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className={`mega ${openCategory ? "mega--open" : ""}`}
      style={{ top: stickyTop }}
      onMouseLeave={scheduleClose}
      onMouseEnter={() => clearTimeout(closeTimer.current)}
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <nav className="mega-bar" aria-label="ניווט קטגוריות">
        <ul className="mega-bar-list">
          {categories.map((category) => {
            const isOpen = category.id === openId;
            const isSelected = category.id === selectedCategoryId;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className={`mega-bar-item ${isOpen ? "mega-bar-item--open" : ""} ${
                    isSelected ? "mega-bar-item--selected" : ""
                  }`}
                  aria-expanded={isOpen}
                  aria-controls="mega-panel"
                  onPointerDown={(e) => {
                    lastPointerType.current = e.pointerType;
                  }}
                  onMouseEnter={() => open(category.id)}
                  // keyboard focus only - a tap/click also focuses, and is handled by onClick
                  onFocus={(e) => e.target.matches(":focus-visible") && open(category.id, true)}
                  onClick={() => handleItemClick(category.id)}
                >
                  {category.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {openCategory && (
        <div id="mega-panel" className="mega-panel" role="region" aria-label={`תתי קטגוריה של ${openCategory.name}`}>
          <div className="mega-panel-inner" key={openCategory.id}>
            <aside className="mega-panel-intro">
              <span className={`mega-intro-icon mega-tint-${openIndex % TINT_COUNT}`}>
                {openCategory.imageUrl ? (
                  <img src={resolveImageUrl(openCategory.imageUrl)} alt="" />
                ) : (
                  React.createElement(iconForCategory(openCategory.name))
                )}
              </span>
              <h3>{openCategory.name}</h3>
              {openCategory.description && <p>{openCategory.description}</p>}
              <button
                type="button"
                className="mega-intro-link"
                onClick={() => {
                  close();
                  onSelectCategory(openCategory.id);
                }}
              >
                לכל המוצרים בקטגוריה
                <ArrowBackIcon fontSize="inherit" />
              </button>
            </aside>

            <div className="mega-panel-main">
              <span className="mega-panel-label">
                {isLoadingOpen ? "טוען תתי קטגוריה..." : `${openSubCategories.length} תתי קטגוריה`}
              </span>

              {!isLoadingOpen && openSubCategories.length === 0 && (
                <p className="mega-empty">אין עדיין תתי קטגוריה בקטגוריה זו.</p>
              )}

              <ul className="mega-grid">
                {openSubCategories.map((subCategory, i) => (
                  <li key={subCategory.id}>
                    <Link
                      to={`/products/${subCategory.id}`}
                      className="mega-sub"
                      onClick={close}
                      style={{ animationDelay: `${Math.min(i, 12) * 22}ms` }}
                    >
                      <span className={`mega-sub-visual mega-tint-${(openIndex + i + 1) % TINT_COUNT}`}>
                        {subCategory.imageUrl ? (
                          <img src={resolveImageUrl(subCategory.imageUrl)} alt="" loading="lazy" />
                        ) : (
                          <LabelOutlinedIcon />
                        )}
                      </span>
                      <span className="mega-sub-name">{subCategory.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMegaMenu;
