const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://jhonmove-rho.vercel.app' : '')

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud')
  }
  return data
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/api/auth/me', { token }),
  updateMe: (token, payload) => request('/api/auth/me', { method: 'PATCH', token, body: payload }),

  driverProfile: (token) => request('/api/drivers/me', { token }),
  setAvailability: (token, disponibilidad) =>
    request('/api/drivers/availability', { method: 'PATCH', token, body: { disponibilidad } }),
  listVehicles: (token) => request('/api/drivers/vehicles', { token }),
  addVehicle: (token, payload) =>
    request('/api/drivers/vehicles', { method: 'POST', token, body: payload }),

  myTrips: (token) => request('/api/trips', { token }),
  getTrip: (token, id) => request(`/api/trips/${id}`, { token }),
  requestTrip: (token, payload) => request('/api/trips', { method: 'POST', token, body: payload }),
  openRequests: (token) => request('/api/trips/requests', { token }),
  acceptTrip: (token, id, body = {}) =>
    request(`/api/trips/${id}/accept`, { method: 'POST', token, body }),
  updateTripStatus: (token, id, estado) =>
    request(`/api/trips/${id}/status`, { method: 'PATCH', token, body: { estado } }),
  rateTrip: (token, id, payload) =>
    request(`/api/trips/${id}/rate`, { method: 'POST', token, body: payload }),

  adminUsers: (token) => request('/api/admin/users', { token }),
  adminDrivers: (token) => request('/api/admin/drivers', { token }),
  setUserStatus: (token, id, estado) =>
    request(`/api/admin/users/${id}/status`, { method: 'PATCH', token, body: { estado } }),
  seedAdmin: (payload) => request('/api/admin/seed', { method: 'POST', body: payload }),
}
