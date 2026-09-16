import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubCategoriesByCategory } from '../../slices/categorySlice';
import { useParams, useNavigate } from 'react-router-dom'; // השתמש ב-useNavigate במקום useHistory
import './SubCategory.css';

const SubCategory = () => {
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // השתמש ב-useNavigate
  const { loading, subCategoryList } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchSubCategoriesByCategory(categoryId));
  }, [dispatch, categoryId]);

  const handleSubCategoryClick = (subCategoryId) => {
    navigate(`/products/${subCategoryId}`); // השתמש ב-navigate במקום history.push
  };

  const subCategories = subCategoryList[categoryId] || [];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>בחרו תת קטגוריה</h1>
      <div className="subcategories-container">
        {subCategories.map((subCategory) => (
          <button
            key={subCategory.id}
            onClick={() => handleSubCategoryClick(subCategory.id)}
            className="subcategory-button"
          >
            {subCategory.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubCategory;
