import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { buildServer } from './server.mjs'

await serveStdio(buildServer)
