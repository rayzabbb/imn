import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginUser, addUser } from '../services/userservice';


export const signUp = createAsyncThunk("user/signUp",
    async (user) => {
        const userData = await addUser(user);
        return userData;
    }
)

export const login = createAsyncThunk("user/login",
    async (user) => {
        const userData = await loginUser(user);
        return userData;
    }
)



const userSlice = createSlice({
    //מזהה של הסליס
    name: "user",
    //נתונים משותפים
    initialState :{//מצב ראשוני
        currentUser: {},//משתמש נוכחי
        loading: false,//מבוצעת
        error: "",
        isLoggedIn :false
    },
    //עדכון רגיל - סיכרוני
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
            state.isLoggedIn = true;

        }
        ,logoutUser: (state) => {
            state.currentUser = {}; 
            state.isLoggedIn = false;

        },
        setUser: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload }; // שילוב הערכים
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
              //  state.isLoggedIn = true;

            })

            //אמצע פעולה
            .addCase(signUp.pending, (state, action) => {
                state.loading = true;
                //state.isLoggedIn = true;//====================לבדוק מה קרה עכשיו???????

            })
            //הפעולה נכשלה
            .addCase(signUp.rejected, (state, action) => {
                state.error = action.error;
                state.loading = false;

            })
            // Login cases
            .addCase(login.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
                state.isLoggedIn = true; // מעדכן שהמשתמש מחובר

            })
            .addCase(login.pending, (state) => {
                state.loading = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.error;
                state.loading = false;
            })
            
            
            
    }
});

// ייצוא הפונקציה setCurrentUser לשימוש בקבצים אחרים
export const { setCurrentUser,logoutUser  } = userSlice.actions;
export default userSlice.reducer;