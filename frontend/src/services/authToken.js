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

// True when the JWT's "exp" claim is in the past (or the token can't be read).
// Only a client-side hint for the UI - the backend still verifies every token.
export const isTokenExpired = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
