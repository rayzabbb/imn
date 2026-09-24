import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    getProductsByUser,
    updateProduct,
    deleteProduct,
    selectRecipient,
    markProductTaken,
} from '../services/categoryservice';

const extractErrorMessage = (error, fallback) => {
    if (typeof error?.response?.data === 'string' && error.response.data) {
        return error.response.data;
    }
    return fallback;
};

// Loads the logged-in user's own listings, for the Personal Area.
export const fetchMyProducts = createAsyncThunk(
    'myProducts/fetchMyProducts',
    async (userId, { rejectWithValue }) => {
        try {
            return await getProductsByUser(userId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה בטעינת המוצרים שלך'));
        }
    }
);

export const editMyProduct = createAsyncThunk(
    'myProducts/editMyProduct',
    async ({ productId, payload, requesterUserId }, { rejectWithValue }) => {
        try {
            return await updateProduct(productId, payload, requesterUserId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה בעדכון המוצר'));
        }
    }
);

export const removeMyProduct = createAsyncThunk(
    'myProducts/removeMyProduct',
    async ({ productId, requesterUserId }, { rejectWithValue }) => {
        try {
            await deleteProduct(productId, requesterUserId);
            return productId;
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה במחיקת המוצר'));
        }
    }
);

// Collection-center step 1: pick who gets the item.
export const selectMyProductRecipient = createAsyncThunk(
    'myProducts/selectMyProductRecipient',
    async ({ productId, requesterUserId, recipientUserId }, { rejectWithValue }) => {
        try {
            return await selectRecipient(productId, requesterUserId, recipientUserId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה בבחירת מקבל'));
        }
    }
);

// Collection-center step 2: confirm the handoff is complete.
export const markMyProductTaken = createAsyncThunk(
    'myProducts/markMyProductTaken',
    async ({ productId, requesterUserId }, { rejectWithValue }) => {
        try {
            return await markProductTaken(productId, requesterUserId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה בסימון כניתן'));
        }
    }
);

const myProductsSlice = createSlice({
    name: 'myProducts',
    initialState: {
        items: [],
        loading: false,
        error: null,
        // per-item busy flag, keyed by product id, for edit/delete-in-progress states
        actionError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchMyProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            .addCase(editMyProduct.pending, (state) => {
                state.actionError = null;
            })
            .addCase(editMyProduct.fulfilled, (state, action) => {
                const updated = action.payload;
                state.items = state.items.map((item) =>
                    item.id === updated.id ? updated : item
                );
            })
            .addCase(editMyProduct.rejected, (state, action) => {
                state.actionError = action.payload || action.error.message;
            })

            .addCase(removeMyProduct.pending, (state) => {
                state.actionError = null;
            })
            .addCase(removeMyProduct.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
            })
            .addCase(removeMyProduct.rejected, (state, action) => {
                state.actionError = action.payload || action.error.message;
            })

            .addCase(selectMyProductRecipient.pending, (state) => {
                state.actionError = null;
            })
            .addCase(selectMyProductRecipient.fulfilled, (state, action) => {
                const updated = action.payload;
                state.items = state.items.map((item) =>
                    item.id === updated.id ? updated : item
                );
            })
            .addCase(selectMyProductRecipient.rejected, (state, action) => {
                state.actionError = action.payload || action.error.message;
            })

            .addCase(markMyProductTaken.pending, (state) => {
                state.actionError = null;
            })
            .addCase(markMyProductTaken.fulfilled, (state, action) => {
                const updated = action.payload;
                state.items = state.items.map((item) =>
                    item.id === updated.id ? updated : item
                );
            })
            .addCase(markMyProductTaken.rejected, (state, action) => {
                state.actionError = action.payload || action.error.message;
            });
    },
});

export default myProductsSlice.reducer;
