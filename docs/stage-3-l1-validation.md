# Stage 3.1 验收记录（2026-10-01）

范围：只开发 `s3-l1` 正文与 A/B 内部参考实现；`s3-l1.isPublished` 保持 `false`。以 Stage 2.8 的共享代码、A/B 页面与三次迁移为起点。A 保留日期排序，B 保留自选标题、清除筛选与统计；没有修改 Stage 1/2/4 课程文件或平台 Auth、支付、权益逻辑。

## 参考项目

在忽略的 `.runtime` 目录分别装配 Starter + `s3-l1/common` + A 或 B，实现均通过 `prisma generate && next build`。B 装配时包含其 Stage 1 延续的 `ResourceStats` 组件。

`reference.test.mjs` 对两份生产构建分别在隔离的 `stage3_l1` 数据库运行：原有注册、Resource CRUD 和 Alice/Bob 隔离通过；Mock 同输入确定性、空输入与 2001 字符拒绝、未登录 401、跨站 403、用户级第六次请求 429 均通过。使用本机 Provider stub 验证：缺配置安全返回 503，401/500 上游错误映射为安全短句，真实测试 Key 与 Provider 原文不进响应；请求采用服务端 model、`max_tokens:256`、该模型 `enable_thinking:false`；超时设置 999/30001 ms 被拒绝，1000 ms 延迟请求返回受控 504。默认平台测试不访问云端。

正式 TypeScript Adapter 是新的实现，因此另用本地未跟踪环境变量做了一次真实短请求。阿里云百炼 China (Beijing) `qwen3.7-flash`：HTTP 200、`kind: real`、回答非空、约 705 ms、usage 19 prompt / 21 completion / 40 total tokens。验收脚本只输出必要摘要，不保存回答或 Key。此记录只证明 3.1 的 `generate()`；streaming、embedding 等沿用 Phase 0.5 的历史记录，本课未实现其产品功能。

## 课程与平台

新课通过 Lesson Renderer V2 解析：五条 checklist 对应五个新 checkKeys、两个 Prompt、十个 H2。实际用 `LessonMarkdown` 渲染，并在本地预览中点击第一处「复制提示词」；系统剪贴板内容与该 Prompt 代码块逐字一致。桌面和 390px 宽度检查了段落、标题、教学块及代码换行。该预览使用相同课程渲染组件，但不是未发布课程的正式平台权限页面；正式平台内部课程页视觉验收未测。

`npm run verify` 通过，原有 67/67 测试通过；`npm run check` 通过。Starter ZIP 与源文件一致。课程总数仍为 29，Stage 3 仍为 7 节，所有 Stage 3 课程仍未发布。上线的真实多实例限流、生产部署与学生个人 Workspace 实测不属于本课参考验收。
