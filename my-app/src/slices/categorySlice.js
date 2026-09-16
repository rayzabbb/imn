import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories, getSubCategoriesByCategory, getProductsBySubCategory, getProductById, addProduct } from '../services/categoryservice';

// פעולה אסינכרונית להורדת קטגוריות
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async () => {
    const categories = await getCategories();
    return categories;
  }
);

// פעולה אסינכרונית להורדת תתי-קטגוריות עבור קטגוריה נתונה
export const fetchSubCategoriesByCategory = createAsyncThunk(
  'category/fetchSubCategoriesByCategory',
  async (categoryId) => {
    const subCategories = await getSubCategoriesByCategory(categoryId);
    return { categoryId, subCategories };
  }
);

// פעולה אסינכרונית להורדת מוצרים עבור תת-קטגוריה נתונה
export const fetchProductsBySubCategory = createAsyncThunk(
  'category/fetchProductsBySubCategory',
  async (subCategoryId) => {
    const products = await getProductsBySubCategory(subCategoryId);
    return { subCategoryId, products };
  }
);

// פעולה אסינכרונית להורדת מוצר בודד לפי מזהה
export const fetchProductById = createAsyncThunk(
  'category/fetchProductById',
  async (productId) => {
    const product = await getProductById(productId);
    return { productId, product };
  }
);

// פעולה אסינכרונית ליצירת מוצר חדש (פרסום חפץ)
export const createProduct = createAsyncThunk(
  'category/createProduct',
  async (productPayload) => {
    const product = await addProduct(productPayload);
    return product;
  }
);

// ה-Slice שמנהל את המצב
const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    subCategoryList: {},
    products: {},
    productDetails: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // טיפול בטעינת קטגוריות
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // טיפול בטעינת תתי-קטגוריות
    builder.addCase(fetchSubCategoriesByCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSubCategoriesByCategory.fulfilled, (state, action) => {
      state.loading = false;
      const { categoryId, subCategories } = action.payload;
      state.subCategoryList[categoryId] = subCategories;
    });
    builder.addCase(fetchSubCategoriesByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // טיפול בטעינת מוצרים
    builder.addCase(fetchProductsBySubCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProductsBySubCategory.fulfilled, (state, action) => {
      state.loading = false;
      const { subCategoryId, products } = action.payload;
      state.products[subCategoryId] = products;
    });
    builder.addCase(fetchProductsBySubCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // טיפול בטעינת מוצר בודד
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      const { productId, product } = action.payload;
      state.productDetails[productId] = product;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // טיפול ביצירת מוצר חדש
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.loading = false;
      const product = action.payload;
      // המוצר שחוזר מהשרת אינו כולל subCategory/user (JsonBackReference),
      // אז שומרים אותו לפי id בלבד - דף פרטי המוצר יטען אותו מחדש דרך fetchProductById
      state.productDetails[product.id] = product;
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default categorySlice.reducer;
