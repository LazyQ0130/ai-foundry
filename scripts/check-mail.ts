import { verifyMailConnection } from '../server/services/mail.js'

try {
  await verifyMailConnection()
  console.info('PASS: SMTP TLS connection and authentication succeeded. No email was sent.')
} catch (error) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  const safeCodes = ['EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'ETLS', 'EPROTOCOL']
  console.error(`FAIL: SMTP verification failed (${safeCodes.includes(code) ? code : 'CONFIG_OR_SMTP_ERROR'}). Check server SMTP settings.`)
  process.exitCode = 1
}
