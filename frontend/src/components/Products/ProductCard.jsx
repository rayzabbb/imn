/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React from 'react';
import { Link } from 'react-router-dom';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import { resolveImageUrl } from '../../services/imageUrl';
import './Product.css';

const QUALITY_STYLES = {
  'חדש': 'quality-badge--new',
  'כמו חדש': 'quality-badge--like-new',
  'משומש': 'quality-badge--used',
};

/** The product card used by the products grid and the home page sections. */
const ProductCard = ({ product, className = '' }) => {
  const qualityClass = QUALITY_STYLES[product.quality] || 'quality-badge--default';

  return (
    <Link to={`/product/${product.id}`} className={`product-card ${className}`}>
      <div className="product-card-visual">
        {product.imageUrl ? (
          <img src={resolveImageUrl(product.imageUrl)} alt={product.name} loading="lazy" />
        ) : (
          <Inventory2OutlinedIcon />
        )}
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        {product.manufacturerNameOrBrand && (
          <div className="product-card-brand">
            <SellOutlinedIcon fontSize="small" />
            <span>{product.manufacturerNameOrBrand}</span>
          </div>
        )}
        {product.quality && <span className={`quality-badge ${qualityClass}`}>{product.quality}</span>}
        {product.status === 'AT_CENTER' && (
          <span className="quality-badge product-status-badge--at-center">
            <WarehouseOutlinedIcon fontSize="inherit" /> במרכז האיסוף
          </span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
