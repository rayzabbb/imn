import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { fetchProductById } from '../../slices/categorySlice';
import './ProductDetails.css';

const QUALITY_STYLES = {
  'חדש': 'quality-badge--new',
  'כמו חדש': 'quality-badge--like-new',
  'משומש': 'quality-badge--used',
};

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { productDetails = {} } = useSelector((state) => state.category);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    dispatch(fetchProductById(productId))
      .unwrap()
      .catch((err) => {
        setLoadError(err?.message || 'אירעה שגיאה בטעינת המוצר');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, productId]);

  const product = productDetails[productId];
  const qualityClass = product?.quality ? QUALITY_STYLES[product.quality] || 'quality-badge--default' : '';

  return (
    <div className="product-details-page" dir="rtl">
      <nav className="products-breadcrumbs" aria-label="breadcrumb">
        <Link to="/category">קטגוריות</Link>
        <ChevronLeftIcon fontSize="small" />
        <span className="products-breadcrumbs-current">
          {product ? product.name : 'מוצר'}
        </span>
      </nav>

      {isLoading && (
        <div className="product-details-card product-details-card--skeleton" aria-hidden="true" />
      )}

      {!isLoading && (loadError || !product) && (
        <div className="state-banner state-banner--error">
          <ErrorOutlineIcon />
          <span>{loadError || 'המוצר לא נמצא.'}</span>
        </div>
      )}

      {!isLoading && product && (
        <div className="product-details-card">
          <div className="product-details-visual">
            <Inventory2OutlinedIcon />
          </div>

          <div className="product-details-body">
            <h1 className="product-details-name">{product.name}</h1>

            {product.quality && (
              <span className={`quality-badge ${qualityClass}`}>{product.quality}</span>
            )}

            <dl className="product-details-facts">
              {product.manufacturerNameOrBrand && (
                <div className="product-details-fact">
                  <dt>
                    <SellOutlinedIcon fontSize="small" />
                    יצרן / מותג
                  </dt>
                  <dd>{product.manufacturerNameOrBrand}</dd>
                </div>
              )}
              {product.quality && (
                <div className="product-details-fact">
                  <dt>
                    <Inventory2OutlinedIcon fontSize="small" />
                    מצב
                  </dt>
                  <dd>{product.quality}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
