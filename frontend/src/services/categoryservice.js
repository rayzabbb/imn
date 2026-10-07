import axios from 'axios';

// Fetch categories
export const getCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/category/GetCategories');
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch subcategories by category
export const getSubCategoriesByCategory = async (categoryId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/subcategory/GetSubCategoriesByCategory/${categoryId}`);
    console.log("Subcategories fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    throw error;
  }
};

// Fetch products by subcategory
export const getProductsBySubCategory = async (subCategoryId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/product/GetProductsBySubCategory/${subCategoryId}`);
    console.log("Products fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    throw error;
  }
};

// Fetch a single product by id
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/product/GetProductById/${productId}`);
    console.log("Product fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    throw error;
  }
};

// Create a new product listing
export const addProduct = async (productPayload) => {
  try {
    const response = await axios.post('http://localhost:8080/api/product/addProduct', productPayload);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Fetch the logged-in user's own products, for the Personal Area. Identity
// comes from the JWT (attached by httpClient.js's interceptor) - not a
// userId in the URL. The backend returns 204 (empty body) when the user has
// no products yet.
export const getMyProducts = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/product/mine');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user products:', error);
    throw error;
  }
};

// Edit one of the logged-in user's own listings. Ownership is enforced
// backend-side from the JWT, not a requesterUserId the client would send.
export const updateProduct = async (productId, payload) => {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/product/updateProduct/${productId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete one of the logged-in user's own listings.
export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`http://localhost:8080/api/product/deleteProduct/${productId}`);
    return productId;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Collection-center step 1: donor brings the item to the center
// (WITH_DONOR -> AT_CENTER). Not reserved for anyone - any interested user
// (or anyone at all) may come collect it there.
export const moveProductToCenter = async (productId) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/product/${productId}/moveToCenter`);
    return response.data;
  } catch (error) {
    console.error('Error moving product to center:', error);
    throw error;
  }
};

// Collection-center step 2: donor confirms handoff is done (AT_CENTER -> TAKEN)
export const markProductTaken = async (productId) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/product/${productId}/markTaken`);
    return response.data;
  } catch (error) {
    console.error('Error marking product as taken:', error);
    throw error;
  }
};