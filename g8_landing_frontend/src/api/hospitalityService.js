import { menuItems, rooms } from '../data/mockData'
import apiClient, { useMockData } from './client'

const wait = (value) => new Promise((resolve) => window.setTimeout(() => resolve(value), 450))

export async function getRooms() {
  if (useMockData) return wait(rooms)
  const { data } = await apiClient.get('/api/rooms/')
  return data.results || data
}

export async function getMenu() {
  if (useMockData) return wait(menuItems)
  const { data } = await apiClient.get('/api/products/sales-pricelists/', {
    params: { page_size: 100 },
  })
  const pricelists = data.results || data
  return pricelists.flatMap((list) => list.items || [])
}

export async function placeHospitalityOrder({ items, location, customerName }) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const payload = {
    table_name: location,
    customer_name: customerName || 'Guest order',
    subtotal,
    tax_total: 0,
    discount_total: 0,
    grand_total: subtotal,
    notes: `Landing-page order for ${location}`,
    items: items.map((item) => ({
      product: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      tax_total: 0,
      discount_total: 0,
      line_total: item.price * item.quantity,
    })),
  }
  if (useMockData) return wait({ id: Date.now(), order_number: `WEB-${Date.now()}`, ...payload })
  const { data } = await apiClient.post('/api/sales/orders/', payload)
  return data
}
