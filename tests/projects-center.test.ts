import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stages, curriculumFormalLessonCount } from '../src/data/courses.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'
import { planTemplates, projects } from '../src/data/site.js'

const page = readFileSync('src/pages/ProjectsPage.tsx', 'utf8')

test('projects center keeps four stage project links and course progress', () => {
  assert.equal(stages.length, 4)
  assert.equal(curriculumFormalLessonCount(), 29)
  assert.match(page, /stages\.map\(\(s\) =>/)
  assert.match(page, /stageCompletedCount\(s\)/)
  assert.match(page, /stageLessonCount\(s\)/)
  for (const stage of stages) {
    assert.ok(projects.some((project) => project.id === stage.project.id))
  }
  assert.match(page, /to=\{`\/project\/\$\{s\.project\.id\}`\}/)
})

test('Capstone uses shared showcase data and only links to its public overview', () => {
  const capstoneSection = page.split('aria-labelledby="capstone-projects-heading"')[1].split('aria-labelledby="future-projects-heading"')[0]
  assert.match(page, /\{capstoneShowcase\.project\}/)
  assert.match(page, /\{capstoneShowcase\.projectEn\}/)
  assert.match(page, /\{capstoneShowcase\.description\}/)
  assert.match(page, /\{capstoneShowcase\.status\}/)
  assert.match(page, /\{capstoneShowcase\.badge\}/)
  assert.match(page, /to="\/capstone"/)
  assert.doesNotMatch(page, /to="\/project\/capstone|to="\/lesson\/capstone/)
  assert.equal(capstoneShowcase.status, '暂未解锁')
  assert.equal(projects.length, 4)
  assert.ok(projects.every((project) => project.id !== 'capstone'))
  assert.equal(stages[3].project.title, 'AI 研究 Agent')
  assert.equal(projects.find((project) => project.stageId === 4)?.title, 'AI 研究 Agent')
  assert.doesNotMatch(capstoneSection, /useProgress|stageCompletedCount|stageLessonCount|<Progress/)
})

test('future directions remain presentation only and match all-access pricing', () => {
  const futureSection = page.split('aria-labelledby="future-projects-heading"')[1].split('<section className="shell pb-12')[0]
  assert.match(page, /更多综合项目实战将持续更新/)
  assert.match(page, /具体新增内容与开放时间以上线页面为准/)
  assert.match(page, /未来方向 · 尚非已上线项目/)
  assert.match(page, /futureDirections\.map/)
  for (const direction of ['AI SaaS 产品', '知识库 Agent', 'AI 工作流自动化', '研究 Agent', '多模态 AI 应用']) assert.ok(page.includes(direction))
  assert.doesNotMatch(futureSection, /getProject|useProgress|stageCompletedCount|stageLessonCount|<Progress|to="\/project\//)
  const allAccess = planTemplates.find((plan) => plan.id === 'all-access')!
  assert.ok(allAccess.features.some((feature) => feature.text.includes('后续新增综合项目实战')))
  assert.ok(allAccess.features.some((feature) => feature.text.includes('暂未解锁')))
})
