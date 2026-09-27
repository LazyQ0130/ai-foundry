import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { CourseResource } from './CourseResource.js'
import { calloutLabels, lessonUrl, remarkLessonBlocks, type CalloutKind } from '../lib/lessonMarkdown.js'

function CopyButton({ text, prompt = false }: { text: string; prompt?: boolean }) {
  const [status, setStatus] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy() {
    clearTimeout(timer.current)
    try { await navigator.clipboard.writeText(text); setStatus('已复制') }
    catch { setStatus('复制失败，请手动选择') }
    timer.current = setTimeout(() => setStatus(''), 2400)
  }
  return <button type="button" className="lesson-copy" onClick={() => void copy()} aria-live="polite">
    {status || (prompt ? '复制提示词' : '复制代码')}
  </button>
}

function CodeBlock({ children, prompt = false }: { children: ReactNode; prompt?: boolean }) {
  const child = Children.toArray(children).find(isValidElement)
  const props = child?.props as { children?: ReactNode; className?: string } | undefined
  const code = String(props?.children ?? '').replace(/\n$/, '')
  const language = props?.className?.replace(/^language-/, '') ?? 'text'
  return <div className={`lesson-code${prompt ? ' lesson-code-prompt' : ''}`}>
    <div className="lesson-code-bar"><span>{prompt ? '给 AI 的提示词' : /^(bash|sh|shell|powershell)$/.test(language) ? '终端' : language.toUpperCase()}</span><CopyButton text={code} prompt={prompt}/></div>
    <pre tabIndex={0} aria-label={prompt ? '参考提示词内容' : `${language} 代码`}><code>{code}</code></pre>
  </div>
}

function Callout({ kind, title, id, children }: { kind: CalloutKind; title?: string; id?: string; children?: ReactNode }) {
  const label = calloutLabels[kind]
  if (!label) return null
  if (kind === 'deepdive') return <details id={id} className="lesson-callout lesson-deepdive">
    <summary>{label}{title ? `：${title}` : ''}</summary><div className="lesson-callout-body">{children}</div>
  </details>
  return <aside id={id} className={`lesson-callout lesson-${kind}`} aria-label={title || label}>
    <div className="lesson-callout-label">{label}</div>
    {title && <div className="lesson-callout-title">{title}</div>}
    <div className="lesson-callout-body">{Children.map(children, child => {
      if (kind === 'prompt' && isValidElement<{ children: ReactNode }>(child) && child.type === CodeBlock) return <CodeBlock prompt>{child.props.children}</CodeBlock>
      return child
    })}</div>
  </aside>
}

const components = {
  // The page owns H1; an author H1 is demoted to preserve one page title.
  h1: ({ children }) => <h2>{children}</h2>,
  pre: CodeBlock,
  a: ({ href, children }) => href ? <a href={href} {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a> : <span>{children}</span>,
  img: ({ src, alt, title }) => src ? <span className="lesson-figure" role="group" aria-label={alt}>
    <img src={src} alt={alt ?? ''} loading="lazy" referrerPolicy="no-referrer"/>
    {(title || alt) && <span className="lesson-caption">{title || alt}</span>}
  </span> : <span className="lesson-caption">{alt}</span>,
  table: ({ children }) => <div className="lesson-table" tabIndex={0} role="region" aria-label="课程表格"><table>{children}</table></div>,
  'lesson-callout': Callout,
  'lesson-resource': CourseResource,
} as Components

export function LessonMarkdown({ body }: { body: string }) {
  return <div className="lesson-prose"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm, remarkDirective, remarkLessonBlocks]} components={components} urlTransform={lessonUrl}>{body}</ReactMarkdown></div>
}

