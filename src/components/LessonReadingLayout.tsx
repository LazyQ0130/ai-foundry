import { useMemo, type ComponentProps } from 'react'
import { LessonLayout } from './LessonLayout.js'
import { extractLessonHelp } from '../lib/lessonMarkdown.js'

/** Load the Markdown parser only when an authorized lesson body is ready to read. */
export default function LessonReadingLayout({ body, ...props }: Omit<ComponentProps<typeof LessonLayout>, 'helpItems'> & { body: string }) {
  const helpItems = useMemo(() => extractLessonHelp(body), [body])
  return <LessonLayout {...props} helpItems={helpItems} />
}
