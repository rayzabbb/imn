import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SubCategory from './components/SubCategory/SubCategory';
import Products from './components/Products/Products';
import ProductDetails from './components/ProductDetails/ProductDetails';
import React from 'react';
import Category from './components/Category/Category';
import HomePage from './components/HomePage/HomePage';
import Layout from './components/Layout/Layout';
import AboutUs from './components/AboutUs/AboutUs';


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
          <Route path="/about" element={<AboutUs />} />

          {/* בעתיד אפשר להוסיף גם /about וכו' */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
