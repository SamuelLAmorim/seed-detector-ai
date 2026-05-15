import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').trim();
export const MAX_UPLOAD_BYTES = Number(import.meta.env.VITE_MAX_UPLOAD_BYTES || 10 * 1024 * 1024);
export const MAX_UPLOAD_MB = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(1);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export default api;
