import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import { fetchProductById, fetchCategories } from '../../slices/categorySlice';
import './ProductDetails.css';

const QUALITY_STYLES = {
  'חדש': 'quality-badge--new',
  'כמו חדש': 'quality-badge--like-new',
  'משומש': 'quality-badge--used',
};

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { productDetails = {}, categories = [] } = useSelector((state) => state.category);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    setIsFavorite(false);
    dispatch(fetchProductById(productId))
      .unwrap()
      .catch((err) => {
        setLoadError(err?.message || 'אירעה שגיאה בטעינת המוצר');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, productId]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // איתור הקטגוריה ותת-הקטגוריה של המוצר, מתוך עץ הקטגוריות שכבר נטען
  const { parentCategory, parentSubCategory } = useMemo(() => {
    for (const category of categories) {
      for (const sub of category.subCategories || []) {
        const match = (sub.products || []).some(
          (p) => String(p.id) === String(productId)
        );
        if (match) {
          return { parentCategory: category, parentSubCategory: sub };
        }
      }
    }
    return { parentCategory: null, parentSubCategory: null };
  }, [categories, productId]);

  const product = productDetails[productId];
  const qualityClass = product?.quality
    ? QUALITY_STYLES[product.quality] || 'quality-badge--default'
    : '';

  const backToProductsHref = parentSubCategory
    ? `/products/${parentSubCategory.id}`
    : '/category';

  return (
    <div className="product-details-page" dir="rtl">
      <nav className="pd-breadcrumbs" aria-label="breadcrumb">
        <Link to="/category">קטגוריות</Link>
        {parentCategory && (
          <>
            <ChevronLeftIcon fontSize="small" />
            <span>{parentCategory.name}</span>
          </>
        )}
        {parentSubCategory && (
          <>
            <ChevronLeftIcon fontSize="small" />
            <Link to={`/products/${parentSubCategory.id}`}>{parentSubCategory.name}</Link>
          </>
        )}
      </nav>

      {isLoading && (
        <div className="pd-card pd-card--skeleton" aria-hidden="true">
          <div className="pd-skeleton-visual" />
          <div className="pd-skeleton-body">
            <div className="pd-skeleton-line pd-skeleton-line--wide" />
            <div className="pd-skeleton-line pd-skeleton-line--narrow" />
            <div className="pd-skeleton-line pd-skeleton-line--medium" />
          </div>
        </div>
      )}

      {!isLoading && (loadError || !product) && (
        <div className="state-banner state-banner--error">
          <ErrorOutlineIcon />
          <span>{loadError || 'המוצר לא נמצא.'}</span>
        </div>
      )}

      {!isLoading && product && (
        <div className="pd-card">
          <div className="pd-visual">
            <ImageNotSupportedOutlinedIcon />
            <span>לא הועלתה תמונה למוצר זה</span>
          </div>

          <div className="pd-body">
            <div className="pd-title-row">
              <h1 className="pd-name">{product.name}</h1>
              <button
                type="button"
                className={`pd-favorite-btn ${isFavorite ? 'pd-favorite-btn--active' : ''}`}
                onClick={() => setIsFavorite((v) => !v)}
                aria-pressed={isFavorite}
                aria-label="הוספה למועדפים"
              >
                {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </button>
            </div>

            {product.quality && (
              <span className={`quality-badge ${qualityClass}`}>{product.quality}</span>
            )}

            {product.manufacturerNameOrBrand && (
              <div className="pd-brand">
                <SellOutlinedIcon fontSize="small" />
                <span>{product.manufacturerNameOrBrand}</span>
              </div>
            )}

            <button type="button" className="pd-cta-btn">
              <ChatBubbleOutlineIcon fontSize="small" />
              יצירת קשר עם המוכר
            </button>

            <div className="pd-details-section">
              <h2>פרטי המוצר</h2>
              <dl className="pd-facts">
                {product.manufacturerNameOrBrand && (
                  <div className="pd-fact">
                    <dt>
                      <SellOutlinedIcon fontSize="small" />
                      יצרן / מותג
                    </dt>
                    <dd>{product.manufacturerNameOrBrand}</dd>
                  </div>
                )}
                {product.quality && (
                  <div className="pd-fact">
                    <dt>
                      <Inventory2OutlinedIcon fontSize="small" />
                      מצב
                    </dt>
                    <dd>{product.quality}</dd>
                  </div>
                )}
                <div className="pd-fact">
                  <dt>
                    <TagOutlinedIcon fontSize="small" />
                    מזהה מוצר
                  </dt>
                  <dd>#{product.id}</dd>
                </div>
              </dl>
            </div>

            <Link to={backToProductsHref} className="pd-back-link">
              <ChevronLeftIcon fontSize="small" />
              חזרה למוצרים
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
