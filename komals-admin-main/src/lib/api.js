import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8083';

const TOKEN_KEY = 'jmaart_admin_token';
const USER_KEY = 'jmaart_admin_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getRole() {
  const user = getUser();
  return user?.role || 'ADMIN';
}

export function isAdmin() {
  return getRole() === 'ADMIN';
}

export function canManageProducts() {
  const role = getRole();
  return role === 'ADMIN' || role === 'PRODUCT_MANAGER';
}

export function canManageWhatsApp() {
  const role = getRole();
  return role === 'ADMIN' || role === 'WHATSAPP_MANAGER';
}

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export function imageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/admin/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}
