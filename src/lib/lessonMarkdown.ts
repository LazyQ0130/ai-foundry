import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'
import type { VFile } from 'vfile'
import { isCourseAssetId } from '../data/courseAssets.js'

export const calloutLabels = {
  prompt: '参考提示词', task: '现在去做', concept: '先搞懂这件事',
  check: '怎么确认做对了', stuck: '卡住了怎么办', warning: '注意风险',
  deepdive: '想深入再看', 'image-placeholder': '配图待补充',
} as const
export type CalloutKind = keyof typeof calloutLabels

/** Only these attributes are forwarded. Author HTML, event handlers and styles never are. */
export function remarkLessonBlocks() {
  return (tree: Root, file: VFile) => {
    const counts: Record<string, number> = {}
    visit(tree, (node, index, parent) => {
      if (node.type !== 'containerDirective' && node.type !== 'leafDirective' && node.type !== 'textDirective') return
      // Colons in prose/URLs are not teaching blocks (e.g. localhost:3000).
      if (node.type === 'textDirective' && parent && index !== undefined) {
        parent.children[index] = { type: 'text', value: String(file.value).slice(node.position?.start.offset, node.position?.end.offset) }
        return
      }
      if (node.type === 'containerDirective' && node.name === 'resource') {
        const attributes = node.attributes ?? {}
        if (Object.keys(attributes).some(key => key !== 'asset') || !isCourseAssetId(attributes.asset ?? '') || node.children.length) {
          throw new Error('Resource 必须只声明白名单 asset ID，不接受正文、URL 或其他属性')
        }
        node.data = { hName: 'lesson-resource', hProperties: { asset: attributes.asset } }
        return
      }
      if (node.type !== 'containerDirective' || !Object.prototype.hasOwnProperty.call(calloutLabels, node.name)) {
        throw new Error(`不支持的教学块：${node.name}`)
      }
      if (Object.keys(node.attributes ?? {}).some(key => key !== 'title')) throw new Error('教学块只支持 title 属性')
      const title = node.attributes?.title ?? ''
      if (title.length > 160) throw new Error('教学块标题过长')
      const codes = node.children.filter(child => child.type === 'code')
      if (node.name === 'prompt' && (codes.length !== 1 || !codes[0].value.trim())) {
        throw new Error('Prompt 必须包含一个非空的直接子级代码块')
      }
      counts[node.name] = (counts[node.name] ?? 0) + 1
      const anchor = node.name === 'stuck' ? 'lesson-help' : `lesson-${node.name}`
      node.data = { hName: 'lesson-callout', hProperties: {
        kind: node.name, title,
        id: `${anchor}${counts[node.name] === 1 ? '' : `-${counts[node.name]}`}`,
      } }
    })
  }
}

export function validateLessonMarkdown(body: string) {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).use(remarkLessonBlocks)
  const tree = processor.parse(body)
  processor.runSync(tree, { value: body })
}

/** Restrict links and images even if the Markdown parser recognizes another protocol. */
export function lessonUrl(url: string, key: string) {
  if (/[\u0000-\u0020\\]/.test(url) || url.startsWith('//')) return ''
  if (key === 'src') return /^(https:\/\/|\/course-media\/)/i.test(url) ? url : ''
  return /^(https?:\/\/|mailto:|\/[^/]|#)/i.test(url) ? url : ''
}
