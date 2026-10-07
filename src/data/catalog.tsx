import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Stage } from './courses'
import { api, errorMessage } from '../lib/api'
export type Catalogue = { stages: Stage[]; purchase: { wechatQrUrl: string; wechatContact: string; allAccessPrice: number; allAccessProjectsPrice: number } }
const Context = createContext<(Catalogue & { loading: boolean; error: string; refresh: () => Promise<void> }) | null>(null)
export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Catalogue>({ stages: [], purchase: { wechatQrUrl: '', wechatContact: '', allAccessPrice: 0, allAccessProjectsPrice: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => { setLoading(true); setError(''); try { setData(await api<Catalogue>('/stages')) } catch (e) { setError(errorMessage(e)) } finally { setLoading(false) } }, [])
  useEffect(() => { void refresh() }, [refresh])
  return <Context.Provider value={{ ...data, loading, error, refresh }}>{children}</Context.Provider>
}
export function useCatalogue() { const value = useContext(Context); if (!value) throw new Error('CatalogueProvider missing'); return value }
