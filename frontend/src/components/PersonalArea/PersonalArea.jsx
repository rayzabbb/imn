import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddIcon from '@mui/icons-material/Add';
import { fetchMyProducts, removeMyProduct } from '../../slices/myProductsSlice';
import EditProductModal from './EditProductModal';
import './PersonalArea.css';

const STATUS_META = {
  WITH_DONOR: { label: 'אצל המוסר', className: 'pa-status-badge--with-donor' },
  AT_CENTER: { label: 'במרכז', className: 'pa-status-badge--at-center' },
  TAKEN: { label: 'נמסר', className: 'pa-status-badge--taken' },
};

const PersonalArea = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { items, loading, error } = useSelector((state) => state.myProducts);

  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchMyProducts(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  const handleRetry = () => {
    if (currentUser?.id) {
      dispatch(fetchMyProducts(currentUser.id));
    }
  };

  const handleDeleteClick = (productId) => {
    if (confirmingDeleteId !== productId) {
      setConfirmingDeleteId(productId);
      return;
    }

    setDeletingId(productId);
    setDeleteError(null);
    dispatch(removeMyProduct({ productId, requesterUserId: currentUser.id }))
      .unwrap()
      .catch((err) => setDeleteError(typeof err === 'string' ? err : 'שגיאה במחיקת המוצר'))
      .finally(() => {
        setDeletingId(null);
        setConfirmingDeleteId(null);
      });
  };

  return (
    <div className="pa-page" dir="rtl">
      <div className="pa-container">
        <div className="pa-profile-card">
          <span className="pa-avatar">
            <PersonOutlineIcon />
          </span>
          <div className="pa-profile-info">
            <h1>{currentUser?.username}</h1>
            <ul className="pa-profile-meta">
              {currentUser?.email && (
                <li>
                  <EmailOutlinedIcon fontSize="inherit" /> {currentUser.email}
                </li>
              )}
              {!!currentUser?.phone && (
                <li>
                  <PhoneOutlinedIcon fontSize="inherit" /> {currentUser.phone}
                </li>
              )}
              {currentUser?.city && (
                <li>
                  <LocationOnOutlinedIcon fontSize="inherit" /> {currentUser.city}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <div className="pa-section-header">
            <h2>המוצרים שלי</h2>
            <Link to="/publish" className="pa-publish-link">
              <AddIcon fontSize="small" /> פרסום חפץ חדש
            </Link>
          </div>

          {deleteError && (
            <div className="pa-modal-error" style={{ marginTop: 14 }}>
              <ErrorOutlineIcon fontSize="small" />
              <span>{deleteError}</span>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {loading && (
              <div className="pa-state">
                <div className="pa-spinner" />
                <p>טוען את המוצרים שלך...</p>
              </div>
            )}

            {!loading && error && (
              <div className="pa-state pa-state--error">
                <ErrorOutlineIcon />
                <p>{error}</p>
                <button type="button" className="pa-retry-btn" onClick={handleRetry}>
                  נסו שוב
                </button>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="pa-state">
                <Inventory2OutlinedIcon />
                <p>עדיין לא פרסמתם חפצים.</p>
                <Link to="/publish" className="pa-retry-btn" style={{ textDecoration: 'none' }}>
                  פרסום החפץ הראשון שלי
                </Link>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="pa-products-grid">
                {items.map((product) => {
                  const statusMeta = STATUS_META[product.status] || {
                    label: product.status,
                    className: 'pa-status-badge--with-donor',
                  };
                  const isConfirming = confirmingDeleteId === product.id;
                  const isDeleting = deletingId === product.id;

                  return (
                    <div key={product.id} className="pa-product-card">
                      <h3>{product.name}</h3>
                      <div className="pa-product-meta">
                        {product.manufacturerNameOrBrand && <span>יצרן/מותג: {product.manufacturerNameOrBrand}</span>}
                        <span>מצב: {product.quality}</span>
                      </div>

                      <div className="pa-product-badges">
                        <span className={`pa-status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
                        <span className="pa-interest-badge">
                          <GroupsOutlinedIcon fontSize="inherit" />
                          {product.interestedCount} מתעניינים
                        </span>
                      </div>

                      <div className="pa-product-actions">
                        <button
                          type="button"
                          className="pa-action-btn"
                          onClick={() => setEditingProduct(product)}
                          disabled={isDeleting}
                        >
                          <EditOutlinedIcon fontSize="inherit" /> עריכה
                        </button>
                        <button
                          type="button"
                          className={`pa-action-btn pa-action-btn--danger ${isConfirming ? 'pa-action-btn--confirm' : ''}`}
                          onClick={() => handleDeleteClick(product.id)}
                          disabled={isDeleting}
                        >
                          <DeleteOutlineIcon fontSize="inherit" />
                          {isDeleting ? 'מוחק...' : isConfirming ? 'לאשר מחיקה?' : 'מחיקה'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          requesterUserId={currentUser.id}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

export default PersonalArea;
