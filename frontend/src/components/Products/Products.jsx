import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsBySubCategory, fetchCategories } from '../../slices/categorySlice';
import { Link, useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import './Product.css';

const QUALITY_STYLES = {
  'חדש': 'quality-badge--new',
  'כמו חדש': 'quality-badge--like-new',
  'משומש': 'quality-badge--used',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'החדשים ביותר' },
  { value: 'name-asc', label: 'שם (א-ת)' },
  { value: 'name-desc', label: 'שם (ת-א)' },
  { value: 'brand-asc', label: 'יצרן (א-ת)' },
];

const Products = () => {
  const { subCategoryId } = useParams();
  const dispatch = useDispatch();
  const {
    loading,
    error,
    products,
    categories = [],
  } = useSelector((state) => state.category);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchProductsBySubCategory(subCategoryId));
  }, [dispatch, subCategoryId]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // איתור הקטגוריה ותת-הקטגוריה מתוך העץ שכבר נטען, עבור פירורי הלחם
  const { parentCategory, subCategoryMeta } = useMemo(() => {
    for (const category of categories) {
      const match = (category.subCategories || []).find(
        (sc) => String(sc.id) === String(subCategoryId)
      );
      if (match) {
        return { parentCategory: category, subCategoryMeta: match };
      }
    }
    return { parentCategory: null, subCategoryMeta: null };
  }, [categories, subCategoryId]);

  const rawProducts = products[subCategoryId] || [];

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = term
      ? rawProducts.filter((p) => p.name?.toLowerCase().includes(term))
      : [...rawProducts];

    switch (sortBy) {
      case 'name-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'he'));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'he'));
        break;
      case 'brand-asc':
        list.sort((a, b) =>
          (a.manufacturerNameOrBrand || '').localeCompare(b.manufacturerNameOrBrand || '', 'he')
        );
        break;
      case 'newest':
      default:
        list.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }
    return list;
  }, [rawProducts, searchTerm, sortBy]);

  const isLoading = loading && rawProducts.length === 0;
  const pageTitle = subCategoryMeta?.name || 'מוצרים';

  return (
    <div className="products-page" dir="rtl">
      <nav className="products-breadcrumbs" aria-label="breadcrumb">
        <Link to="/category">קטגוריות</Link>
        {parentCategory && (
          <>
            <ChevronLeftIcon fontSize="small" />
            <span>{parentCategory.name}</span>
          </>
        )}
        <ChevronLeftIcon fontSize="small" />
        <span className="products-breadcrumbs-current">{pageTitle}</span>
      </nav>

      <div className="products-page-header">
        <div>
          <h1>{pageTitle}</h1>
          <p>{rawProducts.length} מוצרים</p>
        </div>

        <div className="products-controls">
          <div className="products-search">
            <SearchIcon fontSize="small" className="products-search-icon" />
            <input
              type="text"
              className="products-search-input"
              placeholder="חיפוש במוצרים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="products-sort">
            <SortIcon fontSize="small" className="products-sort-icon" />
            <select
              className="products-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="products-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="product-card product-card--skeleton" />
          ))}
        </div>
      )}

      {!isLoading && error && rawProducts.length === 0 && (
        <div className="state-banner state-banner--error">
          <ErrorOutlineIcon />
          <span>אירעה שגיאה בטעינת המוצרים. נסו לרענן את הדף.</span>
        </div>
      )}

      {!isLoading && !error && rawProducts.length === 0 && (
        <div className="state-banner state-banner--empty">
          <Inventory2OutlinedIcon />
          <span>אין עדיין מוצרים בתת-קטגוריה זו.</span>
        </div>
      )}

      {!isLoading && rawProducts.length > 0 && filteredProducts.length === 0 && (
        <div className="state-banner state-banner--empty">
          <SearchIcon />
          <span>לא נמצאו מוצרים התואמים את החיפוש "{searchTerm}".</span>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const qualityClass = QUALITY_STYLES[product.quality] || 'quality-badge--default';
            return (
              <Link key={product.id} to={`/product/${product.id}`} className="product-card">
                <div className="product-card-visual">
                  <Inventory2OutlinedIcon />
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{product.name}</h3>
                  {product.manufacturerNameOrBrand && (
                    <div className="product-card-brand">
                      <SellOutlinedIcon fontSize="small" />
                      <span>{product.manufacturerNameOrBrand}</span>
                    </div>
                  )}
                  {product.quality && (
                    <span className={`quality-badge ${qualityClass}`}>{product.quality}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
