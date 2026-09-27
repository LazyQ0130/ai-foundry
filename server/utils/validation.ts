import { z } from 'zod'
export const idSchema = z.string().min(1).max(100)
export const slugSchema = z.enum(['stage-1', 'stage-2', 'stage-3', 'stage-4'])
export const noteSchema = z.string().trim().max(2000)
export const pageSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), query: z.string().trim().max(100).default('') })
