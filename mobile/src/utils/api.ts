import axios from 'axios'
import { API_URL } from './config'
import { getToken } from './auth'

const api = axios.create({ baseURL: API_URL, timeout: 10000 })

api.interceptors.request.use(async config => {
  const token = await getToken()
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const login         = (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data)
export const fetchWallets  = () => api.get('/wallet').then(r => r.data)
export const fetchExpenses = () => api.get('/wallet').then(r =>
  (r.data as any[]).flatMap((s: any) => (s.expenses || []).map((e: any) => ({ ...e, site: { name: s.name } })))
)
export const addFund           = (d: any) => api.post('/wallet/fund', d).then(r => r.data)
export const addExpense        = (d: FormData) => api.post('/wallet/expense', d, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const checkIn           = (d: any) => api.post('/attendance/checkin', d).then(r => r.data)
export const checkOut          = (d: any) => api.post('/attendance/checkout', d).then(r => r.data)
export const fetchMyAttendance = () => api.get('/attendance/my').then(r => r.data)
export const fetchTodayAttendance = () => api.get('/attendance/today').then(r => r.data)
export const fetchSites        = () => api.get('/sites').then(r => r.data)

export default api
