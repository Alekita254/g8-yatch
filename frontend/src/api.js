import axios from 'axios';

// Create a global Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
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
