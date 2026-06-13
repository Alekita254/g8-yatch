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
  const [pricelistResponse, productResponse] = await Promise.all([
    apiClient.get('/api/products/sales-pricelists/', { params: { page_size: 100 } }),
    apiClient.get('/api/products/items/', { params: { page_size: 100 } }),
  ])
  const pricelists = pricelistResponse.data.results || pricelistResponse.data
  const products = productResponse.data.results || productResponse.data
  const productsById = new Map(products.map((product) => [product.id, product]))
  const preferredCode = import.meta.env.VITE_MENU_PRICELIST_CODE || 'standard-menu'
  const pricelist = pricelists.find((list) => list.code === preferredCode && list.is_active)
    || pricelists.find((list) => list.is_active)

  return (pricelist?.items || []).map((item) => {
    const product = productsById.get(item.product) || {}
    return {
      id: item.product,
      name: item.product_name || product.name || 'Menu item',
      description: product.description || '',
      price: Number(item.price),
      category: menuCategory(product.category_name),
      image: product.image_url || foodImage(product.category_name),
    }
  })
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
  items,
  customerName,
  serviceArea,
  tableNumber,
  hasArrived,
  notes,
}) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const location = `${serviceArea} ${tableNumber}`.trim()
  const orderNotes = [
    hasArrived ? 'Guest has arrived - alert a waiter' : 'Guest has not arrived yet',
    notes ? `Guest note: ${notes}` : '',
  ].filter(Boolean).join('. ')
  const payload = {
    table_name: location,
    customer_name: customerName || 'Guest order',
    subtotal,
    tax_total: 0,
    discount_total: 0,
    grand_total: subtotal,
    notes: orderNotes,
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

  const waiterAlertEndpoint = import.meta.env.VITE_WAITER_ALERT_ENDPOINT
  if (hasArrived && waiterAlertEndpoint) {
    apiClient.post(waiterAlertEndpoint, {
      order_id: data.id,
      order_number: data.order_number,
      guest_name: customerName,
      location,
      message: notes,
    }).catch(() => undefined)
  }

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
