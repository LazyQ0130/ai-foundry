import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as jsx from 'react/jsx-runtime'

const base = 'course-content/internal/stage-1/s1-l4'
type Resource = { id: number; title: string; desc: string; tag: string; important: boolean }
function compile(path: string, imports: Record<string, unknown> = {}) {
  const exports: Record<string, any> = {}
  const output = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020,
  } }).outputText
  runInNewContext(output, { exports, require: (id: string) => {
    if (!(id in imports)) throw new Error(`Unexpected reference dependency ${id}`)
    return imports[id]
  } })
  return exports
}
const original = compile('course-content/internal/stage-1/s1-l3/common/lib/resources.ts')
const Card = () => null
function inspect(variant: string, state: string, data: Resource[], input: [string, string, boolean]) {
  const root = `${base}/implementation-${variant}/${state}`
  let hook = 0
  const imports: Record<string, unknown> = {
    react: { useState: () => [input[hook++], () => {}] },
    'react/jsx-runtime': jsx, '@/components/ResourceCard': { default: Card },
    '@/components/icons': { Search: () => null },
    '@/lib/resources': { resources: data, tags: original.tags },
  }
  if (existsSync(`${root}/components/ResourceStats.tsx`)) {
    imports['@/components/ResourceStats'] = compile(`${root}/components/ResourceStats.tsx`, imports)
  }
  const page = compile(`${root}/app/page.tsx`, imports)
  const ids: number[] = [], paragraphs: string[] = []
  function text(node: any): string {
    if (node == null || typeof node === 'boolean') return ''
    if (Array.isArray(node)) return node.map(text).join('')
    if (typeof node !== 'object') return String(node)
    return text(node.props?.children)
  }
  function visit(node: any) {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== 'object') return
    if (node.type === Card) { ids.push(node.props.resource.id); return }
    if (typeof node.type === 'function') { visit(node.type(node.props)); return }
    if (node.type === 'p') paragraphs.push(text(node.props.children))
    visit(node.props?.children)
  }
  visit(page.default())
  return { ids, paragraphs }
}

const states: Array<[string, string, boolean]> = [
  ['', '全部', false], ['', '全部', true], ['', '工具', false], ['', '工具', true],
  ['', '教程', true], ['Next.js', '全部', false], ['Excalidraw', '全部', true],
  ['Excalidraw', '全部', false], ['不存在', '全部', false], ['  Next.js  ', '教程', true],
]
for (const variant of ['a', 'b']) {
  test(`1.4 ${variant}: statistics use actual final results and total; cards match the prior implementation`, () => {
    // Include different totals to catch hard-coded demonstration numbers. Only
    // test inputs change; the frozen resources file is never modified.
    const datasets: Resource[][] = [Array.from(original.resources), [], [
      ...Array.from(original.resources as Resource[]),
      { id: 10, title: '另一个工具', desc: '自定义资料', tag: '工具', important: true },
    ]]
    for (const data of datasets) for (const input of states) {
      const [query, tag, important] = input
      const expected = data.filter(r => (tag === '全部' || r.tag === tag) &&
        (r.title.includes(query.trim()) || r.desc.includes(query.trim())) && (!important || r.important)).map(r => r.id)
      const before = inspect(variant, 'before', data, input)
      const after = inspect(variant, 'after', data, input)
      assert.deepEqual(before.ids, expected)
      assert.deepEqual(after.ids, before.ids)
      assert.ok(before.paragraphs.includes(`共 ${data.length} 条资料`))
      assert.ok(after.paragraphs.includes(`当前显示 ${expected.length} 条 · 共 ${data.length} 条资料`))
    }
  })
}

test('1.4 archived prompts match the published lesson and the new progress keys are unique', () => {
  const lesson = readFileSync('course-content/stage-1/s1-l4.md', 'utf8')
  const prompts = Array.from(lesson.matchAll(/:::prompt[^\n]*\n\n```text\n([\s\S]*?)\n```/g), match => match[1])
  assert.equal(prompts.length, 3)
  assert.deepEqual(JSON.parse(readFileSync(`${base}/prompts.json`, 'utf8')), prompts)
  const keys = [...lesson.matchAll(/check-[a-f0-9]{16}/g)].map(match => match[0])
  assert.equal(keys.length, 5)
  assert.equal(new Set(keys).size, 5)
})
