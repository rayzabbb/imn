import axios from 'axios';

const BASE = 'http://localhost:8080/api/interest';

// Whether the given user is interested in this product, plus the total
// count and whether they're the product's own donor.
export const getInterestStatus = async (productId, userId) => {
  const response = await axios.get(`${BASE}/product/${productId}/status`, {
    params: { userId },
  });
  return response.data;
};

export const expressInterest = async (productId, userId) => {
  const response = await axios.post(`${BASE}/product/${productId}`, null, {
    params: { userId },
  });
  return response.data;
};

export const cancelInterest = async (productId, userId) => {
  const response = await axios.delete(`${BASE}/product/${productId}`, {
    params: { userId },
  });
  return response.data;
};

// The donor's view of who is interested, with contact details.
// The backend returns 204 (empty body) when nobody has expressed interest.
export const getInterestedUsers = async (productId, requesterUserId) => {
  const response = await axios.get(`${BASE}/product/${productId}/interested`, {
    params: { requesterUserId },
  });
  return response.data || [];
};

// The donor's contact details, visible only once the requester has
// expressed interest in this product (backend returns 403 otherwise).
export const getDonorContact = async (productId, requesterUserId) => {
  const response = await axios.get(`${BASE}/product/${productId}/donor-contact`, {
    params: { requesterUserId },
  });
  return response.data;
};

// Every product this user has expressed interest in, with each product's
// real current status - for the Personal Area "מוצרים שמעניינים אותי" section.
// The backend returns 204 (empty body) when the user has no interests yet.
export const getMyInterests = async (userId) => {
  const response = await axios.get(`${BASE}/user/${userId}`);
  return response.data || [];
};
