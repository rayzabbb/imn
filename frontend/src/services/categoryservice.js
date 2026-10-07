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

// Fetch all available products (the backend already excludes TAKEN items).
// Returns 204 with an empty body when there are none.
export const getAllProducts = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/product/GetProducts');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
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

// Builds the multipart body the backend's image-aware product endpoints expect:
// a "product" JSON part (same fields as the JSON endpoints) plus an optional "image".
const buildProductFormData = (productPayload, imageFile) => {
  const formData = new FormData();
  formData.append('product', new Blob([JSON.stringify(productPayload)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
};

// Create a new product listing, optionally with an image
export const addProduct = async (productPayload, imageFile) => {
  try {
    const body = imageFile ? buildProductFormData(productPayload, imageFile) : productPayload;
    const response = await axios.post('http://localhost:8080/api/product/addProduct', body);
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
// imageFile replaces the current image; removeImage clears it.
export const updateProduct = async (productId, payload, { imageFile, removeImage } = {}) => {
  try {
    const url = `http://localhost:8080/api/product/updateProduct/${productId}`;
    const response =
      imageFile || removeImage
        ? await axios.put(url, buildProductFormData(payload, imageFile), {
            params: removeImage && !imageFile ? { removeImage: true } : undefined,
          })
        : await axios.put(url, payload);
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

// ---- Catalog management (MANAGER only - enforced by the backend) ----

// Create a category, optionally with an image
export const addCategory = async ({ name, description, imageFile }) => {
  const formData = new FormData();
  formData.append('name', name);
  if (description) formData.append('description', description);
  if (imageFile) formData.append('image', imageFile);
  const response = await axios.post('http://localhost:8080/api/category/addCategory', formData);
  return response.data;
};

// Create a subcategory under a category, optionally with an image
export const addSubCategory = async ({ name, categoryId, imageFile }) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('categoryId', categoryId);
  if (imageFile) formData.append('image', imageFile);
  const response = await axios.post('http://localhost:8080/api/subcategory/addSubCategory', formData);
  return response.data;
};

// Replace (imageFile) or remove (null) the image of an existing category / subcategory
const setCatalogImage = async (kind, id, imageFile) => {
  const url = `http://localhost:8080/api/${kind}/${id}/image`;
  if (!imageFile) {
    const response = await axios.delete(url);
    return response.data;
  }
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await axios.put(url, formData);
  return response.data;
};

export const setCategoryImage = (categoryId, imageFile) => setCatalogImage('category', categoryId, imageFile);
export const setSubCategoryImage = (subCategoryId, imageFile) =>
  setCatalogImage('subcategory', subCategoryId, imageFile);
