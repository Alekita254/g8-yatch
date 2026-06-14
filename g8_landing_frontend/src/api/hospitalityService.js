import { menuItems, rooms } from '../data/mockData'
import apiClient, { useMockData } from './client'

const wait = (value) => new Promise((resolve) => window.setTimeout(() => resolve(value), 450))
const mockVisits = new Map()

function mockVisit(token) {
  return mockVisits.get(token) || JSON.parse(window.localStorage.getItem(`g8_mock_visit_${token}`) || 'null')
}

function saveMockVisit(visit) {
  mockVisits.set(visit.token, visit)
  window.localStorage.setItem(`g8_mock_visit_${visit.token}`, JSON.stringify(visit))
  return visit
}

export async function getRooms() {
  if (useMockData) return wait(rooms)
  const { data } = await apiClient.get('/api/rooms/')
  return data.results || data
}

export async function getMenu() {
  if (useMockData) return wait(menuItems)
  const preferredCode = import.meta.env.VITE_MENU_PRICELIST_CODE || 'standard-menu'
  const { data } = await apiClient.get('/api/public/menu/', { params: { pricelist: preferredCode } })
  return data.map((item) => ({
    ...item,
    price: Number(item.price),
    category: menuCategory(item.category),
    image: foodImage(item.category),
  }))
}

export async function startVisit({ guestName, phone, serviceArea, tableNumber }) {
  const payload = {
    guest_name: guestName,
    phone,
    service_area: serviceArea,
    table_name: tableNumber,
  }
  if (useMockData) {
    const token = crypto.randomUUID()
    return wait(saveMockVisit({
      token,
      visit_number: `VIS-${Date.now()}`,
      ...payload,
      status: 'ACTIVE',
      orders: [],
      total_due: '0.00',
      waiter_requested_at: null,
      waiter_acknowledged_at: null,
      checkout_requested_at: null,
      feedback_rating: null,
    }))
  }
  const { data } = await apiClient.post('/api/public/visits/', payload)
  return data
}

export async function getVisit(token) {
  if (useMockData) return wait(mockVisit(token))
  const { data } = await apiClient.get(`/api/public/visits/${token}/`)
  return data
}

function menuCategory(categoryName = '') {
  const normalized = categoryName.toLowerCase()
  if (normalized.includes('starter') || normalized.includes('salad')) return 'Starters'
  if (normalized.includes('drink') || normalized.includes('beverage') || normalized.includes('cocktail')) return 'Drinks'
  return 'Mains'
}

function foodImage(categoryName = '') {
  const category = menuCategory(categoryName)
  if (category === 'Starters') return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85'
  if (category === 'Drinks') return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85'
  return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85'
}

export async function placeHospitalityOrder({
  visitToken,
  items,
  notes,
}) {
  const payload = {
    notes,
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
  }
  if (useMockData) {
    const visit = mockVisit(visitToken)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    visit.orders.push({
      id: Date.now(),
      order_number: `WEB-${Date.now()}`,
      status: 'SENT',
      grand_total: total.toFixed(2),
      items: items.map((item) => ({ ...item, product_name: item.name })),
    })
    return wait(saveMockVisit(visit))
  }
  const { data } = await apiClient.post(`/api/public/visits/${visitToken}/orders/`, payload)
  return data
}

export async function notifyWaiter(visitToken) {
  if (useMockData) {
    const visit = mockVisit(visitToken)
    visit.waiter_requested_at = new Date().toISOString()
    visit.waiter_acknowledged_at = null
    return wait(saveMockVisit(visit))
  }
  const { data } = await apiClient.post(`/api/public/visits/${visitToken}/waiter/`)
  return data
}

export async function requestVisitCheckout(visitToken) {
  if (useMockData) {
    const visit = mockVisit(visitToken)
    visit.status = 'CHECKOUT_REQUESTED'
    visit.checkout_requested_at = new Date().toISOString()
    visit.total_due = visit.orders.reduce((sum, order) => sum + Number(order.grand_total), 0).toFixed(2)
    visit.orders = visit.orders.map((order) => ({ ...order, status: 'INVOICED' }))
    return wait(saveMockVisit(visit))
  }
  const { data } = await apiClient.post(`/api/public/visits/${visitToken}/checkout/`)
  return data
}

export async function submitVisitFeedback(visitToken, payload) {
  if (useMockData) {
    const visit = mockVisit(visitToken)
    visit.feedback_rating = payload.rating
    visit.feedback_comment = payload.comment
    return wait(saveMockVisit(visit))
  }
  const { data } = await apiClient.post(`/api/public/visits/${visitToken}/feedback/`, payload)
  return data
}

export async function requestRoomAvailability(payload) {
  if (useMockData) return wait({ id: Date.now(), status: 'received', ...payload })
  const endpoint = import.meta.env.VITE_HOTEL_ENQUIRIES_ENDPOINT
  if (!endpoint) throw new Error('VITE_HOTEL_ENQUIRIES_ENDPOINT is not configured')
  const { data } = await apiClient.post(endpoint, {
    ...payload,
    enquiry_type: 'HOTEL_AVAILABILITY',
    source: 'G8 landing page',
  })
  return data
}
