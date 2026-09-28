# 2.1 发布与本地验收记录（2026-09-28）

## 基线与范围

本地 `main` 的 HEAD 与 `origin/main` 均为 `875b753df7395efedeace7f7ac57c6a58d7b4738`。开始前已有 Stage 1 试学反馈优化的未提交文件及文档，本轮全部保留，没有恢复或覆盖。本轮编辑 `src/data/site.ts` 时仅加上 Stage 2 项目页的定向口径修正；`src/data/courses.ts` 原有 Stage 1 描述改动保持原样。新文件位于 Stage 2 正文、蓝图、内部参考与本记录；测试只调整与 2.1 发布直接相关的断言。

## 参考项目

A/B 从两个 1.6 完成态继续，资料文件、卡片、依赖和旧功能均未修改。各自新增预览组件及页面引用，没有 API、Prisma、数据库、Auth 或 localStorage。完整实测见 [内部 A/B 记录](../course-content/internal/stage-2/s2-l1/README.md)。

两份临时项目分别执行 `npm install`、`npx tsc --noEmit --incremental false`、`npm run build`、`npm run dev`，均通过。浏览器实际检查两次预览更新、标签、刷新消失及旧搜索/筛选/自选功能；A 日期排序与 B 清除筛选仍可用。原始资料为 9 条，预览不进入正式列表。

## 网站与权限

2.1 `isPublished: true` 后执行既有 `npm run db:seed`，`check:content` 报告 8 份已发布正文。2.2～2.8 仍为 `isPublished: false`。课程总数仍为 29，Stage 2 为 8。

使用 `aifoundry_test` schema 的自动接口测试核对：匿名读 2.1 为 401；只有 Stage 1 权益为 403；只有 Stage 2 权益可读 2.1，且仍不能读 Stage 1 付费正文；2.2 为 404。正文响应 `no-store`，5 个新 checkKeys 与 checklist 对应。最终 `check:bundle` 检查 98 个前端构建文件，未发现付费正文标记。

课程页面另在本地站点 `localhost:5173` 使用临时 Stage 2 授权账号手工检查：H2/H3、Concept、Task、Check、Stuck、DeepDive、学习清单可见；第二段 Prompt 的复制按钮变为“已复制”。桌面与 390px 手机宽度已检查，未见横向溢出或文字被遮挡。该临时账号验收后已停用并撤销权益。

## 命令结果与限制

- `npm run db:seed`、`npm run typecheck`、`npm run build`、`npm run check:content`、`npm run check:bundle`、`npm run check:starter` 均通过。
- 首次 `npm test` 发现旧免费体验断言还期待未发布的 2.1 返回 404；发布后正确值为 403，已修正，并增加 2.2 仍返回 404 的断言。重跑 `npm test` 为 65/65 通过。
- 默认 WorkBuddy 工具尚未实测；内部参考验收使用当前 Codex 工具和真实浏览器，不能代称 WorkBuddy 试学结果。
