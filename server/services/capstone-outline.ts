import { capstoneLessons } from '../data/capstoneLessons.js'
import { capstoneShowcase } from '../data/capstoneShowcase.js'

export function capstoneOutline() {
  return capstoneLessons.filter(lesson => lesson.published).map(({ id, title, order, estimatedTime }) => {
    const overview = capstoneShowcase.lessons.find(item => item.code.toLowerCase() === id)
    return { id, title, order, estimatedTime, phase: overview?.phase ?? '', desc: overview?.desc ?? '' }
  })
}
