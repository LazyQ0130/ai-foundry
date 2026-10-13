import { readFile } from 'node:fs/promises'
import { parseEnv } from 'node:util'

// Only synthetic data, local Docker, and a fixed private teaching bucket.
// Never print credentials, signed URLs, or raw SDK errors.
const env = parseEnv(await readFile('.env.local', 'utf8'))
const endpoint = 'http://127.0.0.1:3900'
const bucket = 'capstone-private'
if (env.S3_ENDPOINT !== endpoint || env.S3_BUCKET !== bucket || env.S3_REGION !== 'garage') {
  throw new Error('LOCAL_STORAGE_CONFIG_REQUIRED')
}
const origin = env.C3_APP_ORIGIN
const cors = JSON.parse(await readFile('infra/cors.json', 'utf8'))
if (!cors.CORSRules.some(rule => rule.AllowedOrigins.includes(origin))) {
  throw new Error('APP_ORIGIN_MISSING_FROM_CORS')
}
const { S3Client, PutBucketCorsCommand, PutObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3')
  .catch(() => { throw new Error('LOCAL_S3_SDK_REQUIRED: install the pinned C3 SDK packages in docs/local-environment.md') })
const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  .catch(() => { throw new Error('LOCAL_S3_SDK_REQUIRED: install the pinned C3 SDK packages in docs/local-environment.md') })
const client = new S3Client({ endpoint, region: 'garage', forcePathStyle: true, maxAttempts: 1,
  credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
  requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' })
async function send(command) {
  try { return await client.send(command, { abortSignal: AbortSignal.timeout(10_000) }) }
  catch { throw new Error('LOCAL_S3_REQUEST_FAILED: check Garage status, bucket and .env.local') }
}
await send(new PutBucketCorsCommand({ Bucket: bucket, CORSConfiguration: cors }))
console.log('PASS: configured bucket CORS for the listed local app origins')
const key = 'aifoundry-infra-check/storage-check.txt'
await send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: await readFile('infra/storage-check.txt'), ContentType: 'text/plain' }))
// Sign the host reachable by the browser; changing the host after signing invalidates SigV4.
const signedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 60 })
const signed = new URL(signedUrl)
if (signed.origin !== endpoint || signed.pathname !== `/${bucket}/${key}`) throw new Error('UNEXPECTED_SIGNED_URL')
const get = await fetch(signed, { signal: AbortSignal.timeout(10_000), redirect: 'error' })
if (!get.ok || await get.text() !== await readFile('infra/storage-check.txt', 'utf8')) throw new Error('SIGNED_GET_FAILED')
console.log('PASS: signed GET returned the synthetic object')
const anonymous = await fetch(`${endpoint}/${bucket}/${key}`, { signal: AbortSignal.timeout(10_000), redirect: 'error' })
if (![401, 403].includes(anonymous.status)) throw new Error('ANONYMOUS_OBJECT_ACCESS_NOT_DENIED')
console.log('PASS: anonymous object GET denied')
const preflight = await fetch(`${endpoint}/${bucket}/${key}`, { method: 'OPTIONS',
  headers: { Origin: origin, 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'content-type' },
  signal: AbortSignal.timeout(10_000), redirect: 'error' })
if (!preflight.ok || preflight.headers.get('access-control-allow-origin') !== origin ||
  !preflight.headers.get('access-control-allow-methods')?.includes('PUT')) throw new Error('BROWSER_PREFLIGHT_FAILED')
console.log('PASS: PUT preflight allows the configured app origin; verify real browser upload in C3')

client.destroy()
