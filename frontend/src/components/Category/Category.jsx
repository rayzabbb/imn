import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AppsIcon from "@mui/icons-material/Apps";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  fetchCategories,
  fetchSubCategoriesByCategory,
  fetchProductsBySubCategory,
} from "../../slices/categorySlice";
import { resolveImageUrl } from "../../services/imageUrl";
import HorizontalScroller from "../common/HorizontalScroller";
import ProductCard from "../Products/ProductCard";
import CategoryMegaMenu from "./CategoryMegaMenu";
import { iconForCategory } from "../common/categoryIcons";
import "./Category.css";

// The API answers 204 (empty body) for "nothing here", which lands in the store as "".
const asList = (value) => (Array.isArray(value) ? value : []);

const Category = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    subCategoryList = {},
    products: productsBySubCategory = {},
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.category) || {};

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null); // null = all subcategories
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategoriesError, setSubCategoriesError] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const showcaseRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const categoryList = asList(categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => () => clearTimeout(scrollTimeoutRef.current), []);

  // גלילה חלקה לאזור תתי הקטגוריות, תוך התחשבות בסרגל הניווט הדביק
  const scrollToSubCategories = (delay) => {
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const showcase = showcaseRef.current;
      if (!showcase) {
        return;
      }
      // both the site navbar and the sticky category bar sit over the top of the page
      const navbarHeight = document.querySelector(".site-navbar")?.offsetHeight || 0;
      const megaBarHeight = document.querySelector(".mega-bar")?.offsetHeight || 0;
      const top = showcase.getBoundingClientRect().top + window.scrollY - navbarHeight - megaBarHeight - 16;
      window.scrollTo({ top, behavior: "smooth" });
    }, delay);
  };

  const handleCategoryClick = (categoryId) => {
    // בפתיחה הראשונה ממתינים לסיום אנימציית הפתיחה (0.35s) כדי שהמיקום יהיה סופי
    scrollToSubCategories(selectedCategoryId ? 0 : 360);
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null);
    setSubCategoriesError(null);

    // כבר נטענו תתי הקטגוריות עבור קטגוריה זו - אין צורך לבקש שוב
    if (subCategoryList[categoryId] !== undefined) {
      return;
    }

    setSubCategoriesLoading(true);
    dispatch(fetchSubCategoriesByCategory(categoryId))
      .unwrap()
      .catch((err) => {
        setSubCategoriesError(err?.message || "אירעה שגיאה בטעינת תתי הקטגוריות");
      })
      .finally(() => {
        setSubCategoriesLoading(false);
      });
  };

  // הגעה מכרטיס קטגוריה בדף הבית: פותחים את הקטגוריה המבוקשת פעם אחת, אחרי שהרשימה נטענה
  const location = useLocation();
  const pendingCategoryIdRef = useRef(location.state?.categoryId ?? null);
  useEffect(() => {
    const pendingId = pendingCategoryIdRef.current;
    if (pendingId == null || categoryList.length === 0) {
      return;
    }
    pendingCategoryIdRef.current = null;
    if (categoryList.some((c) => c.id === pendingId)) {
      handleCategoryClick(pendingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryList.length]);

  const selectedCategory = categoryList.find((c) => c.id === selectedCategoryId);
  const rawSubCategories = selectedCategoryId ? subCategoryList[selectedCategoryId] : undefined;
  const selectedSubCategories = useMemo(() => asList(rawSubCategories), [rawSubCategories]);
  const subCategoriesLoaded = rawSubCategories !== undefined;

  // מוצרי הקטגוריה: אין endpoint לפי קטגוריה, ולכן טוענים (פעם אחת) את המוצרים של כל תת-קטגוריה
  useEffect(() => {
    if (!subCategoriesLoaded || selectedSubCategories.length === 0) {
      return;
    }
    const missing = selectedSubCategories.filter((sc) => productsBySubCategory[sc.id] === undefined);
    if (missing.length === 0) {
      return;
    }
    let cancelled = false;
    setProductsLoading(true);
    setProductsError(null);
    Promise.all(missing.map((sc) => dispatch(fetchProductsBySubCategory(sc.id)).unwrap()))
      .catch(() => {
        if (!cancelled) setProductsError("אירעה שגיאה בטעינת המוצרים. נסו שוב.");
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // productsBySubCategory is deliberately left out: it changes as these very requests land
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedCategoryId, subCategoriesLoaded, selectedSubCategories]);

  const visibleProducts = useMemo(() => {
    const source = selectedSubCategoryId
      ? [selectedSubCategoryId]
      : selectedSubCategories.map((sc) => sc.id);
    return source
      .flatMap((id) => asList(productsBySubCategory[id]))
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [selectedSubCategoryId, selectedSubCategories, productsBySubCategory]);

  const selectedSubCategory = selectedSubCategories.find((sc) => sc.id === selectedSubCategoryId);
  const isInitialLoad = categoriesLoading && categoryList.length === 0;

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return categoryList;
    }
    return categoryList.filter((category) => category.name?.toLowerCase().includes(term));
  }, [categoryList, searchTerm]);

  const hasNoSearchResults =
    categoryList.length > 0 && searchTerm.trim() !== "" && filteredCategories.length === 0;

  const productCountFor = (subCategoryId) => {
    const list = productsBySubCategory[subCategoryId];
    return list === undefined ? null : asList(list).length;
  };

  const showProductsSkeleton = productsLoading && visibleProducts.length === 0;

  return (
    <div className="categories-page" dir="rtl">
      {/* ===== Category bar with mega-menu (hover a category to see its subcategories) ===== */}
      <CategoryMegaMenu
        categories={categoryList}
        subCategoryList={subCategoryList}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleCategoryClick}
        onNeedSubCategories={(categoryId) => dispatch(fetchSubCategoriesByCategory(categoryId))}
      />

      {/* ===== Title ===== */}
      <div className="categories-page-header">
        <h1>קטגוריות</h1>
        <p>בחרו קטגוריה, דפדפו בין תתי-הקטגוריות וגלו את החפצים שמחכים לבית חדש</p>

        <div className="categories-search">
          <SearchIcon fontSize="small" className="categories-search-icon" />
          <input
            type="text"
            className="categories-search-input"
            placeholder="חיפוש קטגוריה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ===== Main categories (circular cards, horizontal) ===== */}
      {isInitialLoad && (
        <div className="cat-circles-row" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="cat-circle-card">
              <span className="cat-circle cat-skeleton" />
              <span className="cat-skeleton cat-skeleton-line" />
            </div>
          ))}
        </div>
      )}

      {!categoriesLoading && categoriesError && categoryList.length === 0 && (
        <div className="state-banner state-banner--error">
          <ErrorOutlineIcon />
          <span>אירעה שגיאה בטעינת הקטגוריות. נסו לרענן את הדף.</span>
        </div>
      )}

      {!categoriesLoading && !categoriesError && categoryList.length === 0 && (
        <div className="state-banner state-banner--empty">
          <Inventory2OutlinedIcon />
          <span>אין עדיין קטגוריות להצגה.</span>
        </div>
      )}

      {hasNoSearchResults && (
        <div className="state-banner state-banner--empty">
          <SearchIcon />
          <span>לא נמצאו קטגוריות התואמות את החיפוש &quot;{searchTerm}&quot;.</span>
        </div>
      )}

      {filteredCategories.length > 0 && (
        <HorizontalScroller
          trackClassName="cat-circles-row"
          contentKey={filteredCategories.length}
          prevLabel="קטגוריות קודמות"
          nextLabel="קטגוריות נוספות"
        >
          {filteredCategories.map((category) => {
            const isSelected = category.id === selectedCategoryId;
            const subCount = Array.isArray(category.subCategories) ? category.subCategories.length : null;
            const Icon = iconForCategory(category.name);

            return (
              <button
                key={category.id}
                type="button"
                className={`cat-circle-card ${isSelected ? "cat-circle-card--selected" : ""}`}
                onClick={() => handleCategoryClick(category.id)}
                aria-pressed={isSelected}
              >
                <span className="cat-circle">
                  {category.imageUrl ? (
                    <img src={resolveImageUrl(category.imageUrl)} alt="" loading="lazy" />
                  ) : (
                    <Icon />
                  )}
                  {isSelected && <CheckCircleIcon className="cat-circle-check" />}
                </span>
                <span className="cat-circle-name">{category.name}</span>
                {subCount !== null && <span className="cat-circle-count">{subCount} תתי קטגוריה</span>}
              </button>
            );
          })}
        </HorizontalScroller>
      )}

      {/* ===== Subcategories + products of the selected category ===== */}
      <div
        ref={showcaseRef}
        className={`subcategories-showcase ${selectedCategoryId ? "subcategories-showcase--open" : ""}`}
      >
        {selectedCategoryId && (
          <div className="subcategories-showcase-inner">
            <div className="cat-section-header">
              <h2>תתי קטגוריה{selectedCategory ? ` · ${selectedCategory.name}` : ""}</h2>
              {selectedCategory?.description && <p>{selectedCategory.description}</p>}
            </div>

            {subCategoriesLoading && (
              <div className="subcat-row" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="subcat-card subcat-card--skeleton cat-skeleton" />
                ))}
              </div>
            )}

            {!subCategoriesLoading && subCategoriesError && (
              <div className="state-banner state-banner--error">
                <ErrorOutlineIcon />
                <span>{subCategoriesError}</span>
              </div>
            )}

            {!subCategoriesLoading && !subCategoriesError && subCategoriesLoaded && selectedSubCategories.length === 0 && (
              <div className="state-banner state-banner--empty">
                <Inventory2OutlinedIcon />
                <span>אין תתי קטגוריה עבור קטגוריה זו.</span>
              </div>
            )}

            {!subCategoriesLoading && !subCategoriesError && selectedSubCategories.length > 0 && (
              <>
                <HorizontalScroller
                  trackClassName="subcat-row"
                  contentKey={`${selectedCategoryId}-${selectedSubCategories.length}`}
                  prevLabel="תתי קטגוריה קודמות"
                  nextLabel="תתי קטגוריה נוספות"
                >
                  <button
                    type="button"
                    className={`subcat-card ${selectedSubCategoryId === null ? "subcat-card--selected" : ""}`}
                    onClick={() => setSelectedSubCategoryId(null)}
                    aria-pressed={selectedSubCategoryId === null}
                  >
                    <span className="subcat-card-visual subcat-card-visual--all">
                      <AppsIcon />
                    </span>
                    <span className="subcat-card-body">
                      <span className="subcat-card-name">הכל</span>
                      <span className="subcat-card-count">כל תתי הקטגוריה</span>
                    </span>
                  </button>

                  {selectedSubCategories.map((subCategory) => {
                    const isSelected = subCategory.id === selectedSubCategoryId;
                    const count = productCountFor(subCategory.id);
                    return (
                      <button
                        key={subCategory.id}
                        type="button"
                        className={`subcat-card ${isSelected ? "subcat-card--selected" : ""}`}
                        onClick={() => setSelectedSubCategoryId(isSelected ? null : subCategory.id)}
                        aria-pressed={isSelected}
                      >
                        <span className="subcat-card-visual">
                          {subCategory.imageUrl ? (
                            <img src={resolveImageUrl(subCategory.imageUrl)} alt="" loading="lazy" />
                          ) : (
                            <LabelOutlinedIcon />
                          )}
                        </span>
                        <span className="subcat-card-body">
                          <span className="subcat-card-name">{subCategory.name}</span>
                          {count !== null && <span className="subcat-card-count">{count} מוצרים</span>}
                        </span>
                      </button>
                    );
                  })}
                </HorizontalScroller>

                {/* ===== Products grid ===== */}
                <div className="cat-section-header cat-section-header--products">
                  <div>
                    <h2>{selectedSubCategory ? selectedSubCategory.name : `כל המוצרים ב${selectedCategory?.name || "קטגוריה"}`}</h2>
                    <p>{showProductsSkeleton ? "טוען מוצרים..." : `${visibleProducts.length} מוצרים`}</p>
                  </div>
                  {selectedSubCategory && (
                    <Link to={`/products/${selectedSubCategory.id}`} className="cat-section-link">
                      לעמוד תת-הקטגוריה
                      <ChevronLeftIcon fontSize="small" />
                    </Link>
                  )}
                </div>

                {showProductsSkeleton && (
                  <div className="cat-products-grid" aria-hidden="true">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="product-card product-card--skeleton" />
                    ))}
                  </div>
                )}

                {!productsLoading && productsError && visibleProducts.length === 0 && (
                  <div className="state-banner state-banner--error">
                    <ErrorOutlineIcon />
                    <span>{productsError}</span>
                  </div>
                )}

                {!showProductsSkeleton && !productsError && visibleProducts.length === 0 && (
                  <div className="state-banner state-banner--empty">
                    <Inventory2OutlinedIcon />
                    <span>אין עדיין מוצרים כאן.</span>
                  </div>
                )}

                {visibleProducts.length > 0 && (
                  <div className="cat-products-grid">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
