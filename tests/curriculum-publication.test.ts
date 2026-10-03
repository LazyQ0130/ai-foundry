import { test } from 'node:test'
import assert from 'node:assert/strict'
import { curriculumFormalLessonCount, stages } from '../src/data/courses.js'

test('release curriculum publishes all 29 formal lessons across four stages', () => {
  assert.deepEqual(stages.map((stage) => [stage.slug, curriculumFormalLessonCount(stage.slug)]), [
    ['stage-1', 6],
    ['stage-2', 8],
    ['stage-3', 7],
    ['stage-4', 8],
  ])
  assert.equal(curriculumFormalLessonCount(), 29)
  assert.equal(stages.length, 4)

  for (const stage of stages) {
    for (const lesson of stage.lessons.filter((item) => !item.isPrep)) {
      assert.notEqual(lesson.isPublished, false, `${stage.slug}/${lesson.id} must be published`)
    }
  }
})
