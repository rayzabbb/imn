/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useState } from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getInterestedUsers } from '../../services/interestservice';

/**
 * Read-only expandable list of everyone interested in one product, shown
 * only to its donor. Purely informational - the item isn't reserved for
 * anyone here; the donor decides separately (on the product card) whether
 * to bring the item to the collection center, where any interested user
 * (or anyone at all) may come collect it.
 */
const InterestedUsersPanel = ({ productId, requesterUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    getInterestedUsers(productId, requesterUserId)
      .then(setUsers)
      .catch(() => setLoadError('שגיאה בטעינת רשימת המתעניינים'))
      .finally(() => setLoading(false));
  }, [productId, requesterUserId]);

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
      {users.length === 0 && <p className="pa-interested-empty">אין עדיין מתעניינים.</p>}

      {users.map((user) => (
        <div key={user.userId} className="pa-interested-row pa-interested-row--readonly">
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
        </div>
      ))}
    </div>
  );
};

export default InterestedUsersPanel;
