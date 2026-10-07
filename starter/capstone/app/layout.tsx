import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = { title: 'AI Research Workspace' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
