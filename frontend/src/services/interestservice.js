import axios from 'axios';

const BASE = 'http://localhost:8080/api/interest';

// Every call below relies on the JWT attached by httpClient.js's interceptor
// to identify the caller - no userId/requesterUserId is sent by the client.

// Whether the caller is interested in this product, plus the total count
// and whether they're the product's own donor.
export const getInterestStatus = async (productId) => {
  const response = await axios.get(`${BASE}/product/${productId}/status`);
  return response.data;
};

export const expressInterest = async (productId) => {
  const response = await axios.post(`${BASE}/product/${productId}`);
  return response.data;
};

export const cancelInterest = async (productId) => {
  const response = await axios.delete(`${BASE}/product/${productId}`);
  return response.data;
};

// The donor's view of who is interested, with contact details.
// The backend returns 204 (empty body) when nobody has expressed interest.
export const getInterestedUsers = async (productId) => {
  const response = await axios.get(`${BASE}/product/${productId}/interested`);
  return response.data || [];
};

// The donor's contact details, visible only once the caller has expressed
// interest in this product (backend returns 403 otherwise).
export const getDonorContact = async (productId) => {
  const response = await axios.get(`${BASE}/product/${productId}/donor-contact`);
  return response.data;
};

// Every product the caller has expressed interest in, with each product's
// real current status - for the Personal Area "מוצרים שמעניינים אותי" section.
// The backend returns 204 (empty body) when the caller has no interests yet.
export const getMyInterests = async () => {
  const response = await axios.get(`${BASE}/mine`);
  return response.data || [];
};
