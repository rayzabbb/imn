/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { fetchAllProducts, fetchCategories } from "../../slices/categorySlice";
import { resolveImageUrl } from "../../services/imageUrl";
import HorizontalScroller from "../common/HorizontalScroller";
import { iconForCategory, TINT_COUNT } from "../common/categoryIcons";
import "./HomePage.css";

const FEATURED_COUNT = 12;

const QUALITY_CLASS = {
  "חדש": "hp-badge--new",
  "כמו חדש": "hp-badge--like-new",
  "משומש": "hp-badge--used",
};

const ProductTile = ({ product, index }) => (
  <Link to={`/product/${product.id}`} className="hp-product">
    <div className={`hp-product-media hp-tint-${index % TINT_COUNT}`}>
      {product.imageUrl ? (
        <img src={resolveImageUrl(product.imageUrl)} alt={product.name} loading="lazy" />
      ) : (
        <Inventory2OutlinedIcon className="hp-product-placeholder" />
      )}
      {product.quality && (
        <span className={`hp-badge ${QUALITY_CLASS[product.quality] || ""}`}>{product.quality}</span>
      )}
    </div>
    <div className="hp-product-body">
      <h3 className="hp-product-name">{product.name}</h3>
      <div className="hp-product-meta">
        <span className="hp-product-brand">{product.manufacturerNameOrBrand || "ללא מותג"}</span>
        {product.status === "AT_CENTER" ? (
          <span className="hp-product-status">
            <WarehouseOutlinedIcon fontSize="inherit" /> במרכז האיסוף
          </span>
        ) : (
          <span className="hp-product-free">חינם</span>
        )}
      </div>
    </div>
  </Link>
);

