import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import * as curriculum from '../src/data/courses.js'
import { StageAccessActions } from '../src/components/StageAccessActions.js'
import type { Stage } from '../src/data/courses.js'

function fixture(completed: number, owned = false): Stage {
  return {
    ...curriculum.stages[0], status: owned ? 'in_progress' : 'locked',
    lessons: curriculum.stages[0].lessons.map((lesson, index) => ({
      ...lesson, status: index < completed ? 'completed' : lesson.isPreview || owned ? 'not_started' : 'locked',
    })),
  }
}
function render(stage: Stage, purchasable = true) {
  return renderToStaticMarkup(createElement(StaticRouter, { location: '/' },
    createElement(StageAccessActions, { stage, purchasable, onPurchase: () => {} })))
}

test('StageAccess offers the first preview to an unentitled new learner', () => {
  const html = render(fixture(0))
  assert.match(html, /开始免费体验/)
  assert.match(html, /href="\/lesson\/stage-1\/s1-l0"/)
  assert.match(html, /开通本阶段/)
})
test('StageAccess continues at the first unfinished preview', () => {
  const html = render(fixture(1))
  assert.match(html, /继续免费体验/)
  assert.match(html, /href="\/lesson\/stage-1\/s1-l1"/)
  assert.match(html, /开通本阶段/)
  assert.doesNotMatch(html, /s1-l0|开始免费体验/)
})
test('StageAccess converts completed preview learners without looping to preparation', () => {
  const html = render(fixture(2))
  assert.match(html, /免费体验已完成/)
  assert.match(html, /开通 Stage 1/)
  assert.doesNotMatch(html, /开始免费体验|继续免费体验|href=.*s1-l0/)
  assert.match(render(fixture(2), false), /disabled=""[^>]*>暂不开放购买/)
})
test('StageAccess prioritizes owned access regardless of preview completion', () => {
  for (const completed of [0, 1, 2, 3, 4, 5, 6]) {
    const html = render(fixture(completed, true))
    assert.match(html, /继续学习/)
    assert.doesNotMatch(html, /免费体验|开通 Stage|开通本阶段/)
    if (completed === 2) assert.match(html, /href="\/lesson\/stage-1\/s1-l2"/)
    if (completed === 3) assert.match(html, /href="\/lesson\/stage-1\/s1-l3"/)
    if (completed === 4) assert.match(html, /href="\/lesson\/stage-1\/s1-l4"/)
    if (completed === 6) assert.match(html, /href="\/lesson\/stage-1\/s1-l6"/)
    if (completed === 5) assert.match(html, /href="\/lesson\/stage-1\/s1-l5"/)
  }
})
test('StageAccess derives arbitrary preview IDs in course order and ignores unpublished previews', () => {
  const stage = fixture(0)
  stage.lessons = [
    { ...stage.lessons[1], id: 'future', order: 0, isPublished: false },
    { ...stage.lessons[1], id: 'preview-b', order: 9 },
    { ...stage.lessons[0], id: 'preview-a', order: 3, status: 'completed' },
  ]
  assert.match(render(stage), /href="\/lesson\/stage-1\/preview-b"/)
  stage.lessons[1].status = 'completed'
  assert.match(render(stage), /免费体验已完成/)
  stage.lessons = []
  assert.doesNotMatch(render(stage), /免费体验/)
  assert.match(render(stage), /开通本阶段/)
})
test('curriculum exports no static user progress', () => {
  for (const name of ['completedLessons', 'overallPercent', 'currentStage', 'currentLesson']) {
    assert.equal(Object.hasOwn(curriculum, name), false, name)
  }
})

test('completed Stage 1 goes to self-check instead of looping to preparation', () => {
  const stage = fixture(7, true)
  stage.status = 'completed'
  const html = render(stage)
  assert.match(html, /href="\/stage\/stage-1#cp-1"/)
  assert.doesNotMatch(html, /s1-l0|s1-l7|继续学习/)
})
