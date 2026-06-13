import axios from 'axios'

const mockSetting = import.meta.env.VITE_USE_MOCK_DATA
export const useMockData = mockSetting
  ? mockSetting === 'true'
  : import.meta.env.DEV

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('g8_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient
