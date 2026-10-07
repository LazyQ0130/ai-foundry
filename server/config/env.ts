import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  SESSION_COOKIE_NAME: z.string().regex(/^[a-zA-Z0-9_]+$/).default('aifoundry_session'),
  SESSION_SECRET: z.string().min(32),
  APP_ORIGIN: z.string().url().transform((value) => new URL(value).origin),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  WECHAT_QR_URL: z.string().refine((value) => !value || /^\/(?!\/)/.test(value) || /^https:\/\//.test(value), 'Use a same-origin path or HTTPS URL').default('/wechat-contact.jpg'),
  WECHAT_CONTACT: z.string().default(''),
  ALL_ACCESS_PRICE: z.coerce.number().int().min(0).max(1000000).default(599),
  ALL_ACCESS_PROJECTS_PRICE: z.coerce.number().int().min(0).max(1000000).default(699),
})
const result = schema.safeParse(process.env)
if (!result.success) throw new Error(`Invalid environment fields: ${result.error.issues.map((e) => e.path.join('.')).join(', ')}`)
export const env = result.data
if (env.NODE_ENV === 'production' && (!env.APP_ORIGIN.startsWith('https://') || env.SESSION_SECRET.includes('replace-with'))) {
  throw new Error('Production requires HTTPS APP_ORIGIN and a random SESSION_SECRET')
}
