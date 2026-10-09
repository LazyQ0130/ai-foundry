import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { stages, curriculumFormalLessonCount } from '../src/data/courses.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'
import { planTemplates, projects } from '../src/data/site.js'

const coursePage = readFileSync('src/pages/CourseCatalog.tsx', 'utf8')
const capstonePage = readFileSync('src/pages/CapstoneOverview.tsx', 'utf8')
const layout = readFileSync('src/components/Layout.tsx', 'utf8')
const app = readFileSync('src/App.tsx', 'utf8')

test('course page merges learning path and stage projects: four stages, project links, progress', () => {
  assert.equal(stages.length, 4)
  assert.equal(curriculumFormalLessonCount(), 29)
  assert.match(coursePage, /stages\.map\(\(s, i\) =>/)
  assert.match(coursePage, /stageCompletedCount\(stage\)/)
  assert.match(coursePage, /stageLessonCount\(stage\)/)
  assert.match(coursePage, /to=\{`\/project\/\$\{stage\.project\.id\}`\}/)
  assert.match(coursePage, /id="projects"/)
  assert.match(coursePage, /aria-expanded=\{open\}/)
  for (const stage of stages) assert.ok(projects.some((project) => project.id === stage.project.id))
  assert.equal(projects.length, 4)
  assert.ok(projects.every((project) => project.id !== 'capstone'))
  assert.equal(stages[3].project.title, 'AI 研究 Agent')
})

test('top navigation has four entries and old learning-path / projects URLs redirect', () => {
  const nav = layout.slice(layout.indexOf('function navLinksFor'), layout.indexOf('function Navbar'))
  assert.equal((nav.match(/label: '/g) ?? []).length, 5) // 课程导读 / 我的学习 share the first slot
  for (const label of ['我的学习', '课程导读', '课程', '项目工坊', '价格']) assert.ok(nav.includes(`label: '${label}'`))
  assert.doesNotMatch(nav, /学习路径|label: '项目'/)
  assert.match(app, /path="path" element=\{<Navigate to="\/courses" replace \/>\}/)
  assert.match(app, /path="projects" element=\{<Navigate to="\/courses#projects" replace \/>\}/)
  assert.ok(!existsSync('src/pages/LearningPath.tsx') && !existsSync('src/pages/ProjectsPage.tsx'))
  assert.doesNotMatch(app, /LearningPath|ProjectsPage/)
})

test('Project Lab future directions live on the Capstone page and stay presentation only', () => {
  const futureSection = capstonePage.split('更多综合项目实战将持续更新')[1]
  assert.match(capstonePage, /具体新增内容与开放时间以上线页面为准/)
  assert.match(capstonePage, /未来方向 · 尚非已上线项目/)
  assert.match(capstonePage, /futureDirections\.map/)
  for (const direction of ['AI SaaS 产品', '知识库 Agent', 'AI 工作流自动化', '研究 Agent', '多模态 AI 应用']) assert.ok(capstonePage.includes(direction))
  assert.doesNotMatch(futureSection, /getProject|useProgress|stageCompletedCount|stageLessonCount|<Progress|to="\/project\//)
  assert.ok(['暂未解锁', '已开放'].includes(capstoneShowcase.status))
  const course = planTemplates.find((plan) => plan.id === 'all-access')!
  const project = planTemplates.find((plan) => plan.id === 'all-access-projects')!
  assert.doesNotMatch(JSON.stringify(course), /项目工坊|Project Lab|Capstone|后续新增综合项目/)
  assert.ok(project.features.some((feature) => feature.text.includes('后续新增综合项目实战')))
})
