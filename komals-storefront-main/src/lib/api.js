import axios from 'axios';
import { getVisitorId } from './visitorId.js';

// deploy check: verifying GitHub Actions workflow triggers on this change
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8083';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  config.headers['X-Visitor-Id'] = getVisitorId();
  return config;
});

export function imageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}
