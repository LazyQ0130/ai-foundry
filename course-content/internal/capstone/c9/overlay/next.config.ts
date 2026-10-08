import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
 output: 'standalone',
 outputFileTracingRoot: process.cwd(),
 serverExternalPackages: ['pdfjs-dist'],
 outputFileTracingIncludes: { '/api/knowledge/documents/*/process': ['./node_modules/pdfjs-dist/legacy/build/**/*'] },
}
export default nextConfig
