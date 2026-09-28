# 2.1 内部 A/B 参考实现与验证

不是学生下载资源。学生继续自己的 1.6 项目；这里用两个不同的 Stage 1 完成态确认课程任务可迁移。

## 起点与改动

- A：`stage-1/s1-l6/implementation-a/after/app/page.tsx`，checkbox、单次筛选、日期排序。
- B：`stage-1/s1-l6/implementation-b/after/app/page.tsx`，button、分步筛选、独立 `ResourceStats`、清除筛选和个性标题。
- 本目录的 `implementation-a/b/app/page.tsx` 是 2.1 完成页；各自仅新增 `ResourcePreview` 导入与展示。共用组件在 `common/components/ResourcePreview.tsx`，其 `tags` 属性来自原项目已有分类。B 原有统计组件沿用 1.6 原件。

要独立运行，将正式 Stage 1 Starter 的允许源文件复制到两个新目录，分别叠加上述 1.6 完成态，再叠加本目录的页面与预览组件；B 同时带上原来的 `ResourceStats.tsx`。不要把本目录打进学生 Starter ZIP。

组件只使用 React 页面状态；提交表单后复制当前标题、简介、标签到独立预览块。不会修改 `lib/resources.ts`、正式卡片列表或统计，不调用 API、localStorage、数据库，也没有新增依赖。刷新页面，预览状态会消失。

## 2026-09-28 实测

临时项目位于 `C:\Users\QYF\AppData\Local\Temp\aifoundry-s2-l1-clean-20260928195717\a` 和 `b`；没有清理或覆盖原 Stage 1 项目。A/B 均实际执行 `npm install`、`npx tsc --noEmit --incremental false`、`npm run build` 和 `npm run dev`，全部通过。Next.js 15.5.26；安装依赖报告 0 vulnerabilities。浏览器分别打开 3029 / 3030 端口。

| 项目 | 浏览器操作 | 结果 |
| --- | --- | --- |
| A | 填标题、简介，选文章，预览；修改两项后再预览 | 独立区域显示两次对应内容和“尚未保存”；正式列表始终 9 条 |
| A | 搜索 Next.js，开启重要；切换最早优先；刷新 | 搜索后 1/9，重要开关可用；排序能从旧资料按日期重排；刷新后预览消失，回到 9/9 |
| B | 填标题、简介并预览；改标题与简介再次预览，并把标签从教程换为课程 | 两次预览均显示提交时的新内容和标签 |
| B | 搜索 Next.js、选择教程、开启重要，再清除筛选 | 组合筛选 1/9，清除后空搜索、重要关闭、9/9 |
| B | 刷新 | 预览消失，旧 9 条仍在，个人标题未被覆盖 |

两份临时项目中的资料、依赖、卡片均来自原 Starter，正式代码差异只在各自页面增加引用和单个新预览组件。默认 WorkBuddy 工具的执行尚未实测；上面是当前工具对真实项目的运行与浏览器验收，不代称学生或 WorkBuddy 完成。
