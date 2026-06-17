export function saveToken(token: string) { localStorage.setItem('token', token) }
export function getToken() { return localStorage.getItem('token') }
export function clearToken() { localStorage.removeItem('token') }

export function saveUser(user: any) { localStorage.setItem('user', JSON.stringify(user)) }
export function getUser(): any | null {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}
export function clearUser() { localStorage.removeItem('user') }
