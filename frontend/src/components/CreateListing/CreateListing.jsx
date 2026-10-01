import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryIcon from '@mui/icons-material/Category';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { fetchCategories, fetchSubCategoriesByCategory, createProduct } from '../../slices/categorySlice';
import './CreateListing.css';

const QUALITY_OPTIONS = ['חדש', 'כמו חדש', 'משומש'];

const initialForm = {
  name: '',
  categoryId: '',
  subCategoryId: '',
  manufacturerNameOrBrand: '',
  quality: '',
};

const CreateListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories = [], subCategoryList = {} } = useSelector((state) => state.category);
  const { currentUser } = useSelector((state) => state.user);

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const availableSubCategories = useMemo(
    () => (form.categoryId ? subCategoryList[form.categoryId] || [] : []),
    [subCategoryList, form.categoryId]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCategoryChange = (categoryId) => {
    setForm((prev) => ({ ...prev, categoryId, subCategoryId: '' }));
    setFieldErrors((prev) => ({ ...prev, categoryId: undefined, subCategoryId: undefined }));

    if (!categoryId) {
      return;
    }
    if (subCategoryList[categoryId]) {
      return; // כבר נטען
    }
    setSubCategoriesLoading(true);
    dispatch(fetchSubCategoriesByCategory(categoryId))
      .unwrap()
      .catch(() => {
        setFieldErrors((prev) => ({ ...prev, subCategoryId: 'שגיאה בטעינת תתי הקטגוריות, נסו שוב' }));
      })
      .finally(() => {
        setSubCategoriesLoading(false);
      });
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'יש להזין שם חפץ';
    if (!form.categoryId) errors.categoryId = 'יש לבחור קטגוריה';
    if (!form.subCategoryId) errors.subCategoryId = 'יש לבחור תת-קטגוריה';
    if (!form.quality) errors.quality = 'יש לבחור מצב/איכות';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const product = await dispatch(
        createProduct({
          name: form.name.trim(),
          manufacturerNameOrBrand: form.manufacturerNameOrBrand.trim(),
          quality: form.quality,
          subCategoryId: Number(form.subCategoryId),
          userId: currentUser.id,
        })
      ).unwrap();

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/product/${product.id}`);
      }, 1200);
    } catch (err) {
      setSubmitError(err?.message || 'אירעה שגיאה בפרסום החפץ. נסו שוב.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-listing-page" dir="rtl">
      <div className="create-listing-header">
        <h1>פרסום חפץ חדש</h1>
        <p>מלאו את הפרטים כדי לפרסם חפץ לשיתוף עם הקהילה</p>
      </div>

      {submitSuccess && (
        <div className="cl-success-card">
          <CheckCircleIcon />
          <div>
            <strong>החפץ פורסם בהצלחה!</strong>
            <span>מעבירים אתכם לעמוד המוצר...</span>
          </div>
        </div>
      )}

      {!submitSuccess && (
        <form className="cl-card" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div className="state-banner state-banner--error">
              <ErrorOutlineIcon />
              <span>{submitError}</span>
            </div>
          )}

          <section className="cl-section">
            <h2>
              <Inventory2OutlinedIcon fontSize="small" />
              פרטי החפץ
            </h2>

            <div className="cl-field">
              <label htmlFor="name">שם החפץ</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="לדוגמה: אוזניות אלחוטיות"
                className={fieldErrors.name ? 'cl-input--error' : ''}
              />
              {fieldErrors.name && <span className="cl-field-error">{fieldErrors.name}</span>}
            </div>

            <div className="cl-field-row">
              <div className="cl-field">
                <label htmlFor="category">
                  <CategoryIcon fontSize="inherit" /> קטגוריה
                </label>
                <select
                  id="category"
                  value={form.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={fieldErrors.categoryId ? 'cl-input--error' : ''}
                >
                  <option value="">בחרו קטגוריה...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoryId && <span className="cl-field-error">{fieldErrors.categoryId}</span>}
              </div>

              <div className="cl-field">
                <label htmlFor="subCategory">
                  <LabelOutlinedIcon fontSize="inherit" /> תת-קטגוריה
                </label>
                <select
                  id="subCategory"
                  value={form.subCategoryId}
                  onChange={(e) => updateField('subCategoryId', e.target.value)}
                  disabled={!form.categoryId || subCategoriesLoading}
                  className={fieldErrors.subCategoryId ? 'cl-input--error' : ''}
                >
                  <option value="">
                    {!form.categoryId
                      ? 'בחרו קודם קטגוריה'
                      : subCategoriesLoading
                      ? 'טוען תתי-קטגוריות...'
                      : 'בחרו תת-קטגוריה...'}
                  </option>
                  {availableSubCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.subCategoryId && (
                  <span className="cl-field-error">{fieldErrors.subCategoryId}</span>
                )}
              </div>
            </div>

            <div className="cl-field-row">
              <div className="cl-field">
                <label htmlFor="brand">
                  <SellOutlinedIcon fontSize="inherit" /> יצרן / מותג (לא חובה)
                </label>
                <input
                  id="brand"
                  type="text"
                  value={form.manufacturerNameOrBrand}
                  onChange={(e) => updateField('manufacturerNameOrBrand', e.target.value)}
                  placeholder="לדוגמה: Apple"
                />
              </div>

              <div className="cl-field">
                <label htmlFor="quality">מצב / איכות</label>
                <select
                  id="quality"
                  value={form.quality}
                  onChange={(e) => updateField('quality', e.target.value)}
                  className={fieldErrors.quality ? 'cl-input--error' : ''}
                >
                  <option value="">בחרו מצב...</option>
                  {QUALITY_OPTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                {fieldErrors.quality && <span className="cl-field-error">{fieldErrors.quality}</span>}
              </div>
            </div>
          </section>

          <p className="cl-section-hint cl-seller-hint">
            הפרסום יישמר תחת החשבון שלך ({currentUser.username}). פרטי יצירת קשר מגיעים מהפרופיל שלך.
          </p>

          <button type="submit" className="cl-submit-btn" disabled={isSubmitting}>
            <AddIcon fontSize="small" />
            {isSubmitting ? 'מפרסם...' : 'פרסום החפץ'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateListing;
