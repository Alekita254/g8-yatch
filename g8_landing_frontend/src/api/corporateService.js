import apiClient, { useMockData } from './client'

export async function submitProposal(payload) {
  if (useMockData) {
    return new Promise((resolve) => window.setTimeout(() => resolve({ id: Date.now(), status: 'received', ...payload }), 650))
  }
  const endpoint = import.meta.env.VITE_CRM_LEADS_ENDPOINT || '/api/crm/leads/'
  const { data } = await apiClient.post(endpoint, payload)
  return data
}
