import axios from 'axios'

const mockSetting = import.meta.env.VITE_USE_MOCK_DATA
export const useMockData = mockSetting
  ? mockSetting === 'true'
  : true
export const useMockVisits = import.meta.env.VITE_USE_MOCK_VISITS === 'true'
const developmentApiUrl = typeof window === 'undefined'
  ? 'http://localhost:8000'
  : `${window.location.protocol}//${window.location.hostname}:8000`

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || developmentApiUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  let token
  try {
    token = window.localStorage.getItem('g8_access_token')
  } catch {
    token = null
  }
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient
