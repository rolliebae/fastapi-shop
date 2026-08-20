const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let detail = 'Не удалось выполнить запрос'
    try {
      const payload = await response.json()
      detail = payload.detail || detail
    } catch {
      // Keep the generic error when the API did not return JSON.
    }
    throw new Error(detail)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  dashboard: () => request('/dashboard'),
  students: (query = '') => request(`/students${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  student: (id) => request(`/students/${id}`),
  createStudent: (payload) => request('/students', { method: 'POST', body: JSON.stringify(payload) }),
  updateStudent: (id, payload) => request(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deals: () => request('/deals'),
  createDeal: (payload) => request('/deals', { method: 'POST', body: JSON.stringify(payload) }),
  updateDeal: (id, payload) => request(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  activities: (studentId) => request(`/students/${studentId}/activities`),
  createActivity: (payload) => request('/activities', { method: 'POST', body: JSON.stringify(payload) }),
}
