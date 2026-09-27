import 'dotenv/config'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const mailSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
  SMTP_SECURE: z.enum(['true', 'false']).default('true').transform(value => value === 'true'),
  SMTP_USER: z.email(),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().min(1).default('AIFoundry'),
})

function createMailTransport() {
  const parsed = mailSchema.safeParse(process.env)
  if (!parsed.success) {
    // Report field names only; never include credentials or raw SMTP responses.
    throw new Error(`Invalid mail environment fields: ${parsed.error.issues.map(issue => issue.path.join('.')).join(', ')}`)
  }
  const config = parsed.data
  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    requireTLS: !config.SMTP_SECURE,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    logger: false,
    debug: false,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
  return { transport, from: { name: config.SMTP_FROM_NAME, address: config.SMTP_USER } }
}

// Authenticates with SMTP without sending email.
export async function verifyMailConnection(): Promise<void> {
  const { transport } = createMailTransport()
  try { await transport.verify() }
  finally { transport.close() }
}

// Internal service only. Callers must enforce authorization and rate limits.
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  z.email().parse(to)
  const { transport, from } = createMailTransport()
  try {
    const result = await transport.sendMail({ from, to, subject, text })
    if (result.rejected.length || !result.accepted.length) throw new Error('Recipient rejected')
  } catch {
    throw new Error('Mail delivery failed')
  } finally { transport.close() }
}
