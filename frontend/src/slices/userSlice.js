import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginUser, registerUser } from '../services/userservice';

// Reads a plain-text backend error message out of an axios error, falling
// back to a generic one when the response has none (network failure, etc).
const extractErrorMessage = (error, fallback) => {
    if (typeof error?.response?.data === 'string' && error.response.data) {
        return error.response.data;
    }
    return fallback;
};

const STORAGE_KEY = 'currentUser';

const loadStoredUser = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const persistUser = (user) => {
    try {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Private browsing / storage disabled - session just won't survive a reload.
    }
};

const storedUser = loadStoredUser();

export const signUp = createAsyncThunk("user/signUp",
    async (user, { rejectWithValue }) => {
        try {
            return await registerUser(user);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שגיאה בהרשמה'));
        }
    }
)

export const login = createAsyncThunk("user/login",
    async (credentials, { rejectWithValue }) => {
        try {
            return await loginUser(credentials);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, 'שם משתמש או סיסמה שגויים'));
        }
    }
)



const userSlice = createSlice({
    //מזהה של הסליס
    name: "user",
    //נתונים משותפים
    initialState: {//מצב ראשוני
        currentUser: storedUser || {},//משתמש נוכחי, משוחזר מ-localStorage אם קיים
        loading: false,//מבוצעת
        error: "",
        isLoggedIn: !!storedUser
    },
    //עדכון רגיל - סיכרוני
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
            state.isLoggedIn = true;
            persistUser(action.payload);

        }
        ,logoutUser: (state) => {
            state.currentUser = {};
            state.isLoggedIn = false;
            persistUser(null);

        },
        setUser: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload }; // שילוב הערכים
            persistUser(state.currentUser);
        }
        // ,
        // updateUser: (state, action) => {
        //     const { id, user } = action.payload;
        //     if (state.currentUser.id === id) {
        //         state.currentUser = { ...state.currentUser, ...user };
        //     }},

    },
    //אסיכרוני
    extraReducers: (builder) => {
        //הפעולה הצליחה
        builder
            .addCase(signUp.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
                state.isLoggedIn = true; // הרשמה מחברת אותך אוטומטית
                state.error = "";
                persistUser(action.payload);

            })

            //אמצע פעולה
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.error = "";

            })
            //הפעולה נכשלה
            .addCase(signUp.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;

            })
            // Login cases
            .addCase(login.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
                state.isLoggedIn = true; // מעדכן שהמשתמש מחובר
                state.error = "";
                persistUser(action.payload);

            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })



    }
});

// ייצוא הפונקציה setCurrentUser לשימוש בקבצים אחרים
export const { setCurrentUser,logoutUser  } = userSlice.actions;
export default userSlice.reducer;
