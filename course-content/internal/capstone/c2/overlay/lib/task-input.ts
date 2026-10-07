import { z } from 'zod'

export const taskInput = z.strictObject({
  title: z.string().trim().min(1).max(120),
  query: z.string().trim().min(1).max(2000),
})
