import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getMyInterests } from '../services/interestservice';

const extractErrorMessage = (error, fallback) => {
    if (typeof error?.response?.data === 'string' && error.response.data) {
        return error.response.data;
    }
    return fallback;
};

// Loads every product the logged-in user has expressed interest in, for the
// Personal Area's "מוצרים שמעניינים אותי" section.
export const fetchMyInterests = createAsyncThunk(
    'myInterests/fetchMyInterests',
    async (userId, { rejectWithValue }) => {
        try {
            return await getMyInterests(userId);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה בטעינת המוצרים שמעניינים אותך'));
        }
    }
);

const myInterestsSlice = createSlice({
    name: 'myInterests',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyInterests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyInterests.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchMyInterests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default myInterestsSlice.reducer;
