import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as jsx from 'react/jsx-runtime'
import type { ReactElement } from 'react'

const base = 'course-content/internal/stage-1/s1-l3'
type Resource = { id: number; title: string; desc: string; tag: string; important: boolean }
function compile(source: string, imports: Record<string, unknown> = {}) {
  const exports: Record<string, any> = {}
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020,
  } }).outputText
  runInNewContext(output, { exports, require: (id: string) => {
    if (!(id in imports)) throw new Error(`Unexpected reference dependency ${id}`)
    return imports[id]
  } })
  return exports
}
const data = compile(readFileSync(`${base}/common/lib/resources.ts`, 'utf8'))
const resources: Resource[] = data.resources
const Card = () => null

// Execute the actual page component at specified input states, inspecting the
// resources handed to its cards. Browser tests separately cover event wiring.
function cards(variant: string, faulty: boolean, query: string, tag: string, important: boolean) {
  const states = [query, tag, important]
  let hook = 0
  const page = compile(readFileSync(`${base}/implementation-${variant}/${faulty ? 'faulty-page' : 'page'}.tsx`, 'utf8'), {
    react: { useState: () => [states[hook++], () => {}] },
    'react/jsx-runtime': jsx,
    '@/components/ResourceCard': { default: Card },
    '@/components/icons': { Search: () => null },
    '@/lib/resources': data,
  })
  const ids: number[] = []
  function visit(node: unknown) {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== 'object') return
    const element = node as ReactElement<{ resource?: Resource; children?: unknown }>
    if (element.type === Card) ids.push(element.props.resource!.id)
    visit(element.props?.children)
  }
  visit(page.default())
  return ids
}

for (const variant of ['a', 'b']) {
  test(`1.3 reference ${variant}: final combinations match data; injected defect is limited to important + tools`, () => {
    // This oracle expresses behavior, not the reference's variable names or operators.
    for (const query of ['', 'Next.js', 'Excalidraw', '  Next.js  ', '不存在', '流程图']) {
      for (const tag of data.tags as string[]) {
        for (const important of [false, true]) {
          const expected = Array.from(resources).filter(r =>
            (tag === '全部' || r.tag === tag) &&
            `${r.title}\n${r.desc}`.includes(query.trim()) &&
            (!important || r.important)
          ).map(r => r.id)
          assert.deepEqual(cards(variant, false, query, tag, important), expected, `${variant}/${query}/${tag}/${important}`)
          const faultyExpected = important && tag === '工具'
            ? Array.from(resources).filter(r => r.tag === tag && `${r.title}\n${r.desc}`.includes(query.trim())).map(r => r.id)
            : expected
          assert.deepEqual(cards(variant, true, query, tag, important), faultyExpected)
        }
      }
    }
    assert.deepEqual(cards(variant, true, '', '工具', true), [3, 6])
    assert.deepEqual(cards(variant, false, '', '教程', true), [1, 2])
  })
}

test('1.3 internal data and components preserve the delivered Starter; prompt archive matches lesson', () => {
  for (const path of ['lib/resources.ts', 'components/ResourceCard.tsx', 'components/icons.tsx']) {
    assert.equal(readFileSync(`${base}/common/${path}`, 'utf8'), readFileSync(`starter/stage-1/${path}`, 'utf8'))
  }
  const lesson = readFileSync('course-content/stage-1/s1-l3.md', 'utf8')
  const prompts = Array.from(lesson.matchAll(/:::prompt[^\n]*\n\n```text\n([\s\S]*?)\n```/g), match => match[1])
  assert.equal(prompts.length, 3)
  assert.deepEqual(JSON.parse(readFileSync(`${base}/prompts.json`, 'utf8')), prompts)
})
