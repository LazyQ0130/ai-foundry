import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as jsx from 'react/jsx-runtime'

const base = 'course-content/internal/stage-1/s1-l6'
type Resource = { id: number; title: string; desc: string; tag: string; important: boolean; date: string }
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
function inspect(variant: string, state: string, data: Resource[], input: [string, string, boolean, string?]) {
  const root = `${base}/implementation-${variant}/${state}`
  let hook = 0
  const imports: Record<string, unknown> = {
    react: { useState: () => { const index = hook++; return [input[index], (value: any) => { (input as any)[index] = value }] } },
    'react/jsx-runtime': jsx, '@/components/ResourceCard': { default: Card },
    '@/components/icons': { Search: () => null },
    '@/lib/resources': { resources: data, tags: original.tags },
  }
  if (existsSync(`${root}/components/ResourceStats.tsx`)) {
    imports['@/components/ResourceStats'] = compile(`${root}/components/ResourceStats.tsx`, imports)
  }
  const page = compile(`${root}/app/page.tsx`, imports)
  const ids: number[] = [], paragraphs: string[] = []; let clear: (() => void) | undefined
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
    if (node.type === 'button' && text(node.props.children) === '清除全部筛选') clear = node.props.onClick
    if (node.type === 'p') paragraphs.push(text(node.props.children))
    visit(node.props?.children)
  }
  visit(page.default())
  return { ids, paragraphs, clear }
}


const states: Array<[string, string, boolean]> = [
  ['', '全部', false], ['', '全部', true], ['', '工具', false], ['', '工具', true],
  ['', '教程', true], ['Next.js', '全部', false], ['Excalidraw', '全部', true],
  ['  Next.js  ', '教程', true], ['不存在', '工具', true],
]
test('1.6 A preserves filters, sorts copies and restores source order on non-presorted data', () => {
  const shuffled = [original.resources[4], ...original.resources.filter((_: unknown, i: number) => i !== 4)]
  const data = Object.freeze(shuffled.map(r => Object.freeze({ ...r }))) as unknown as Resource[]
  for (const input of states) {
    const expected = inspect('a', 'before', data, [...input]).ids
    for (const order of ['oldest', 'newest', 'default']) {
      const after = inspect('a', 'after', data, [...input, order])
      const expectedSorted = order === 'default' ? expected : [...expected].sort((a, b) => {
        const left = data.find(r => r.id === a)!.date, right = data.find(r => r.id === b)!.date
        return order === 'oldest' ? left.localeCompare(right) : right.localeCompare(left)
      })
      assert.deepEqual(after.ids, expectedSorted)
      assert.equal(new Set(after.ids).size, after.ids.length)
      assert.ok(after.paragraphs.includes(`当前显示 ${expected.length} 条 · 共 ${data.length} 条资料`))
    }
  }
})
test('1.6 B clears actual handlers for combined and empty states without changing prior filtering', () => {
  const data = Array.from(original.resources) as Resource[]
  for (const input of states) {
    const state: [string, string, boolean] = [...input]
    const after = inspect('b', 'after', data, state)
    assert.deepEqual(after.ids, inspect('b', 'before', data, [...input]).ids)
    assert.ok(after.clear)
    after.clear()
    assert.deepEqual(state, ['', '全部', false])
    const cleared = inspect('b', 'after', data, state)
    assert.deepEqual(cleared.ids, data.map(r => r.id))
    assert.ok(cleared.paragraphs.includes('当前显示 9 条 · 共 9 条资料'))
    cleared.clear!()
    assert.deepEqual(state, ['', '全部', false])
  }
})