const HomePage = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    loading: categoriesLoading,
    allProducts = [],
    allProductsLoading,
    allProductsError,
  } = useSelector((state) => state.category);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const categoryList = Array.isArray(categories) ? categories : [];
  const productList = useMemo(() => (Array.isArray(allProducts) ? allProducts : []), [allProducts]);

  // אין במערכת סימון "מומלץ" - מציגים את החפצים החדשים ביותר, ומקדימים את אלה שיש להם תמונה
  const featuredProducts = useMemo(
    () =>
      [...productList]
        .sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)) || Number(b.id) - Number(a.id))
        .slice(0, FEATURED_COUNT),
    [productList]
  );

  // The hero search looks through ALL available products and shows the matches in the product row
  const activeSearch = searchTerm.trim();
  const searchResults = useMemo(() => {
    const term = activeSearch.toLowerCase();
    if (!term) return [];
    return productList
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.manufacturerNameOrBrand?.toLowerCase().includes(term)
      )
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [productList, activeSearch]);

  const rowProducts = activeSearch ? searchResults : featuredProducts;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const isCategoriesLoading = categoriesLoading && categoryList.length === 0;
  const isProductsLoading = allProductsLoading && productList.length === 0;
  const heroPreview = featuredProducts.slice(0, 3);

  return (
    <div className="hp" dir="rtl">
      {/* ===== Hero ===== */}
      <section className="hp-hero">
        <div className="hp-hero-copy">
          <span className="hp-eyebrow">
            <VolunteerActivismOutlinedIcon fontSize="inherit" />
            קהילה משתפת חפצים
          </span>
          <h1 className="hp-title">
            מוצאים. משתפים. <span>מוסרים הלאה.</span>
          </h1>
          <p className="hp-subtitle">
            פרסמו חפצים שכבר לא צריכים, גלו מה השכנים מוסרים ותנו לדברים חיים חדשים. בחינם ובלב פתוח.
          </p>

          <form className="hp-search" onSubmit={handleSearchSubmit} role="search">
            <SearchIcon className="hp-search-icon" />
            <input
              type="text"
              placeholder="חפשו חפץ, למשל ספה או אופניים"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="חיפוש חפצים"
            />
            <button type="submit">חיפוש</button>
          </form>

          <ul className="hp-stats" aria-label="נתוני הקהילה">
            <li>
              <strong>{productList.length || "—"}</strong> חפצים זמינים
            </li>
            <li>
              <strong>{categoryList.length || "—"}</strong> קטגוריות
            </li>
            <li>
              <strong>100%</strong> בחינם
            </li>
          </ul>
        </div>

        {/* Live preview of real, recently published items */}
        <div className="hp-hero-art" aria-hidden="true">
          <div className="hp-hero-blob" />
          <div className="hp-hero-ring" />
          {heroPreview.map((product, i) => (
            <div key={product.id} className={`hp-float hp-float--${i}`}>
              <span className={`hp-float-thumb hp-tint-${i}`}>
                {product.imageUrl ? (
                  <img src={resolveImageUrl(product.imageUrl)} alt="" />
                ) : (
                  <Inventory2OutlinedIcon />
                )}
              </span>
              <span className="hp-float-text">
                <strong>{product.name}</strong>
                <small>{product.quality || "חדש בקהילה"}</small>
              </span>
            </div>
          ))}
          <div className="hp-hero-badge">
            <VolunteerActivismOutlinedIcon />
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="hp-section" aria-labelledby="hp-categories-title">
        <header className="hp-section-head">
          <div>
            <h2 id="hp-categories-title">קטגוריות</h2>
            <p>בחרו תחום והתחילו לגלות</p>
          </div>
          <Link to="/category" className="hp-more">
            לכל הקטגוריות <ArrowBackIcon fontSize="inherit" />
          </Link>
        </header>

        <HorizontalScroller
          className="hp-scroller"
          trackClassName="hp-track hp-track--categories"
          contentKey={categoryList.length}
          prevLabel="קטגוריות קודמות"
          nextLabel="קטגוריות נוספות"
        >
          {isCategoriesLoading &&
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="hp-category hp-skeleton" />)}

          {categoryList.map((category, i) => {
            const Icon = iconForCategory(category.name);
            const subCount = Array.isArray(category.subCategories) ? category.subCategories.length : null;
            return (
              <Link
                key={category.id}
                to="/category"
                state={{ categoryId: category.id }}
                className="hp-category"
              >
                <span className={`hp-category-icon hp-tint-${i % TINT_COUNT}`}>
                  {category.imageUrl ? (
                    <img src={resolveImageUrl(category.imageUrl)} alt="" loading="lazy" />
                  ) : (
                    <Icon />
                  )}
                </span>
                <span className="hp-category-name">{category.name}</span>
                {subCount !== null && <span className="hp-category-count">{subCount} תתי קטגוריה</span>}
              </Link>
            );
          })}
        </HorizontalScroller>
      </section>

      {/* ===== Featured products (one row) / search results ===== */}
      <section className="hp-section" aria-labelledby="hp-featured-title">
        <header className="hp-section-head">
          <div>
            <h2 id="hp-featured-title">{activeSearch ? `תוצאות עבור "${activeSearch}"` : "מוצרים מומלצים"}</h2>
            <p>
              {activeSearch
                ? `${searchResults.length} חפצים נמצאו מתוך ${productList.length}`
                : "החפצים החדשים ביותר שפורסמו בקהילה"}
            </p>
          </div>
          {activeSearch ? (
            <button type="button" className="hp-more" onClick={clearSearch}>
              <CloseIcon fontSize="inherit" /> ניקוי החיפוש
            </button>
          ) : (
            <Link to="/category" className="hp-more">
              גלו עוד <ArrowBackIcon fontSize="inherit" />
            </Link>
          )}
        </header>

        {!allProductsLoading && allProductsError && productList.length === 0 && (
          <div className="hp-state hp-state--error">
            <ErrorOutlineIcon /> אירעה שגיאה בטעינת המוצרים. נסו לרענן את הדף.
          </div>
        )}
        {!allProductsLoading && !allProductsError && productList.length === 0 && (
          <div className="hp-state">
            <Inventory2OutlinedIcon /> עדיין לא פורסמו חפצים.
          </div>
        )}
        {activeSearch && productList.length > 0 && searchResults.length === 0 && (
          <div className="hp-state">
            <SearchIcon /> לא נמצאו חפצים התואמים את החיפוש. נסו מילה אחרת.
          </div>
        )}

        {(isProductsLoading || rowProducts.length > 0) && (
          <HorizontalScroller
            key={activeSearch /* a new search starts from the beginning of the row */}
            className="hp-scroller"
            trackClassName="hp-track hp-track--products"
            contentKey={rowProducts.length}
            prevLabel="מוצרים קודמים"
            nextLabel="מוצרים נוספים"
          >
            {isProductsLoading &&
              Array.from({ length: 7 }).map((_, i) => <div key={i} className="hp-product hp-skeleton" />)}
            {rowProducts.map((product, i) => (
              <ProductTile key={product.id} product={product} index={i} />
            ))}
          </HorizontalScroller>
        )}
      </section>
    </div>
  );
};

export default HomePage;
