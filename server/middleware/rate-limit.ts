import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
const message = { error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后重试' } }
export const registerLimit = rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false, message })
export const loginIpLimit = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message })
export const loginAccountLimit = rateLimit({
  windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip ?? '127.0.0.1')}:${String(req.body?.phone ?? '').replace(/\s/g, '').slice(0, 32)}`,
})
