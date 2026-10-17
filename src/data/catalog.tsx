import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthProvider'
import type { Stage } from './courses'
import { api, errorMessage } from '../lib/api'
export type PaymentMethod = { id: 'ALIPAY' | 'WECHAT'; label: string; qrUrl: string; recipient: string }
export type Catalogue = { stages: Stage[]; purchase: { wechatQrUrl: string; wechatContact: string; allAccessPrice: number; allAccessProjectsPrice: number; paymentMethods: PaymentMethod[] } }
const Context = createContext<(Catalogue & { loading: boolean; error: string; refresh: () => Promise<void> }) | null>(null)
export function CatalogueProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const owner = auth.user ? `${auth.user.id}:${[...auth.user.entitlements].sort().join(',')}` : 'guest'
  const empty: Catalogue = { stages: [], purchase: { wechatQrUrl: '', wechatContact: '', allAccessPrice: 0, allAccessProjectsPrice: 0, paymentMethods: [] } }
  const [saved, setSaved] = useState<{ owner: string; data: Catalogue }>({ owner: '', data: empty })
  const generation = useRef(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    const version = ++generation.current
    if (auth.loading) return
    setLoading(true); setError('')
    try { const data = await api<Catalogue>('/stages'); if (version === generation.current) setSaved({ owner, data }) }
    catch (e) { if (version === generation.current) setError(errorMessage(e)) }
    finally { if (version === generation.current) setLoading(false) }
  }, [owner, auth.loading])
  useEffect(() => { void refresh(); return () => { generation.current++ } }, [refresh])
  // Never render a previous account's outline while a new request is in flight.
  const data = !auth.loading && saved.owner === owner ? saved.data : empty
  return <Context.Provider value={{ ...data, loading: auth.loading || loading || (saved.owner !== owner && !error), error, refresh }}>{children}</Context.Provider>
}
export function useCatalogue() { const value = useContext(Context); if (!value) throw new Error('CatalogueProvider missing'); return value }
