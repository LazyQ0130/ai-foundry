import type { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } }); return
  }
  if (error instanceof ZodError || (error instanceof SyntaxError && 'body' in error)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '请求参数格式不正确' } }); return
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ error: { code: 'CONFLICT', message: '该记录已存在' } }); return
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: '记录不存在' } }); return
  }
  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
    res.status(413).json({ error: { code: 'VALIDATION_ERROR', message: '请求内容过大' } }); return
  }
  // Never print request bodies, tokens, connection strings or raw Prisma errors.
  const errorType = error instanceof Prisma.PrismaClientKnownRequestError
    ? `${error.name} (${error.code})`
    : error instanceof Error ? error.name : 'UnknownError'
  console.error('API request failed:', errorType)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务暂时不可用，请稍后重试' } })
}
