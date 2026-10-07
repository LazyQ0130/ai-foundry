import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, ApiError, errorMessage, jsonBody } from '../lib/api.js'

export type User = { id: string; nickname: string; phoneMasked: string; phoneVerified: boolean; email: string | null; emailVerifiedAt: string | null; role: 'ADMIN' | 'STUDENT'; avatarUrl: string | null; entitlements: string[]; productEntitlements: string[]; createdAt: string; lastLoginAt: string | null }
type Auth = {
  user: User | null; loading: boolean; error: string
  login: (phone: string, password: string) => Promise<User>
  register: (phone: string, password: string, nickname: string, acceptedTerms: boolean) => Promise<User>
  logout: () => Promise<void>; refreshUser: () => Promise<void>
  /** 直接套用接口返回的最新用户，避免改动后整页回到 loading 态。 */
  applyUser: (user: User) => void
}
const Context = createContext<Auth | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refreshUser = useCallback(async () => {
    setLoading(true); setError('')
    try { setUser(await api<User>('/me')) } catch (e) {
      if (e instanceof ApiError && e.status === 401) setUser(null)
      else { setUser(null); setError(errorMessage(e)) }
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void refreshUser() }, [refreshUser])
  useEffect(() => {
    const expired = () => { setUser(null); setError('') }
    window.addEventListener('auth:expired', expired)
    return () => window.removeEventListener('auth:expired', expired)
  }, [])
  const authenticate = async (mode: string, phone: string, password: string, nickname?: string, acceptedTerms?: boolean) => {
    const result = await api<{ user: User }>(`/auth/${mode}`, { method: 'POST', body: jsonBody({ phone, password, nickname: nickname || undefined, acceptedTerms }) })
    setUser(result.user); setError(''); return result.user
  }
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null) }
  const applyUser = useCallback((next: User) => setUser(next), [])
  return <Context.Provider value={{ user, loading, error, refreshUser, applyUser, login: (p, s) => authenticate('login', p, s), register: (p, s, n, a) => authenticate('register', p, s, n, a), logout }}>{children}</Context.Provider>
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider missing'); return value }
export function useOptionalAuth() { return useContext(Context) }
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, error, refreshUser } = useAuth()
  const location = useLocation()
  if (loading) return <p className="shell py-20" role="status">正在确认登录状态…</p>
  if (error) return <div className="shell py-20" role="alert">{error} <button onClick={() => void refreshUser()} className="btn btn-outline">重试</button></div>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  if (admin && user.role !== 'ADMIN') return <div className="shell py-20">需要管理员权限。</div>
  return <>{children}</>
}
