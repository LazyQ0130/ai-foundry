import { S3Client, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { KnowledgeError, MAX_FILE_BYTES } from './knowledge-core'

function config() {
  const endpoint = process.env.S3_ENDPOINT
  const region = process.env.S3_REGION
  const bucket = process.env.S3_BUCKET
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) throw new KnowledgeError('STORAGE_FAILED')
  const url = new URL(endpoint)
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new KnowledgeError('STORAGE_FAILED')
  const client = new S3Client({ endpoint, region, forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: { accessKeyId, secretAccessKey } })
  return { client, bucket }
}

export async function signedPut(objectKey: string, mimeType: string) {
  const { client, bucket } = config()
  try { return await getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: objectKey,
    ContentType: mimeType }), { expiresIn: 300 }) }
  catch { throw new KnowledgeError('STORAGE_FAILED') }
  finally { client.destroy() }
}

export async function signedGet(objectKey: string) {
  const { client, bucket } = config()
  try { return await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: objectKey }), { expiresIn: 300 }) }
  catch { throw new KnowledgeError('STORAGE_FAILED') }
  finally { client.destroy() }
}

export async function readPrivateObject(objectKey: string, expectedSize: number, expectedMime: string) {
  const { client, bucket } = config()
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }))
    if (!head.ContentLength || head.ContentLength > MAX_FILE_BYTES || head.ContentLength !== expectedSize) throw new KnowledgeError('FILE_TOO_LARGE')
    if (head.ContentType !== expectedMime) throw new KnowledgeError('INVALID_FILE')
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }))
    if (!object.Body) throw new KnowledgeError('STORAGE_FAILED')
    const bytes = await object.Body.transformToByteArray()
    if (bytes.length !== expectedSize || bytes.length > MAX_FILE_BYTES) throw new KnowledgeError('INVALID_FILE')
    return bytes
  } catch (error) {
    if (error instanceof KnowledgeError) throw error
    throw new KnowledgeError('STORAGE_FAILED')
  } finally { client.destroy() }
}

// The browser can replay a signed PUT to its staging key until expiry. Seal the verified
// bytes under a fresh server-only key before marking the document READY.
export async function writeSealedObject(objectKey: string, bytes: Uint8Array, mimeType: string) {
  const { client, bucket } = config()
  try { await client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: bytes, ContentType: mimeType })) }
  catch { throw new KnowledgeError('STORAGE_FAILED') }
  finally { client.destroy() }
}

export async function deletePrivateObject(objectKey: string) {
  const { client, bucket } = config()
  try { await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey })) }
  finally { client.destroy() }
}
