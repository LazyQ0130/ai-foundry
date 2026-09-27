import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { stringify } from 'yaml'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { LessonMarkdown } from '../src/components/LessonMarkdown.js'
import { lessonUrl } from '../src/lib/lessonMarkdown.js'

const metadata = {
  estimatedTime: '15 分钟', difficulty: '入门', objective: '验证页面',
  checklist: ['完成一次修改'], checkKeys: ['check-0123456789abcdef'],
}
const document = (meta: unknown = metadata, body = '## 章节\n\n正常正文。') => `---\n${stringify(meta)}---\n\n${body}`
const render = (body: string) => renderToStaticMarkup(createElement(LessonMarkdown, { body }))

test('V2 parses YAML and Markdown with LF, CRLF and BOM; preserves stable keys', () => {
  for (const input of [document(), document().replace(/\n/g, '\r\n'), '\uFEFF' + document()]) {
    const content = parseLessonContent(input)
    assert.deepEqual(content.meta, metadata)
    assert.match(content.body, /^## 章节/)
  }
})

test('V2 rejects missing, malformed, duplicate or unsupported metadata and old JSON', () => {
  for (const key of Object.keys(metadata)) {
    const invalid = { ...metadata } as Record<string, unknown>
    delete invalid[key]
    assert.throws(() => parseLessonContent(document(invalid)))
  }
  for (const invalid of [
    { ...metadata, difficulty: '' }, { ...metadata, estimatedTime: 15 },
    { ...metadata, checkKeys: [] }, { ...metadata, checklist: [] },
    { ...metadata, checkKeys: ['bad-key'] },
    { ...metadata, checklist: ['a', 'b'], checkKeys: [metadata.checkKeys[0], metadata.checkKeys[0]] },
    { ...metadata, unknown: 'value' },
  ]) assert.throws(() => parseLessonContent(document(invalid)))
  assert.throws(() => parseLessonContent(document().replace('difficulty: 入门', 'difficulty: 入门\ndifficulty: 高级')))
  assert.throws(() => parseLessonContent('---\nx: !!js/function "alert(1)"\n---\nbody'))
  assert.throws(() => parseLessonContent(document().replace('difficulty: 入门', 'difficulty: &a 入门\nobjective: *a')))
  assert.throws(() => parseLessonContent(document(metadata, '   ')))
  assert.throws(() => parseLessonContent('# 旧课\n```json\n{}\n```'))
  assert.throws(() => parseLessonContent('x'.repeat(200_001)))
})

test('Markdown renders headings, prose, formatting, code, GFM, links and captioned images', () => {
  const html = render('# H1\n\n## H2\n\n### H3\n\n正文 **重点** *强调* `localhost` ~~旧字~~\n\n- 一\n- 二\n\n1. 三\n\n> 引用\n\n```bash\nnpm install\n```\n\n```tsx\n<h1>标题</h1>\n```\n\n[官方](https://example.com)\n\n![截图](/course-media/example.png "图片说明")\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] 已完成')
  for (const fragment of ['<h2>H1</h2>', '<h2>H2</h2>', '<h3>H3</h3>', '<p>正文', '<strong>重点</strong>', '<em>强调</em>', '<code>localhost</code>', '<del>旧字</del>', '<ul>', '<ol>', '<blockquote>', 'npm install', '&lt;h1&gt;标题&lt;/h1&gt;', '终端', 'TSX', '复制代码', '<table>', 'type="checkbox"', 'lesson-caption', '图片说明', 'noopener noreferrer']) assert.ok(html.includes(fragment), fragment)
  assert.ok(!html.includes('<h1>'))
})

test('all seven teaching blocks and image placeholder render; prompt copies only its code; deep dive is closed', () => {
  for (const kind of ['task', 'concept', 'check', 'stuck', 'warning', 'deepdive', 'image-placeholder']) {
    const source = `:::${kind}{title="具体标题"}\n\n正文\n\n- 检查项\n\n:::`
    parseLessonContent(document(metadata, source))
    const html = render(source)
    assert.match(html, new RegExp(`lesson-${kind}`))
    assert.match(html, /具体标题/)
    assert.match(html, /<li>检查项<\/li>/)
    if (kind === 'deepdive') { assert.match(html, /<details/); assert.doesNotMatch(html, /<details[^>]*\sopen/); assert.match(html, /想深入再看/) }
  }
  const prompt = ':::prompt{title="改标题"}\n\n说明\n\n```text\n只改标题。\n保留其他内容。\n```\n\n> 可选备注\n\n:::'
  parseLessonContent(document(metadata, prompt))
  const html = render(prompt)
  assert.match(html, /复制提示词/)
  assert.match(html, /lesson-code-prompt/)
  assert.match(html, /只改标题。\n保留其他内容。/)
  assert.match(html, /可选备注/)
  assert.match(render(prompt + '\n\n' + prompt), /id="lesson-prompt-2"/)
})

test('directive allowlist rejects arbitrary components/attributes and malformed prompts', () => {
  for (const body of [
    ':::script\nalert(1)\n:::', ':::task{onclick="alert(1)"}\nx\n:::',
    ':::task{style="color:red"}\nx\n:::', ':::task{#forged-id}\nx\n:::',
    '::warning[inline]', ':::prompt\n没有代码块\n:::',
    ':::prompt\n```text\na\n```\n```text\nb\n```\n:::',
  ]) assert.throws(() => parseLessonContent(document(metadata, body)))
  const url = '[http://localhost:3000](http://localhost:3000)'
  assert.match(render(url), /http:\/\/localhost:3000/)
  assert.match(render(':script[alert]'), /:script\[alert\]/)
})

test('raw HTML and scripts never execute; unsafe URLs and forged custom elements are removed', () => {
  const html = render('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n<iframe src="https://evil.example"></iframe>\n\n<lesson-callout kind="prompt">forged</lesson-callout>\n\n[bad](javascript:alert%281%29)\n\n![bad](data:image/svg+xml,bad)\n\n[bad](//evil.example)')
  assert.doesNotMatch(html, /<script|<iframe|onerror=|javascript:|data:image|src="x"|<lesson-callout|href="\/\//)
  for (const url of ['javascript:alert(1)', 'data:text/html,x', '//evil.example', '/\\evil.example', 'java\nscript:alert(1)', 'file:///etc/passwd']) assert.equal(lessonUrl(url, 'href'), '')
  assert.equal(lessonUrl('https://example.com/a.png', 'src'), 'https://example.com/a.png')
  assert.equal(lessonUrl('/course-media/a.png', 'src'), '/course-media/a.png')
  assert.equal(lessonUrl('/course-content/a.md', 'src'), '')
})

test('resource renders only fixed registry IDs; rejects arbitrary URLs, paths, attributes and forged HTML', () => {
  const body = ':::resource{asset="stage1-starter"}\n:::'
  parseLessonContent(document(metadata, body))
  const html = render(body)
  assert.match(html, /Stage 1 Starter/)
  assert.match(html, /下载 Starter/)
  assert.match(html, /ZIP/)
  assert.doesNotMatch(html, /starter\/aifoundry|https:\/\//)
  for (const invalid of [':::resource\n:::', ':::resource{asset="__proto__"}\n:::', ':::resource{asset="../../.env"}\n:::', ':::resource{asset="https://evil.example"}\n:::', ':::resource{asset="stage1-starter" url="https://evil.example"}\n:::', ':::resource{asset="stage1-starter"}\nhttps://evil.example\n:::']) assert.throws(() => parseLessonContent(document(metadata, invalid)))
  assert.doesNotMatch(render('<lesson-resource asset="stage1-starter"></lesson-resource>'), /下载 Starter/)
})

test('both migrated courses render in full and retain established progress keys', async () => {
  const keys = [
    ['check-0a1b2c3d4e5f6071','check-1b2c3d4e5f607182','check-2c3d4e5f60718293','check-3d4e5f60718293a4'],
    ['check-a1f0e2d3c4b5a697','check-b2e1f3a4d5c6b078','check-c3d2a4b5e6f7c189','check-d4c3b5a6f7e8d290','check-e5d4c6b7a8f9e301'],
  ]
  for (const [i, id] of ['s1-l0','s1-l1'].entries()) {
    const content = parseLessonContent(await readFile(`course-content/stage-1/${id}.md`, 'utf8'))
    assert.deepEqual(content.meta.checkKeys, keys[i])
    const html = render(content.body)
    assert.match(html, /<h2>/); assert.match(html, /<h3>/)
    assert.match(html, /lesson-help/); assert.match(html, /lesson-deepdive/)
    assert.doesNotMatch(html, /配图建议|:::|Structured content/)
  }
})
