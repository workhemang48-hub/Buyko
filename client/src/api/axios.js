import axios from 'axios';

// httpOnly JWT cookie auth (per SRS 3.4) requires credentials on every request.
// In development, Vite proxies /api to the Express backend (see vite.config.js).
// In production, VITE_API_URL points directly at the deployed backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export default api;