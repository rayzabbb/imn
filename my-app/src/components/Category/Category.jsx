import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../slices/categorySlice';
import { useNavigate } from 'react-router-dom'; // השתמש ב-useNavigate במקום useHistory
import './Category.css';

const Category = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // השתמש ב-useNavigate
  const categoryState = useSelector((state) => state.category) || {};
  console.log("State in Category component:", categoryState);

  const { categories = [], loading = false } = categoryState;
  
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    console.log("Sending request for category:", categoryId); // בדיקת תקינות
    navigate(`/subcategory/${categoryId}`); 
};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>קטגוריות</h1>
      <div className="categories-container">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="category-button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Category;
