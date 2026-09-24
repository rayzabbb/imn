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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  fetchMyProducts,
  removeMyProduct,
  moveMyProductToCenter,
  markMyProductTaken,
} from '../../slices/myProductsSlice';
import EditProductModal from './EditProductModal';
import InterestedUsersPanel from './InterestedUsersPanel';
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
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [confirmingMoveId, setConfirmingMoveId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [moveError, setMoveError] = useState(null);
  const [confirmingTakenId, setConfirmingTakenId] = useState(null);
  const [markingTakenId, setMarkingTakenId] = useState(null);
  const [takenError, setTakenError] = useState(null);

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

  const toggleInterestedPanel = (productId) => {
    setExpandedProductId((current) => (current === productId ? null : productId));
  };

  const handleMoveToCenterClick = (productId) => {
    if (confirmingMoveId !== productId) {
      setConfirmingMoveId(productId);
      return;
    }

    setMovingId(productId);
    setMoveError(null);
    dispatch(moveMyProductToCenter({ productId, requesterUserId: currentUser.id }))
      .unwrap()
      .catch((err) => setMoveError(typeof err === 'string' ? err : 'שגיאה בהעברת המוצר למרכז'))
      .finally(() => {
        setMovingId(null);
        setConfirmingMoveId(null);
      });
  };

  const handleMarkTakenClick = (productId) => {
    if (confirmingTakenId !== productId) {
      setConfirmingTakenId(productId);
      return;
    }

    setMarkingTakenId(productId);
    setTakenError(null);
    dispatch(markMyProductTaken({ productId, requesterUserId: currentUser.id }))
      .unwrap()
      .catch((err) => setTakenError(typeof err === 'string' ? err : 'שגיאה בסימון כניתן'))
      .finally(() => {
        setMarkingTakenId(null);
        setConfirmingTakenId(null);
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
          {moveError && (
            <div className="pa-modal-error" style={{ marginTop: 14 }}>
              <ErrorOutlineIcon fontSize="small" />
              <span>{moveError}</span>
            </div>
          )}
          {takenError && (
            <div className="pa-modal-error" style={{ marginTop: 14 }}>
              <ErrorOutlineIcon fontSize="small" />
              <span>{takenError}</span>
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
                  const isExpanded = expandedProductId === product.id;
                  const isConfirmingMove = confirmingMoveId === product.id;
                  const isMoving = movingId === product.id;
                  const isConfirmingTaken = confirmingTakenId === product.id;
                  const isMarkingTaken = markingTakenId === product.id;

                  return (
                    <div key={product.id} className="pa-product-card">
                      <h3>{product.name}</h3>
                      <div className="pa-product-meta">
                        {product.manufacturerNameOrBrand && <span>יצרן/מותג: {product.manufacturerNameOrBrand}</span>}
                        <span>מצב: {product.quality}</span>
                      </div>

                      <div className="pa-product-badges">
                        <span className={`pa-status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
                        {product.status === 'WITH_DONOR' && (
                          <button
                            type="button"
                            className="pa-interest-badge pa-interest-badge--clickable"
                            onClick={() => toggleInterestedPanel(product.id)}
                            disabled={product.interestedCount === 0}
                          >
                            <GroupsOutlinedIcon fontSize="inherit" />
                            {product.interestedCount} מתעניינים
                            {product.interestedCount > 0 &&
                              (isExpanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />)}
                          </button>
                        )}
                        {product.status !== 'WITH_DONOR' && (
                          <span className="pa-interest-badge">
                            <GroupsOutlinedIcon fontSize="inherit" />
                            {product.interestedCount} מתעניינים
                          </span>
                        )}
                      </div>

                      {product.status === 'WITH_DONOR' && isExpanded && (
                        <InterestedUsersPanel productId={product.id} requesterUserId={currentUser.id} />
                      )}

                      {product.status === 'WITH_DONOR' && (
                        <div className="pa-status-action">
                          <span>מוכן להעברה למרכז האיסוף?</span>
                          <button
                            type="button"
                            className={`pa-action-btn ${isConfirmingMove ? 'pa-action-btn--confirm' : ''}`}
                            onClick={() => handleMoveToCenterClick(product.id)}
                            disabled={isMoving}
                          >
                            <LocalShippingOutlinedIcon fontSize="inherit" />
                            {isMoving ? 'מעביר...' : isConfirmingMove ? 'לאשר?' : 'הבא למרכז'}
                          </button>
                        </div>
                      )}

                      {product.status === 'AT_CENTER' && (
                        <div className="pa-status-action">
                          <span>החפץ נמצא במרכז האיסוף וממתין לאיסוף</span>
                          <button
                            type="button"
                            className={`pa-action-btn ${isConfirmingTaken ? 'pa-action-btn--confirm' : ''}`}
                            onClick={() => handleMarkTakenClick(product.id)}
                            disabled={isMarkingTaken}
                          >
                            <CheckCircleOutlineIcon fontSize="inherit" />
                            {isMarkingTaken ? 'מסמן...' : isConfirmingTaken ? 'לאשר?' : 'סמן כניתן'}
                          </button>
                        </div>
                      )}

                      {product.status === 'TAKEN' && (
                        <div className="pa-status-action pa-status-action--done">
                          <CheckCircleOutlineIcon fontSize="inherit" />
                          <span>נמסר בהצלחה</span>
                        </div>
                      )}

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
