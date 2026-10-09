# 课程阶段卡片改版 · 2026-10-09

课程页四张卡片采用桌面三列（32:36:32）、平板说明独占首行、手机单列。项目介绍保留全文，课程展开和学习进度逻辑保留。首页继续使用原有 PNG 截图。未删除文件。

## 图片资源

使用内置 imagegen 生成，各图原始尺寸 1448×1086；用 sharp 等比例缩小为 960×720，WebP quality 85，没有裁切或修改图像内容。

| 阶段 | 资源 | 主题色 | 大小 |
| --- | --- | --- | --- |
| 1 | public/course-media/showcase/stage-1-concept.webp | emerald | 17,494 bytes |
| 2 | public/course-media/showcase/stage-2-concept.webp | blue | 20,394 bytes |
| 3 | public/course-media/showcase/stage-3-concept.webp | violet | 17,640 bytes |
| 4 | public/course-media/showcase/stage-4-concept.webp | orange | 21,770 bytes |

## 生图提示词

每次调用采用以下公共提示词，再追加对应阶段提示词。四次调用均为非透明背景；阶段 2–4 各以紧邻的上一张生成图作为风格参考（num_last_images_to_include: 1），阶段 1 无参考图。

公共提示词：

```text
Use case: ui-mockup. Asset type: 4:3 landscape concept image for a small course project card. Create a polished product concept illustration, light off-white tinted background, one large nearly frontal floating white browser panel with subtle depth, softly rounded edges and refined ambient shadow. Main interface occupies 80% of canvas, safe margin around every object. Crisp minimalist interface, only a few large visual elements, no dense small text, no logos, no watermark, no captions. Restrained professional visual, not a real screenshot, no laptop or phone frame.
```

阶段 1：

```text
Theme: personal knowledge workspace. Emerald green accent. Inside main panel: search bar, category filter pills, six tidy resource cards with bookmark/document icons and short abstract text lines. Two small floating cards: magnifying glass and bookmarked document. All elements legible as forms at thumbnail size. Pale mint background.
```

阶段 2：

```text
Match the visual language of the provided mint knowledge workspace reference: softly dimensional white browser interface with bold simple icons, abstract text bars, consistent scale and rounded corners. New theme: full-stack knowledge workspace. Blue accent on pale blue background. Main panel shows tidy document cards, a compact profile/avatar and a clearly connected database icon panel. Two small floating tiles: account avatar and database cylinder connected by a subtle blue line. Emphasize personal data, account and connected storage, no invented text.
```

阶段 3：

```text
Use provided blue workspace image only as style reference: same soft white browser panel, abstract text bars, icon scale and ambient shadows. New theme: AI knowledge workspace with RAG question answering and cited documents. Violet accent, pale lavender background. Main panel contains a large chat answer card, a short question bubble, three compact source document cards and small numbered citation chips linking answer to documents; sidebar of document icons. Two floating small tiles: violet sparkle icon and document with quotation marks. No readable words, no dense UI, no robot character. 4:3 landscape.
```

阶段 4：

```text
Use provided violet workspace only as style reference: same soft white browser panel, abstract text bars, bold simple icons, rounded shapes and ambient shadows. New theme: AI research Agent. Orange accent on pale warm ivory background. Main panel shows a research task progress timeline with four connected nodes, search and document tool icons, completed checkmarks, one paused task with a prominent human approval card containing a check button. Lower section has a short research result card with source icons. Two small floating tiles: connected workflow nodes and shield with checkmark. Emphasize controlled multi-step progress and human approval. No readable words, no dense UI, no humanoid robot. 4:3 landscape.
```

## 验收

- npm run typecheck：通过。
- node --import tsx --test tests/projects-center.test.ts tests/product-consistency.test.ts tests/course-revision.test.ts：11/11 通过。
- npx vite build：通过；保留既有主包超过 500kB 提示。
- Playwright 检查 1440、1024、768、390px：四张卡片及页面均无横向溢出，四张图片加载成功，object-contain 完整展示。桌面三列、平板两列配图与介绍、手机单列顺序均正确。
- 实际点击第一阶段项目和阶段入口，路由分别为 /project/assistant 和 /stage/stage-1。课程展开显示 7 项（含第 0 课），再次点击收起。键盘 Enter 展开、Space 收起，按钮和项目入口具有可见焦点样式。
- 游客浏览器验证，原有登录进度逻辑未改动。
- 页面和卡片截图位于 .shots/course-cards/（已被现有 .gitignore 忽略）。
