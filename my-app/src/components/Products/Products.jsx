import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsBySubCategory } from '../../slices/categorySlice';
import { useParams } from 'react-router-dom';
import SubCategory from '../SubCategory/SubCategory';
//import './Products.css';

const Products = () => {
  const { subCategoryId } = useParams();
  const dispatch = useDispatch();
  const { loading, products } = useSelector((state) => state.category);

  useEffect(() => {
    console.log("Fetching products for subCategoryId:", subCategoryId);
    dispatch(fetchProductsBySubCategory(subCategoryId));
  }, [dispatch, subCategoryId]);
  

  // ודא ש- products הוא מערך
  const sortedProducts = [...products[subCategoryId] || []].sort((a, b) => Number(b.id) - Number(a.id));

console.log("Fetched products for subCategoryId:", subCategoryId);
console.log("Products data:", products);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="products-container">
        {sortedProducts.length === 0 ? (
          <div>No products found in this subcategory.</div>
        ) : (
          sortedProducts.map((product) => (
            <div key={product.id} className="product-item">
              <h2>{product.name}</h2>
              <p>Manufacturer/Brand: {product.ManufacturerNameOrBrand}</p>
              <p>Quality: {product.quality}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
