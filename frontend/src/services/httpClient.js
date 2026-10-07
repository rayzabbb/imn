// Registers a global axios request interceptor that attaches the stored JWT
// as "Authorization: Bearer <token>" to every outgoing request. Every
// service file in this app calls the shared `axios` module directly (rather
// than a dedicated instance), so one interceptor here covers all of them -
// no need to touch each call site. Imported once, for its side effect, from
// main.jsx before anything else makes a request.
import axios from 'axios';
import { getAuthToken } from './authToken';

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
