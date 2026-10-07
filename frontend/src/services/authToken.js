// Single source of truth for the JWT access token. Kept separate from the
// currentUser object (still persisted by userSlice) so the axios interceptor
// below can read it without importing Redux state.
const TOKEN_KEY = 'authToken';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Private browsing / storage disabled - the session just won't survive a reload.
  }
};

export const clearAuthToken = () => setAuthToken(null);
