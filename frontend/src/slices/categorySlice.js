import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCategories,
  getSubCategoriesByCategory,
  getProductsBySubCategory,
  getAllProducts,
  getProductById,
  addProduct,
  addCategory,
  addSubCategory,
  setCategoryImage,
  setSubCategoryImage,
} from '../services/categoryservice';

// The backend returns plain-text error bodies (GlobalExceptionHandler)
const extractErrorMessage = (error, fallback) => {
  if (error?.response?.status === 401) {
    return 'פג תוקף ההתחברות. יש להתנתק, להתחבר מחדש ולנסות שוב.';
  }
  if (!error?.response) {
    return 'אין חיבור לשרת. ודאו שהשרת פועל ונסו שוב.';
  }
  if (typeof error?.response?.data === 'string' && error.response.data) {
    return error.response.data;
  }
  if (error?.response?.status === 403) {
    return 'אין לך הרשאה לבצע פעולה זו';
  }
  return fallback;
};

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

// פעולה אסינכרונית להורדת כל המוצרים הזמינים (לדף הבית)
export const fetchAllProducts = createAsyncThunk(
  'category/fetchAllProducts',
  async () => {
    return await getAllProducts();
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

// פעולה אסינכרונית ליצירת מוצר חדש (פרסום חפץ), עם תמונה אופציונלית
export const createProduct = createAsyncThunk(
  'category/createProduct',
  async ({ product, imageFile }, { rejectWithValue }) => {
    try {
      return await addProduct(product, imageFile);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'אירעה שגיאה בפרסום החפץ. נסו שוב.'));
    }
  }
);

// ניהול קטלוג (מנהל בלבד): יצירת קטגוריה עם תמונה אופציונלית
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (payload, { rejectWithValue }) => {
    try {
      return await addCategory(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'שגיאה ביצירת הקטגוריה'));
    }
  }
);

// ניהול קטלוג (מנהל בלבד): יצירת תת-קטגוריה עם תמונה אופציונלית
export const createSubCategory = createAsyncThunk(
  'category/createSubCategory',
  async (payload, { rejectWithValue }) => {
    try {
      const subCategory = await addSubCategory(payload);
      return { categoryId: payload.categoryId, subCategory };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'שגיאה ביצירת תת-הקטגוריה'));
    }
  }
);

// ניהול קטלוג (מנהל בלבד): החלפה/הסרה של תמונת קטגוריה (imageFile=null מסיר)
export const updateCategoryImage = createAsyncThunk(
  'category/updateCategoryImage',
  async ({ categoryId, imageFile }, { rejectWithValue }) => {
    try {
      return await setCategoryImage(categoryId, imageFile);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'שגיאה בעדכון תמונת הקטגוריה'));
    }
  }
);

// ניהול קטלוג (מנהל בלבד): החלפה/הסרה של תמונת תת-קטגוריה (imageFile=null מסיר)
export const updateSubCategoryImage = createAsyncThunk(
  'category/updateSubCategoryImage',
  async ({ categoryId, subCategoryId, imageFile }, { rejectWithValue }) => {
    try {
      const subCategory = await setSubCategoryImage(subCategoryId, imageFile);
      return { categoryId, subCategory };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'שגיאה בעדכון תמונת תת-הקטגוריה'));
    }
  }
);

// ה-Slice שמנהל את המצב
const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    subCategoryList: {},
    products: {},
    allProducts: [],
    allProductsLoading: false,
    allProductsError: null,
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

    // טיפול בטעינת כל המוצרים (דף הבית) - דגל טעינה נפרד, כדי לא להתנגש עם שאר הטעינות
    builder.addCase(fetchAllProducts.pending, (state) => {
      state.allProductsLoading = true;
      state.allProductsError = null;
    });
    builder.addCase(fetchAllProducts.fulfilled, (state, action) => {
      state.allProductsLoading = false;
      state.allProducts = action.payload;
    });
    builder.addCase(fetchAllProducts.rejected, (state, action) => {
      state.allProductsLoading = false;
      state.allProductsError = action.error.message;
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
      state.error = action.payload || action.error.message;
    });

    // ניהול קטלוג - עדכון הרשימות הקיימות במקום לטעון הכל מחדש
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.categories = [...(state.categories || []), action.payload];
      state.subCategoryList[action.payload.id] = [];
    });
    builder.addCase(updateCategoryImage.fulfilled, (state, action) => {
      const updated = action.payload;
      state.categories = (state.categories || []).map((c) =>
        c.id === updated.id ? { ...c, imageUrl: updated.imageUrl } : c
      );
    });
    builder.addCase(createSubCategory.fulfilled, (state, action) => {
      const { categoryId, subCategory } = action.payload;
      state.subCategoryList[categoryId] = [...(state.subCategoryList[categoryId] || []), subCategory];
      state.categories = (state.categories || []).map((c) =>
        String(c.id) === String(categoryId)
          ? { ...c, subCategories: [...(c.subCategories || []), subCategory] }
          : c
      );
    });
    builder.addCase(updateSubCategoryImage.fulfilled, (state, action) => {
      const { categoryId, subCategory } = action.payload;
      const replace = (list) =>
        (list || []).map((sc) => (sc.id === subCategory.id ? { ...sc, imageUrl: subCategory.imageUrl } : sc));
      if (state.subCategoryList[categoryId]) {
        state.subCategoryList[categoryId] = replace(state.subCategoryList[categoryId]);
      }
      state.categories = (state.categories || []).map((c) =>
        String(c.id) === String(categoryId) ? { ...c, subCategories: replace(c.subCategories) } : c
      );
    });
  },
});

export default categorySlice.reducer;
