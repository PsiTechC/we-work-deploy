import AsyncStorage from '@react-native-async-storage/async-storage'

export async function saveToken(token: string) { await AsyncStorage.setItem('token', token) }
export async function getToken(): Promise<string | null> { return AsyncStorage.getItem('token') }
export async function clearToken() { await AsyncStorage.removeItem('token') }

export async function saveUser(user: any) { await AsyncStorage.setItem('user', JSON.stringify(user)) }
export async function getUser(): Promise<any | null> {
  const s = await AsyncStorage.getItem('user')
  try { return s ? JSON.parse(s) : null } catch { return null }
}
export async function clearUser() { await AsyncStorage.removeItem('user') }
export async function clearAll() { await AsyncStorage.multiRemove(['token', 'user']) }
