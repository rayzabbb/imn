import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import { fetchProductById, fetchCategories } from '../../slices/categorySlice';
import { getInterestStatus, expressInterest, cancelInterest } from '../../services/interestservice';
import './ProductDetails.css';

const QUALITY_STYLES = {
  'חדש': 'quality-badge--new',
  'כמו חדש': 'quality-badge--like-new',
  'משומש': 'quality-badge--used',
};

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { productDetails = {}, categories = [] } = useSelector((state) => state.category);
  const { isLoggedIn, currentUser } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Interest state for the current viewer on this product. Defaults are the
  // safe "no interest yet" shape for anonymous visitors, who never get a
  // status fetched for them.
  const [interest, setInterest] = useState({ interested: false, owner: false });
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestError, setInterestError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    setInterest({ interested: false, owner: false });
    setInterestError(null);
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
    if (!isLoggedIn || !currentUser?.id) {
      return;
    }
    getInterestStatus(productId, currentUser.id)
      .then(setInterest)
      .catch(() => {
        // Silent: the button just falls back to its default "not interested"
        // state; the user can still try clicking it.
      });
  }, [productId, isLoggedIn, currentUser?.id]);

  const handleInterestClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (interest.owner || interestLoading) {
      return;
    }

    setInterestLoading(true);
    setInterestError(null);
    const action = interest.interested ? cancelInterest : expressInterest;
    action(productId, currentUser.id)
      .then(setInterest)
      .catch((err) => {
        setInterestError(
          typeof err?.response?.data === 'string' ? err.response.data : 'שגיאה בעדכון ההתעניינות'
        );
      })
      .finally(() => setInterestLoading(false));
  };

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
              {interest.owner && <span className="pd-owner-badge">זה החפץ שלך</span>}
              {!interest.owner && product.status === 'AT_CENTER' && (
                <span className="pd-status-info-badge pd-status-info-badge--at-center">
                  <WarehouseOutlinedIcon fontSize="small" />
                  המוצר נמצא במרכז האיסוף
                </span>
              )}
              {!interest.owner && product.status === 'TAKEN' && (
                <span className="pd-status-info-badge pd-status-info-badge--taken">
                  <CheckCircleOutlineIcon fontSize="small" />
                  המוצר כבר נמסר
                </span>
              )}
              {!interest.owner && product.status === 'WITH_DONOR' && (
                <button
                  type="button"
                  className={`pd-interest-btn ${interest.interested ? 'pd-interest-btn--active' : ''}`}
                  onClick={handleInterestClick}
                  disabled={interestLoading}
                  aria-pressed={interest.interested}
                >
                  {interest.interested ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                  {interest.interested ? 'אני מעוניין ✓' : 'אני מעוניין'}
                </button>
              )}
            </div>

            {interestError && (
              <div className="state-banner state-banner--error pd-interest-error">
                <ErrorOutlineIcon fontSize="small" />
                <span>{interestError}</span>
              </div>
            )}

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
