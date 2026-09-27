import { app } from './app.js'
import { db } from './db.js'
import { env } from './config/env.js'
import { assertCatalogue } from './services/catalogue.js'

await db.$connect()
await assertCatalogue()
const server = app.listen(env.PORT, '127.0.0.1', () => console.info(`AIFoundry API listening on http://localhost:${env.PORT}`))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(() => { void db.$disconnect().then(() => process.exit(0)) })
})
