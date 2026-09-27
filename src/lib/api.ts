export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (typeof options.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const response = await fetch(`/api${path}`, { ...options, credentials: 'include', headers })
  let result: { data?: T; error?: { code: string; message: string } }
  try { result = await response.json() } catch { throw new ApiError(response.status, 'INVALID_RESPONSE', '服务响应异常，请稍后重试') }
  if (!response.ok) {
    if (response.status === 401 && result.error?.code === 'UNAUTHORIZED') window.dispatchEvent(new Event('auth:expired'))
    throw new ApiError(response.status, result.error?.code ?? 'INTERNAL_ERROR', result.error?.message ?? '请求失败')
  }
  return result.data as T
}
export const jsonBody = (value: unknown) => JSON.stringify(value)
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : '请求失败，请稍后重试'
