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

export default api;
