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
