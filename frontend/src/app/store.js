import {configureStore} from'@reduxjs/toolkit'
import categoryReducer from '../slices/categorySlice';
import userReducer from '../slices/userSlice';
import myProductsReducer from '../slices/myProductsSlice';
import myInterestsReducer from '../slices/myInterestsSlice';

export const store = configureStore({
    reducer: {
        category: categoryReducer, // שינוי השם מ- categoryList ל- category
        user: userReducer,
        myProducts: myProductsReducer,
        myInterests: myInterestsReducer,
    },
});

export default store;
