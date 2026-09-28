# 2.2 发布与本地验收记录（2026-09-28）

## 基线与范围

开始时本地 `main` 的 HEAD 为 `875b753df7395efedeace7f7ac57c6a58d7b4738`，与 `origin/main` 一致，工作区已有 Stage 1 试学优化和 2.1 的未提交内容。本轮保留这些内容，没有切换旧提交、恢复文件、提交或推送。2.2 增量文件为课程正文、内部 A/B 参考、相关课程发布标记、权限与渲染测试及本记录。2.3～2.8 保持未发布。

## 教学与参考实现

正文位于 `course-content/stage-2/s2-l2.md`，使用 5 个全新 checkKeys，包含任务、概念、检查、警示、卡住排查、深入理解、可复制 Prompt 和作者配图注释。教学顺序是检查真实项目、建立 Route Handler、先测试 API、再连接 2.1 表单、检查实际响应与失败、回顾数据路径和保存点。强调 `saved:false` 与本地实验边界。

内部 A/B 的 API、前端、测试过程和限制详见 [参考实现记录](../course-content/internal/stage-2/s2-l2/README.md)。两种 1.6 完成态上的页面文件没有被重写。真实 POST 的合法与 400 用例、两次发送、断网、刷新及旧功能均已实测。A/B 均通过依赖安装、TypeScript、构建与开发服务器浏览器交互。

## 发布、权限和页面

将 2.2 设为已发布并执行现有 `npm run db:seed`。`check:content` 检查 9 份已发布正文。课程总数仍为 29，Stage 2 仍为 8 节。权限测试覆盖匿名 401、仅 Stage 1 权益 403、Stage 2 权益可读取 2.2、2.3 未发布 404。正文响应仍为 `no-store`，Stage 1 已完成态测试仍通过，进度算法未改。

本地平台使用 `aifoundry_test` schema 的 Stage 2 测试账号打开 2.2 课程页，确认 H2/H3、所有课程块、5 条学习清单、上一课链接与下一课未发布状态均渲染；Prompt 按钮点击后显示“已复制”。桌面和 390px 宽度查看，移动宽度显示折叠菜单，正文可读。没有对课程正文截图作虚构处理。

## 命令与限制

- `npm run db:seed`、`npm run typecheck`、`npm test`（65/65）、`npm run build`、`npm run check:content`、`npm run check:bundle`、`npm run check:starter` 均通过。
- `npm run verify` 最终通过：内含 typecheck、build、65/65 测试、9 份正文的 content 检查，以及 101 个 dist/public 文件的 bundle 检查。
- 浏览器开发工具 Network 面板未直接检查；浏览器实际点击、服务端 POST 日志和独立 HTTP 请求共同验证真实链路。默认 WorkBuddy 工具尚未实测。
