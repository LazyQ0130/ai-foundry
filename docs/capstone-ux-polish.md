# Capstone UX Polish

## Scope and implementation

Reviewed `LessonPage.tsx`, including its Stage directory, top lesson navigation,
740px article, task workbench, progress components and mobile directory drawer.
`LessonLayout.tsx` now provides the shared responsive shell for Stage and Capstone.
Its desktop directory is 260px wide; article width remains capped at 740px.
The mobile drawer keeps the existing interaction and adds focus containment,
Escape dismissal, focus return and body scroll restoration.

Capstone keeps `useCapstone`, its existing server-returned progress and checklist
mutations. No Stage progress adapter is used. Sidebar completion marks use
`completedLessons`; displayed counts use `completed` and `total`. Overview resumes
the exact `continueLessonId`, including out-of-order study. No prerequisites added.
Headers use trusted catalogue title/time and frontmatter objective. Markdown and
teaching blocks continue through the existing lazy-loaded `LessonMarkdown`.

Primary entry cards appear after the four Stage cards on the learning path,
course catalogue and Dashboard. They display nine lessons, 18–23 hours, and
start/continue/review CTAs according to independent Project Lab progress.
Unentitled visitors receive a pricing CTA. Existing home and projects links were
left in place; no additional main navigation item or repeated banners were added.
Overview moves progress, current lesson title and start/continue action ahead of
the long project introduction.

## Content integrity

Removed exactly 70 learning-time prefixes from H2/H3 headings in formal C1–C9,
plus the same 70 in corresponding internal drafts (140 edits total).
Compared each formal body against the previous Git version with only that
anchored heading-prefix transformation applied: all nine matched exactly.
Frontmatter, estimatedTime, prompts, experiments, technical prose and lesson order
are preserved. All nine formal/internal file pairs remain byte-identical.

No changes to catalogue publication flags, the 61 checkKeys, server guards,
ProductEntitlement, progress models, pricing, payment, Starter permissions,
database schema or migration files.

## Verification

- `npm run typecheck`: PASS.
- `npm test`: PASS, 93/93, including the existing entitlement matrix for
  anonymous/no entitlement/Stage-only/Project Lab/revoked/disabled and protected
  lesson, progress and Starter endpoints; independent 0/9 → 9/9 and Stage 29
  regression; new UI, navigation, header, CTA and content tests.
- `npm run check`: PASS, including existing publishing parity checks.
- `npm run build`: PASS. Vite retains its non-failing large-chunk warning.
- `npm run check:bundle`: PASS; protected Markdown remains outside public assets.
- Browser checks at 1440×1000 and 390×844: directory, current C4 highlight,
  completed marks, 3/9 progress, article and tasks; mobile drawer navigation
  directly to C9 closes the drawer; overview start/continue action visible on
  the first mobile screen; Dashboard and catalogue progress/CTA verified.

Initial database-dependent checks failed because Docker/PostgreSQL was stopped.
Docker startup and one restart failed on its internal Inference socket. Tests
were then run successfully against a fresh, isolated PostgreSQL 17 cluster under
ignored `.runtime/ux-polish-db`, using the existing migrations and separate test
schema. No existing database was reset; no project dependencies or lockfile
changed. Root dependencies were already installed; root setup documents require
`npm install`, not a fresh `npm ci` for this change. No release audit was reopened.

## Changed files

- `src/components/LessonLayout.tsx`
- `src/components/CapstoneLearning.tsx`
- `src/components/CapstoneOverviewStart.tsx`
- `src/components/CapstoneShowcase.tsx`
- `src/components/ui.tsx` (explicit `.js` type import for NodeNext test checking)
- `src/pages/LessonPage.tsx`
- `src/pages/CapstoneLessonPage.tsx`
- `src/pages/CapstoneOverview.tsx`
- `src/pages/CourseCatalog.tsx`
- `src/pages/Dashboard.tsx`
- `tests/capstone-ux.test.ts`
- `tests/capstone-showcase.test.ts`
- `course-content/capstone/c1.md` through `c9.md`
- `course-content/internal/capstone/c1/lesson-draft.md` through `c9/lesson-draft.md`
- This report.
