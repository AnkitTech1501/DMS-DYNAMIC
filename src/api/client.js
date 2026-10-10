import axios from 'axios';
import { startLoading, stopLoading } from '../utils/loadingBar';
import { showToast } from '../utils/toast';

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  startLoading();
  const token = localStorage.getItem('dms_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    stopLoading();
    return res;
  },
  (err) => {
    stopLoading();

    if (!err.response) {
      // Network error, server down, CORS issue, timeout, etc.
      showToast('Network error. Please check your connection and try again.');
      return Promise.reject(err);
    }

    const { status, data } = err.response;

    // 422 validation errors are shown inline next to each field by the
    // calling page, so don't duplicate them as a toast.
    if (status !== 422) {
      const message = data?.message || `Something went wrong (error ${status}).`;
      showToast(message);
    }

    if (status === 401) {
      localStorage.removeItem('dms_admin_token');
      setTimeout(() => {
        window.location.href = '/login';
      }, 800); // brief delay so the toast is visible before redirect
    }

    return Promise.reject(err);
  }
);

export default api;