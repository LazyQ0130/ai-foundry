import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stages, type Stage } from '../src/data/courses.js'
import { dashboardState } from '../src/data/dashboardState.js'
import { getProject, projects } from '../src/data/site.js'

const stage1 = stages[0]
const stage2 = stages[1]
function withStatus(stage: Stage, completed: string[] = []): Stage {
  return {
    ...stage,
    status: stage.lessons.filter(lesson => !lesson.isPrep).every(lesson => completed.includes(lesson.id)) ? 'completed' : 'in_progress',
    lessons: stage.lessons.map(lesson => ({ ...lesson, status: completed.includes(lesson.id) ? 'completed' : 'not_started' })),
  }
}

test('Dashboard state distinguishes free, learning, completed and later available stage', () => {
  assert.equal(dashboardState(stages, [], '/lesson/stage-1/s1-l1').kind, 'free')
  const learning = dashboardState([withStatus(stage1, ['s1-l0', 's1-l1'])], ['stage-1'], '/lesson/stage-1/s1-l2')
  assert.equal(learning.kind, 'continue')
  if (learning.kind === 'continue') assert.equal(learning.lesson.id, 's1-l2')

  const finished = withStatus(stage1, stage1.lessons.map(lesson => lesson.id))
  const complete = dashboardState([finished], ['stage-1'], '/courses')
  assert.equal(complete.kind, 'completed')
  if (complete.kind === 'completed') assert.equal(complete.stage.slug, 'stage-1')
  assert.equal(dashboardState([withStatus(stage1, stage1.lessons.filter(lesson => !lesson.isPrep).map(lesson => lesson.id))], ['stage-1'], '/courses').kind, 'completed')

  const later: Stage = { ...withStatus(stage2), lessons: stage2.lessons.map((lesson, index) => ({ ...lesson, isPublished: index === 0 })) }
  const continueLater = dashboardState([finished, later], ['stage-1', 'stage-2'], '/courses')
  assert.equal(continueLater.kind, 'continue')
  if (continueLater.kind === 'continue') assert.equal(continueLater.stage.slug, 'stage-2')
})

test('Stage 2 eight-lesson completion stays completed when Stage 3 has no access', () => {
  const stage2Done = withStatus(stage2, stage2.lessons.map(lesson => lesson.id))
  assert.equal(stage2Done.lessons.length, 8)
  const state = dashboardState([stage2Done, withStatus(stages[2])], ['stage-2'], '/lesson/stage-2/s2-l8')
  assert.equal(state.kind, 'completed')
  if (state.kind === 'completed') assert.equal(state.stage.slug, 'stage-2')
})

test('project requirements are descriptive and Stage 1 delivery matches taught work', () => {
  for (const project of projects) {
    assert.ok(project.tasks.length > 0)
    assert.ok(project.tasks.every(task => Object.keys(task).join(',') === 'title'))
  }
  const stage1Project = getProject('assistant')!
  const requirements = [...stage1Project.standards, ...stage1Project.tasks].map(item => typeof item === 'string' ? item : item.title).join(' ')
  assert.match(requirements, /本地正常启动/)
  assert.match(requirements, /搜索和筛选/)
  assert.match(requirements, /自己决定/)
  assert.match(requirements, /亲自/)
  assert.match(requirements, /本地 Git/)
  assert.doesNotMatch(requirements, /GitHub|录屏|README|stage-1-complete/)
  assert.match(stage1Project.deliverables.join(' ') + stage1Project.githubTips.join(' '), /GitHub|README|录屏/)
})
