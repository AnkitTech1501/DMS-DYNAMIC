import axios from 'axios';
import { startLoading, stopLoading } from '../utils/loadingBar';
import { showToast } from '../utils/toast';

const clinicAdminApi = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
});

clinicAdminApi.interceptors.request.use((config) => {
  startLoading();
  const token = localStorage.getItem('dms_clinic_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

clinicAdminApi.interceptors.response.use(
  (res) => {
    stopLoading();
    return res;
  },
  (err) => {
    stopLoading();

    if (!err.response) {
      showToast('Network error. Please check your connection and try again.');
      return Promise.reject(err);
    }

    const { status, data } = err.response;

    if (status !== 422) {
      showToast(data?.message || `Something went wrong (error ${status}).`);
    }

    if (status === 401) {
      localStorage.removeItem('dms_clinic_admin_token');
      setTimeout(() => {
        window.location.href = '/clinic-admin/login';
      }, 800);
    }

    return Promise.reject(err);
  }
);

export default clinicAdminApi;