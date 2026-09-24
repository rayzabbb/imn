import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { fetchCategories, fetchSubCategoriesByCategory } from "../../slices/categorySlice";
import "./Category.css";

const Category = () => {
  const dispatch = useDispatch();
  const {
    categories = [],
    subCategoryList = {},
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.category) || {};

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategoriesError, setSubCategoriesError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSubCategoriesError(null);

    // כבר נטענו תתי הקטגוריות עבור קטגוריה זו - אין צורך לבקש שוב
    if (subCategoryList[categoryId]) {
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

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSubCategories = selectedCategoryId ? subCategoryList[selectedCategoryId] : undefined;
  const isInitialLoad = categoriesLoading && categories.length === 0;

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return categories;
    }
    return categories.filter((category) => category.name?.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  const hasNoSearchResults =
    categories.length > 0 && searchTerm.trim() !== "" && filteredCategories.length === 0;

  return (
    <div className="categories-page" dir="rtl">
      <div className="categories-page-header">
        <h1>כל הקטגוריות</h1>
        <p>עברו בין הקטגוריות וגלו את מה שאתם מחפשים</p>

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

      {isInitialLoad && (
        <div className="categories-page-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="category-tile category-tile--skeleton" />
          ))}
        </div>
      )}

      {!categoriesLoading && categoriesError && categories.length === 0 && (
        <div className="state-banner state-banner--error">
          <ErrorOutlineIcon />
          <span>אירעה שגיאה בטעינת הקטגוריות. נסו לרענן את הדף.</span>
        </div>
      )}

      {!categoriesLoading && !categoriesError && categories.length === 0 && (
        <div className="state-banner state-banner--empty">
          <Inventory2OutlinedIcon />
          <span>אין עדיין קטגוריות להצגה.</span>
        </div>
      )}

      {hasNoSearchResults && (
        <div className="state-banner state-banner--empty">
          <SearchIcon />
          <span>לא נמצאו קטגוריות התואמות את החיפוש "{searchTerm}".</span>
        </div>
      )}

      {filteredCategories.length > 0 && (
        <div className="categories-page-grid">
          {filteredCategories.map((category) => {
            const isSelected = category.id === selectedCategoryId;
            const subCount = Array.isArray(category.subCategories)
              ? category.subCategories.length
              : null;

            return (
              <button
                key={category.id}
                type="button"
                className={`category-tile ${isSelected ? "category-tile--selected" : ""}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {isSelected && (
                  <CheckCircleIcon fontSize="small" className="category-tile-check" />
                )}
                <span className="category-tile-icon">
                  <CategoryIcon />
                </span>
                <span className="category-tile-name">{category.name}</span>
                {category.description && (
                  <span className="category-tile-desc">{category.description}</span>
                )}
                {subCount !== null && (
                  <span className="category-tile-count">
                    {subCount} תתי קטגוריה
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div
        className={`subcategories-showcase ${
          selectedCategoryId ? "subcategories-showcase--open" : ""
        }`}
      >
        {selectedCategoryId && (
          <div className="subcategories-showcase-inner">
            <div className="subcategories-showcase-header">
              <h2>
                תתי קטגוריה{selectedCategory ? ` עבור ${selectedCategory.name}` : ""}
              </h2>
            </div>

            {subCategoriesLoading && (
              <div className="subcategories-page-grid" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="subcategory-tile subcategory-tile--skeleton" />
                ))}
              </div>
            )}

            {!subCategoriesLoading && subCategoriesError && (
              <div className="state-banner state-banner--error">
                <ErrorOutlineIcon />
                <span>{subCategoriesError}</span>
              </div>
            )}

            {!subCategoriesLoading &&
              !subCategoriesError &&
              selectedSubCategories &&
              selectedSubCategories.length === 0 && (
                <div className="state-banner state-banner--empty">
                  <Inventory2OutlinedIcon />
                  <span>אין תתי קטגוריה עבור קטגוריה זו.</span>
                </div>
              )}

            {!subCategoriesLoading &&
              !subCategoriesError &&
              selectedSubCategories &&
              selectedSubCategories.length > 0 && (
                <div className="subcategories-page-grid">
                  {selectedSubCategories.map((subCategory) => (
                    <Link
                      key={subCategory.id}
                      to={`/products/${subCategory.id}`}
                      className="subcategory-tile"
                    >
                      <span className="subcategory-tile-icon">
                        <LabelOutlinedIcon fontSize="small" />
                      </span>
                      <span className="subcategory-tile-name">{subCategory.name}</span>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
