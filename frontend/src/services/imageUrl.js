// The backend stores each uploaded image's URL path (e.g. "/api/images/<uuid>.jpg")
// and serves it publicly; this turns that path into an absolute URL for <img src>.
const API_BASE = 'http://localhost:8080';

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  return /^https?:\/\//.test(imageUrl) ? imageUrl : `${API_BASE}${imageUrl}`;
};

// Mirrors the backend's checks (ImageStorageService) so users get instant feedback.
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const validateImageFile = (file) => {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'ניתן להעלות רק תמונות מסוג JPG, PNG, WEBP או GIF';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'התמונה גדולה מדי (עד 5MB)';
  }
  return null;
};
