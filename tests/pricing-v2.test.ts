import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planTemplates } from '../src/data/site.js'
import { isPlanOpen } from '../src/data/planAccess.js'

test('pricing v2 defines four stages and two distinct bundles', () => {
  assert.deepEqual(planTemplates.map((plan) => plan.id), ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'all-access', 'all-access-projects'])
  const course = planTemplates[4]
  const project = planTemplates[5]
  assert.equal(course.featured, undefined)
  assert.equal(project.featured, true)
  assert.equal(project.badge, '推荐')
  assert.doesNotMatch(JSON.stringify(course), /Project Lab|Capstone|后续综合项目/)
  assert.match(JSON.stringify(project), /Project Lab/)
  assert.match(JSON.stringify(project), /Capstone/)
  assert.match(JSON.stringify(project), /后续新增综合项目/)
})

test('purchase status distinguishes course-only and project plans', () => {
  const stages = ['stage-1', 'stage-2', 'stage-3', 'stage-4']
  assert.equal(isPlanOpen('all-access', stages, []), true)
  assert.equal(isPlanOpen('all-access-projects', stages, []), false)
  assert.equal(isPlanOpen('all-access', stages, ['project-lab']), true)
  assert.equal(isPlanOpen('all-access-projects', stages, ['project-lab']), true)
  assert.equal(isPlanOpen('stage-2', ['stage-2'], []), true)
  assert.equal(isPlanOpen('all-access', ['stage-2'], []), false)
})
