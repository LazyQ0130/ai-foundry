import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LessonMarkdown } from '../../../src/components/LessonMarkdown';
import { LessonTaskCard } from '../../../src/components/LessonTaskPanel';

const lesson = await fetch('/lesson.json').then(r => r.json());
function Preview() {
  const [checked, setChecked] = useState<boolean[]>(lesson.meta.checklist.map(() => false));
  const [done, setDone] = useState(false);
  return <main className="mx-auto max-w-shell px-4 py-8">
    <p className="text-sm text-amber-800">作者本地预览 · 未发布 · 任务只保存在本页内存</p>
    <header className="lesson-header"><h1 className="lesson-title">让插件看懂网页：内容提取与扩展通信</h1><p>{lesson.meta.objective}</p><p>{lesson.meta.estimatedTime} · {lesson.meta.difficulty}</p></header>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0"><LessonMarkdown body={lesson.body}/></article>
      <aside className="min-w-0"><LessonTaskCard items={lesson.meta.checklist} checked={checked} disabled={false} saving={false} done={done}
        onToggle={i => setChecked(old => old.map((value, n) => n === i ? !value : value))} onComplete={() => setDone(true)}/></aside>
    </div>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
