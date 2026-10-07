import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { CapstoneHomeTeaser, CapstonePathCard } from '../src/components/CapstoneShowcase.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'
import { stages, curriculumFormalLessonCount } from '../src/data/courses.js'
import CapstoneOverview from '../src/pages/CapstoneOverview.js'

function render(node: ReturnType<typeof createElement>) {
  return renderToStaticMarkup(createElement(StaticRouter, { location: '/' }, node))
}

test('Capstone has its own locked showcase data and does not enter course statistics', () => {
  assert.equal(capstoneShowcase.lessons.length, 8)
  assert.equal(stages.length, 4)
  assert.equal(curriculumFormalLessonCount(), 29)
  assert.equal(capstoneShowcase.status, '暂未解锁')
  assert.equal(capstoneShowcase.badge, 'Project Lab 专属')
  assert.equal(capstoneShowcase.project, 'AI 研究工作台')
  assert.equal(capstoneShowcase.projectEn, 'AI Research Workspace')
  assert.equal(capstoneShowcase.subtitle, 'AI 研究 Agent 毕业项目实战')
})

test('learning path and home teaser link to the public Capstone overview', () => {
  assert.match(render(createElement(CapstonePathCard)), /href="\/capstone"/)
  assert.match(render(createElement(CapstonePathCard)), /AI 研究工作台/)
  assert.match(render(createElement(CapstoneHomeTeaser)), /AI 研究工作台/)
})

test('Capstone overview lists eight locked lessons without lesson or purchase links', async () => {
  const html = render(createElement(CapstoneOverview))
  assert.match(html, /AI Foundry Capstone Project/)
  assert.match(html, /<h1[^>]*>AI 研究工作台<\/h1>/)
  assert.match(html, /AI 研究 Agent 毕业项目实战/)
  assert.match(html, /AI Research Workspace/)
  assert.equal((html.match(/aria-label="C[1-8] /g) ?? []).length, 8)
  assert.equal((html.match(/暂未解锁/g) ?? []).length >= 9, true)
  assert.doesNotMatch(html, /href="\/lesson\/|立即学习|购买|¥\d|已完成 \d+%/)

  const app = await readFile('src/App.tsx', 'utf8')
  assert.match(app, /path="capstone" element=\{<CapstoneOverview \/>\}/)
})
