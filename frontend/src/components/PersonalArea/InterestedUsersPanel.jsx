/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { getInterestedUsers } from '../../services/interestservice';
import { selectMyProductRecipient } from '../../slices/myProductsSlice';

/**
 * Expandable list of everyone interested in one product, shown only to its
 * donor. Lets the donor pick a recipient (collection-center step 1), which
 * moves the product to AT_CENTER - at which point PersonalArea stops
 * rendering this panel for that product (it's only for WITH_DONOR).
 */
const InterestedUsersPanel = ({ productId, requesterUserId }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [confirmingUserId, setConfirmingUserId] = useState(null);
  const [selectingUserId, setSelectingUserId] = useState(null);
  const [selectError, setSelectError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getInterestedUsers(productId, requesterUserId)
      .then(setUsers)
      .catch(() => setLoadError('שגיאה בטעינת רשימת המתעניינים'))
      .finally(() => setLoading(false));
  }, [productId, requesterUserId]);

  const handleSelectClick = (recipientUserId) => {
    if (confirmingUserId !== recipientUserId) {
      setConfirmingUserId(recipientUserId);
      return;
    }

    setSelectingUserId(recipientUserId);
    setSelectError(null);
    dispatch(selectMyProductRecipient({ productId, requesterUserId, recipientUserId }))
      .unwrap()
      .catch((err) => setSelectError(typeof err === 'string' ? err : 'שגיאה בבחירת מקבל'))
      .finally(() => {
        setSelectingUserId(null);
        setConfirmingUserId(null);
      });
  };

  if (loading) {
    return <div className="pa-interested-panel pa-interested-panel--loading">טוען רשימת מתעניינים...</div>;
  }

  if (loadError) {
    return (
      <div className="pa-interested-panel pa-modal-error">
        <ErrorOutlineIcon fontSize="small" />
        <span>{loadError}</span>
      </div>
    );
  }

  return (
    <div className="pa-interested-panel">
      {selectError && (
        <div className="pa-modal-error" style={{ marginBottom: 8 }}>
          <ErrorOutlineIcon fontSize="small" />
          <span>{selectError}</span>
        </div>
      )}

      {users.length === 0 && <p className="pa-interested-empty">אין עדיין מתעניינים.</p>}

      {users.map((user) => {
        const isConfirming = confirmingUserId === user.userId;
        const isSelecting = selectingUserId === user.userId;
        return (
          <div key={user.userId} className="pa-interested-row">
            <div className="pa-interested-info">
              <strong>{user.username}</strong>
              <span className="pa-interested-contact">
                <EmailOutlinedIcon fontSize="inherit" /> {user.email}
              </span>
              <span className="pa-interested-contact">
                <PhoneOutlinedIcon fontSize="inherit" /> {user.phone}
              </span>
              {user.city && (
                <span className="pa-interested-contact">
                  <LocationOnOutlinedIcon fontSize="inherit" /> {user.city}
                </span>
              )}
            </div>
            <button
              type="button"
              className={`pa-action-btn ${isConfirming ? 'pa-action-btn--confirm' : ''}`}
              onClick={() => handleSelectClick(user.userId)}
              disabled={isSelecting}
            >
              <HowToRegIcon fontSize="inherit" />
              {isSelecting ? 'מוסר...' : isConfirming ? 'לאשר בחירה?' : 'מסור למרכז'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default InterestedUsersPanel;
