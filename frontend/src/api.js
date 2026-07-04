import axios from 'axios';

import { apiCacheKey, cacheApiResponse, getCachedApiResponse, queueMutation } from './offline/store';

const isDesktopApp = window.location.protocol === 'app:';
const defaultApiUrl = isDesktopApp ? 'https://g8-backend.getotech.co.ke' : 'http://localhost:8000';

// Create a global Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can't automatically inject the useAuth hook inside a non-component file, 
// so we will pass the token directly from the components when making requests,
// OR we can expose a setup function that components call.
// A simpler approach for now is a helper function to set the auth header:

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const isNetworkError = (error) => !error.response && error.request;
const isReadRequest = (config = {}) => String(config.method || 'get').toLowerCase() === 'get';
const isMutationRequest = (config = {}) => ['post', 'put', 'patch', 'delete'].includes(String(config.method || '').toLowerCase());

api.interceptors.response.use(
  async (response) => {
    if (isReadRequest(response.config)) {
      await cacheApiResponse(apiCacheKey(response.config), response.data);
    }
    return response;
  },
  async (error) => {
    const config = error.config || {};

    if (isNetworkError(error) && isReadRequest(config)) {
      const cached = await getCachedApiResponse(apiCacheKey(config));
      if (cached) {
        return {
          config,
          data: cached.data,
          status: 200,
          statusText: 'Offline cache',
          headers: { 'x-g8-offline-cache': 'true', 'x-g8-offline-saved-at': cached.savedAt },
        };
      }
    }

    if (isNetworkError(error) && isMutationRequest(config) && config.offlineQueue) {
      const queued = await queueMutation(config);
      return {
        config,
        data: { offline_queued: true, queued_id: queued.id },
        status: 202,
        statusText: 'Queued offline',
        headers: { 'x-g8-offline-queued': 'true' },
      };
    }

    return Promise.reject(error);
  },
);

export const emptyPagination = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

export const paginationFromResponse = (data, fallbackPage = 1, fallbackPageSize = 20) => ({
  total: data?.count ?? data?.total ?? data?.results?.length ?? 0,
  page: data?.page ?? fallbackPage,
  pageSize: data?.page_size ?? fallbackPageSize,
  totalPages: data?.total_pages ?? Math.max(Math.ceil((data?.count ?? data?.total ?? 0) / fallbackPageSize), 1),
});

export default api;
