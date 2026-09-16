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