import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// ============ CENTRALIZED API CONFIG ============
const API_BASE_URL: string = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ REQUEST INTERCEPTOR (Auto-attach JWT) ============
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// ============ RESPONSE INTERCEPTOR (Auto-handle Errors / Standardize Data) ============
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if the response matches our standard format { success, data, error }
    const stdResponse = response.data;
    if (stdResponse && typeof stdResponse === 'object' && 'success' in stdResponse) {
      if (stdResponse.success) {
        // Return a modified response object where .data is the inner data
        return {
          ...response,
          data: stdResponse.data
        };
      } else {
        // If success: false, reject with the error message
        const error = new Error(stdResponse.error || 'Server reported failure');
        (error as any).response = response;
        return Promise.reject(error);
      }
    }
    return response;
  },
  (error: any) => {
    // 0. Ignore cancelled requests (AbortController)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // 1. Handle Authentication (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 2. Global Error Toast (Frontend Trap Fix)
    const backendMessage = error.response?.data?.error;
    const url = error.config?.url || '';
    
    // Identified background polling and specific low-priority routes
    const isSilencedRoute = 
      url.includes('/dashboard/metrics') || 
      url.includes('/dashboard/notifications') || 
      url.includes('/reports/') ||
      url.includes('/api/map') ||
      url.includes('/town-owners') ||
      url.includes('/land-owners') ||
      url.includes('/audit-log') ||
      url.includes('/api/users/stats');

    if (backendMessage) {
      toast.error(backendMessage, { duration: 4000 });
    } else if (isSilencedRoute) {
      // Subtle Terminal-style background ping
      if (!error.response) {
        toast('Background sync paused. Retrying...', {
          id: 'bg-sync-warning',
          icon: '📡',
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#94a3b8',
            fontSize: '10px',
            border: '1px solid #1e293b'
          }
        });
      }
    } else {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else if (!error.response) {
        toast.error('Connection unstable. Retrying...', { 
          id: 'conn-error',
          duration: 5000 
        });
      }
    }


    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
