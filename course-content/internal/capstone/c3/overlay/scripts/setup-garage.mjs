import { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3'

const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, C3_APP_ORIGIN } = process.env
if (![S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, C3_APP_ORIGIN].every(Boolean)) {
  throw new Error('Set S3 endpoint, region, bucket, credentials and C3_APP_ORIGIN')
}
const client = new S3Client({ endpoint: S3_ENDPOINT, region: S3_REGION, forcePathStyle: true,
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } })
try {
  try { await client.send(new HeadBucketCommand({ Bucket: S3_BUCKET })) }
  catch { await client.send(new CreateBucketCommand({ Bucket: S3_BUCKET })) }
  await client.send(new PutBucketCorsCommand({ Bucket: S3_BUCKET, CORSConfiguration: { CORSRules: [{
    AllowedOrigins: [C3_APP_ORIGIN], AllowedMethods: ['PUT', 'GET'], AllowedHeaders: ['*'], MaxAgeSeconds: 300,
  }] } }))
  console.log('Private S3 bucket available; browser PUT CORS configured for the local app origin')
} finally { client.destroy() }
