import { cabroProducts } from '../data/mockData'
import apiClient, { useMockData } from './client'

export async function getCabroProducts() {
  if (useMockData) return Promise.resolve(cabroProducts)
  const { data } = await apiClient.get('/api/products/items/', {
    params: { page_size: 100, category: 'cabro-blocks' },
  })
  return data.results || data
}

export async function submitCabroOrder(payload) {
  if (useMockData) {
    return new Promise((resolve) => window.setTimeout(() => resolve({ id: Date.now(), order_number: `CAB-${Date.now()}`, ...payload }), 650))
  }
  const endpoint = import.meta.env.VITE_CABRO_ORDERS_ENDPOINT || '/api/sales/orders/'
  const { data } = await apiClient.post(endpoint, payload)
  return data
}
