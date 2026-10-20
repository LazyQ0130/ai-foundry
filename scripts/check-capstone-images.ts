import assert from 'node:assert/strict'
import sharp from 'sharp'

const reviewedImages: Record<string, string> = {
  c1: 'c1-scope-guide.webp', c2: 'c2-boundary-guide.webp', c3: 'c3-evidence-guide.webp',
  c4: 'c4-report-guide.webp', c5: 'c5-runtime-guide.webp', c6: 'c6-sources-guide.webp',
  c7: 'c7-note-guide.webp', c8: 'c8-eval-guide.webp', c9: 'c9-release-guide.webp',
}

export async function assertCapstoneLessonImages(id: string, body: string) {
  assert.ok(reviewedImages[id], `Unknown Project Lab lesson: ${id}`)
  const images = [...body.matchAll(/!\[([^\]]+)\]\((\S+)(?:\s+"([^"]+)")?\)/g)]
  assert.equal((body.match(/!\[/g) ?? []).length, 1, `Expected one reviewed illustration in ${id}`)
  assert.equal(images.length, 1, `Invalid image syntax in ${id}`)
  const [, alt, url, caption] = images[0]
  assert.ok(alt.trim(), `Missing illustration description in ${id}`)
  assert.equal(url, `/course-media/capstone/${reviewedImages[id]}`, `Unreviewed image in ${id}`)
  assert.match(caption ?? '', /教学示意/, `Missing illustration caption in ${id}`)
  const image = sharp(`public${url}`, { failOn: 'warning' })
  const metadata = await image.metadata()
  assert.equal(metadata.format, 'webp', `Invalid illustration format in ${id}`)
  await image.stats()
}
