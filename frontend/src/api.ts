import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const fetchSites    = () => api.get('/sites').then(r => r.data)
export const createSite    = (name: string) => api.post('/sites', { name }).then(r => r.data)
export const fetchReports  = () => api.get('/reports/summary').then(r => r.data)
export const sendChatMessage = (message: string) => api.post('/chatbot', { message }).then(r => r.data)

// Expenses (direct)
export const fetchExpenses  = () => api.get('/wallet').then(r =>
  (r.data as any[]).flatMap((s: any) => (s.expenses || []).map((e: any) => ({ ...e, site: { name: s.name } })))
)
export const approveExpense = (id: number) => api.put(`/expenses/${id}/approve`, {}).then(r => r.data)

export const fetchCustomers  = () => api.get('/customers').then(r => r.data)
export const createCustomer  = (d: any) => api.post('/customers', d).then(r => r.data)
export const updateCustomer  = (id: number, d: any) => api.put(`/customers/${id}`, d).then(r => r.data)
export const deleteCustomer  = (id: number) => api.delete(`/customers/${id}`).then(r => r.data)

export const fetchVendors  = () => api.get('/vendors').then(r => r.data)
export const createVendor  = (d: any) => api.post('/vendors', d).then(r => r.data)
export const updateVendor  = (id: number, d: any) => api.put(`/vendors/${id}`, d).then(r => r.data)
export const deleteVendor  = (id: number) => api.delete(`/vendors/${id}`).then(r => r.data)

// Wallet / Expense Tracker
export const fetchWallets      = () => api.get('/wallet').then(r => r.data)
export const addFund           = (d: any) => api.post('/wallet/fund', d).then(r => r.data)
export const addTrackedExpense = (d: FormData) => api.post('/wallet/expense', d, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const fetchSiteHistory  = (siteId: number) => api.get(`/wallet/history/${siteId}`).then(r => r.data)

// User Management
export const fetchUsers  = () => api.get('/users').then(r => r.data)
export const createUser  = (d: any) => api.post('/users', d).then(r => r.data)
export const updateUser  = (id: number, d: any) => api.put(`/users/${id}`, d).then(r => r.data)
export const deleteUser  = (id: number) => api.delete(`/users/${id}`).then(r => r.data)

// Attendance
export const checkIn        = (d: any) => api.post('/attendance/checkin', d).then(r => r.data)
export const checkOut       = (d: any) => api.post('/attendance/checkout', d).then(r => r.data)
export const fetchMyAttendance   = () => api.get('/attendance/my').then(r => r.data)
export const fetchTodayAttendance = () => api.get('/attendance/today').then(r => r.data)
export const fetchAllAttendance  = (date?: string) => api.get('/attendance/all', { params: date ? { date } : {} }).then(r => r.data)

// Organisation Master
export const fetchOrgProfile   = () => api.get('/organisation/profile').then(r => r.data)
export const updateOrgProfile  = (d: any) => api.put('/organisation/profile', d).then(r => r.data)
export const fetchOrgDocuments = () => api.get('/organisation/documents').then(r => r.data)
export const uploadOrgDocument = (d: FormData) => api.post('/organisation/documents', d, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const deleteOrgDocument = (id: number) => api.delete(`/organisation/documents/${id}`).then(r => r.data)

export default api
