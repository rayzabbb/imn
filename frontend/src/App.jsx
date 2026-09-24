import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SubCategory from './components/SubCategory/SubCategory';
import Products from './components/Products/Products';
import ProductDetails from './components/ProductDetails/ProductDetails';
import CreateListing from './components/CreateListing/CreateListing';
import React from 'react';
import Category from './components/Category/Category';
import HomePage from './components/HomePage/HomePage';
import Layout from './components/Layout/Layout';
import AboutUs from './components/AboutUs/AboutUs';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import RequireAuth from './components/Auth/RequireAuth';
import PersonalArea from './components/PersonalArea/PersonalArea';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="category" element={<Category />} />
          <Route path="subcategory/:categoryId" element={<SubCategory />} />
          <Route path="products/:subCategoryId" element={<Products />} />
          <Route path="product/:productId" element={<ProductDetails />} />
          <Route
            path="publish"
            element={
              <RequireAuth>
                <CreateListing />
              </RequireAuth>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <PersonalArea />
              </RequireAuth>
            }
          />
          <Route path="/about" element={<AboutUs />} />

          {/* בעתיד אפשר להוסיף גם /about וכו' */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
