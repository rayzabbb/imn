/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/categorySlice';
import { editMyProduct } from '../../slices/myProductsSlice';

const QUALITY_OPTIONS = ['חדש', 'כמו חדש', 'משומש'];

/**
 * Editable fields mirror ProductUpdateRequest on the backend: name, brand,
 * quality, subCategory. Status is deliberately not editable here - it
 * belongs to the future interest/collection-center workflow.
 */
const EditProductModal = ({ product, requesterUserId, onClose }) => {
  const dispatch = useDispatch();
  const { categories = [], subCategoryList = {} } = useSelector((state) => state.category);

  const [form, setForm] = useState({
    name: product.name || '',
    manufacturerNameOrBrand: product.manufacturerNameOrBrand || '',
    quality: product.quality || '',
    categoryId: product.categoryId ? String(product.categoryId) : '',
    subCategoryId: product.subCategoryId ? String(product.subCategoryId) : '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    if (form.categoryId && !subCategoryList[form.categoryId]) {
      setSubCategoriesLoading(true);
      dispatch(fetchSubCategoriesByCategory(form.categoryId)).finally(() =>
        setSubCategoriesLoading(false)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!categoryId || subCategoryList[categoryId]) {
      return;
    }
    setSubCategoriesLoading(true);
    dispatch(fetchSubCategoriesByCategory(categoryId)).finally(() =>
      setSubCategoriesLoading(false)
    );
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
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await dispatch(
        editMyProduct({
          productId: product.id,
          requesterUserId,
          payload: {
            name: form.name.trim(),
            manufacturerNameOrBrand: form.manufacturerNameOrBrand.trim(),
            quality: form.quality,
            subCategoryId: Number(form.subCategoryId),
          },
        })
      ).unwrap();
      onClose();
    } catch (err) {
      setSubmitError(typeof err === 'string' ? err : 'שגיאה בעדכון המוצר. נסו שוב.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pa-modal-overlay" dir="rtl" onClick={onClose}>
      <form className="pa-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} noValidate>
        <h2>עריכת חפץ</h2>

        {submitError && (
          <div className="pa-modal-error">
            <ErrorOutlineIcon fontSize="small" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="pa-modal-field">
          <label htmlFor="edit-name">שם החפץ</label>
          <input
            id="edit-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={fieldErrors.name ? 'pa-modal-input--error' : ''}
          />
          {fieldErrors.name && <span className="pa-modal-field-error">{fieldErrors.name}</span>}
        </div>

        <div className="pa-modal-row">
          <div className="pa-modal-field">
            <label htmlFor="edit-category">קטגוריה</label>
            <select
              id="edit-category"
              value={form.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={fieldErrors.categoryId ? 'pa-modal-input--error' : ''}
            >
              <option value="">בחרו קטגוריה...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && <span className="pa-modal-field-error">{fieldErrors.categoryId}</span>}
          </div>

          <div className="pa-modal-field">
            <label htmlFor="edit-subcategory">תת-קטגוריה</label>
            <select
              id="edit-subcategory"
              value={form.subCategoryId}
              onChange={(e) => updateField('subCategoryId', e.target.value)}
              disabled={!form.categoryId || subCategoriesLoading}
              className={fieldErrors.subCategoryId ? 'pa-modal-input--error' : ''}
            >
              <option value="">
                {!form.categoryId
                  ? 'בחרו קודם קטגוריה'
                  : subCategoriesLoading
                  ? 'טוען...'
                  : 'בחרו תת-קטגוריה...'}
              </option>
              {availableSubCategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
            {fieldErrors.subCategoryId && (
              <span className="pa-modal-field-error">{fieldErrors.subCategoryId}</span>
            )}
          </div>
        </div>

        <div className="pa-modal-row">
          <div className="pa-modal-field">
            <label htmlFor="edit-brand">יצרן / מותג</label>
            <input
              id="edit-brand"
              type="text"
              value={form.manufacturerNameOrBrand}
              onChange={(e) => updateField('manufacturerNameOrBrand', e.target.value)}
            />
          </div>

          <div className="pa-modal-field">
            <label htmlFor="edit-quality">מצב / איכות</label>
            <select
              id="edit-quality"
              value={form.quality}
              onChange={(e) => updateField('quality', e.target.value)}
              className={fieldErrors.quality ? 'pa-modal-input--error' : ''}
            >
              <option value="">בחרו מצב...</option>
              {QUALITY_OPTIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            {fieldErrors.quality && <span className="pa-modal-field-error">{fieldErrors.quality}</span>}
          </div>
        </div>

        <div className="pa-modal-actions">
          <button type="button" className="pa-modal-cancel" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </button>
          <button type="submit" className="pa-modal-save" disabled={isSubmitting}>
            {isSubmitting ? 'שומר...' : 'שמירה'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductModal;
