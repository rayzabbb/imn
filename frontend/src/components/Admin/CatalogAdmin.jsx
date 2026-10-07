/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryIcon from '@mui/icons-material/Category';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import {
  fetchCategories,
  fetchSubCategoriesByCategory,
  createCategory,
  createSubCategory,
  updateCategoryImage,
  updateSubCategoryImage,
} from '../../slices/categorySlice';
import { ALLOWED_IMAGE_TYPES, resolveImageUrl, validateImageFile } from '../../services/imageUrl';
import ImageUploadField from '../common/ImageUploadField';
import './CatalogAdmin.css';

const Banner = ({ type, children }) => (
  <div className={`ca-banner ca-banner--${type}`}>
    {type === 'success' ? <CheckCircleIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
    <span>{children}</span>
  </div>
);

const CreateCategoryForm = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'יש להזין שם קטגוריה' });
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      const created = await dispatch(
        createCategory({ name: name.trim(), description: description.trim(), imageFile })
      ).unwrap();
      setStatus({ type: 'success', message: `הקטגוריה "${created.name}" נוצרה בהצלחה` });
      setName('');
      setDescription('');
      setImageFile(null);
    } catch (err) {
      setStatus({ type: 'error', message: typeof err === 'string' ? err : 'שגיאה ביצירת הקטגוריה' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="ca-card" onSubmit={handleSubmit} noValidate>
      <h2>
        <CategoryIcon fontSize="small" /> קטגוריה חדשה
      </h2>
      {status && <Banner type={status.type}>{status.message}</Banner>}

      <div className="ca-field">
        <label htmlFor="ca-cat-name">שם הקטגוריה</label>
        <input id="ca-cat-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="ca-field">
        <label htmlFor="ca-cat-desc">תיאור (לא חובה)</label>
        <input
          id="ca-cat-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <ImageUploadField label="תמונת הקטגוריה" file={imageFile} onChange={({ file }) => setImageFile(file)} compact />

      <button type="submit" className="ca-submit" disabled={isSubmitting}>
        <AddIcon fontSize="small" />
        {isSubmitting ? 'יוצר...' : 'יצירת קטגוריה'}
      </button>
    </form>
  );
};

const CreateSubCategoryForm = ({ categories }) => {
  const dispatch = useDispatch();
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setStatus({ type: 'error', message: 'יש לבחור קטגוריה' });
      return;
    }
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'יש להזין שם תת-קטגוריה' });
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      const { subCategory } = await dispatch(
        createSubCategory({ name: name.trim(), categoryId: Number(categoryId), imageFile })
      ).unwrap();
      setStatus({ type: 'success', message: `תת-הקטגוריה "${subCategory.name}" נוצרה בהצלחה` });
      setName('');
      setImageFile(null);
    } catch (err) {
      setStatus({ type: 'error', message: typeof err === 'string' ? err : 'שגיאה ביצירת תת-הקטגוריה' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="ca-card" onSubmit={handleSubmit} noValidate>
      <h2>
        <LabelOutlinedIcon fontSize="small" /> תת-קטגוריה חדשה
      </h2>
      {status && <Banner type={status.type}>{status.message}</Banner>}

      <div className="ca-field">
        <label htmlFor="ca-sub-cat">קטגוריית אב</label>
        <select id="ca-sub-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">בחרו קטגוריה...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="ca-field">
        <label htmlFor="ca-sub-name">שם תת-הקטגוריה</label>
        <input id="ca-sub-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <ImageUploadField
        label="תמונת תת-הקטגוריה"
        file={imageFile}
        onChange={({ file }) => setImageFile(file)}
        compact
      />

      <button type="submit" className="ca-submit" disabled={isSubmitting}>
        <AddIcon fontSize="small" />
        {isSubmitting ? 'יוצר...' : 'יצירת תת-קטגוריה'}
      </button>
    </form>
  );
};

/** One catalog entry (category or subcategory) with replace/remove image controls. */
const ImageRow = ({ name, imageUrl, onUpdate, small, children, onToggle, expanded }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (file) => {
    setBusy(true);
    setError(null);
    try {
      await onUpdate(file);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'שגיאה בעדכון התמונה');
    } finally {
      setBusy(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    run(file);
  };

  return (
    <li className={`ca-row ${small ? 'ca-row--sub' : ''}`}>
      <div className="ca-row-main">
        {imageUrl ? (
          <img src={resolveImageUrl(imageUrl)} alt="" className="ca-row-thumb" />
        ) : (
          <span className="ca-row-thumb ca-row-thumb--empty">
            <PhotoLibraryOutlinedIcon fontSize="small" />
          </span>
        )}
        {onToggle ? (
          <button type="button" className="ca-row-name ca-row-toggle" onClick={onToggle} aria-expanded={expanded}>
            {name}
            <ExpandMoreIcon fontSize="small" className={expanded ? 'ca-row-chevron--open' : ''} />
          </button>
        ) : (
          <span className="ca-row-name">{name}</span>
        )}
        <div className="ca-row-actions">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFile}
            hidden
          />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'שומר...' : imageUrl ? 'החלפת תמונה' : 'העלאת תמונה'}
          </button>
          {imageUrl && (
            <button type="button" className="ca-row-remove" onClick={() => run(null)} disabled={busy}>
              הסרה
            </button>
          )}
        </div>
      </div>
      {error && <span className="ca-row-error">{error}</span>}
      {children}
    </li>
  );
};

const CatalogAdmin = () => {
  const dispatch = useDispatch();
  const { categories = [], subCategoryList = {} } = useSelector((state) => state.category);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const toggleCategory = (categoryId) => {
    const next = expandedId === categoryId ? null : categoryId;
    setExpandedId(next);
    if (next && !subCategoryList[next]) {
      dispatch(fetchSubCategoriesByCategory(next));
    }
  };

  return (
    <div className="catalog-admin-page" dir="rtl">
      <div className="ca-header">
        <h1>ניהול קטלוג</h1>
        <p>יצירת קטגוריות ותתי-קטגוריות חדשות וניהול התמונות שלהן</p>
      </div>

      <div className="ca-forms">
        <CreateCategoryForm />
        <CreateSubCategoryForm categories={categories} />
      </div>

      <section className="ca-card ca-catalog">
        <h2>
          <PhotoLibraryOutlinedIcon fontSize="small" /> תמונות הקטלוג הקיים
        </h2>
        <ul className="ca-list">
          {categories.map((category) => (
            <ImageRow
              key={category.id}
              name={category.name}
              imageUrl={category.imageUrl}
              onUpdate={(file) =>
                dispatch(updateCategoryImage({ categoryId: category.id, imageFile: file })).unwrap()
              }
              onToggle={() => toggleCategory(category.id)}
              expanded={expandedId === category.id}
            >
              {expandedId === category.id && (
                <ul className="ca-list ca-list--sub">
                  {subCategoryList[category.id] === undefined && <li className="ca-row-empty">טוען...</li>}
                  {subCategoryList[category.id] !== undefined && !subCategoryList[category.id]?.length && (
                    <li className="ca-row-empty">אין תתי-קטגוריות</li>
                  )}
                  {(subCategoryList[category.id] || []).map((sc) => (
                    <ImageRow
                      key={sc.id}
                      small
                      name={sc.name}
                      imageUrl={sc.imageUrl}
                      onUpdate={(file) =>
                        dispatch(
                          updateSubCategoryImage({
                            categoryId: category.id,
                            subCategoryId: sc.id,
                            imageFile: file,
                          })
                        ).unwrap()
                      }
                    />
                  ))}
                </ul>
              )}
            </ImageRow>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CatalogAdmin;
