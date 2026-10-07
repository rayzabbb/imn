/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { ALLOWED_IMAGE_TYPES, resolveImageUrl, validateImageFile } from '../../services/imageUrl';
import './ImageUploadField.css';

/**
 * Pick / preview / replace / remove a single image.
 *
 * Controlled through two values the parent owns:
 *  - file: the newly chosen File (or null)
 *  - existingImageUrl: the image already saved on the server (edit forms), shown
 *    until the user picks a new file or removes it
 * onChange({ file, removed }) reports the user's intent; `removed` is true only
 * when they cleared an existing server image.
 */
const ImageUploadField = ({ label = 'תמונה', file, existingImageUrl, removed, onChange, error, compact }) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const shownUrl = previewUrl || (!removed ? resolveImageUrl(existingImageUrl) : null);

  const handleFile = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file after removing it
    if (!picked) return;
    const validationError = validateImageFile(picked);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onChange({ file: picked, removed: false });
  };

  const handleRemove = () => {
    setLocalError(null);
    onChange({ file: null, removed: Boolean(existingImageUrl) });
  };

  const shownError = localError || error;

  return (
    <div className={`img-field ${compact ? 'img-field--compact' : ''}`}>
      <span className="img-field-label">{label}</span>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFile}
        className="img-field-input"
      />

      {shownUrl ? (
        <div className="img-field-preview">
          <img src={shownUrl} alt="תצוגה מקדימה" />
          <div className="img-field-actions">
            <button type="button" onClick={() => inputRef.current?.click()}>
              <SwapHorizIcon fontSize="small" /> החלפה
            </button>
            <button type="button" className="img-field-remove" onClick={handleRemove}>
              <DeleteOutlineIcon fontSize="small" /> הסרה
            </button>
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className={`img-field-drop ${shownError ? 'img-field-drop--error' : ''}`}>
          <AddPhotoAlternateOutlinedIcon />
          <span>לחצו לבחירת תמונה</span>
          <small>JPG, PNG, WEBP או GIF · עד 5MB</small>
        </label>
      )}

      {shownError && <span className="img-field-error">{shownError}</span>}
    </div>
  );
};

export default ImageUploadField;
