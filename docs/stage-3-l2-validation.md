# Stage 3.2 验收记录（2026-10-01）

范围：只增加 `s3-l2` 正文与 A/B 内部参考实现，从 3.1 快照继续演进。3.1 问答、登录、同源保护、用户级限流和 Resource CRUD 保留；A 的日期排序、B 的自选标题、清除筛选与统计保留。未修改 Stage 1/2/4 课程文件、Starter、图片或平台 Auth、支付、权益逻辑。3.1、3.2 和其余 Stage 3 课程继续 unpublished。

## 实现与本地测试

`zod@4.6.5` 在 A/B 隔离装配项目中实际安装成功。`z.strictObject` 校验 `summary`（trim 后 1～500 字符）、`tags`（1～5 项，每项 trim 后 1～32 字符）、`confidence`（0～1 的 number），拒绝额外字段。`POST /api/ai/suggest` 的 Mock 和 Real 都经过 `JSON.parse → Zod`；成功响应只包含校验后的 suggestion、kind 与可获得的 usage。Route 不调用 Resource 写入。

A/B 两版均通过 `prisma generate && next build`。首次 B 构建因 Prisma 引擎校验文件网络下载中断而停下；复用 A 已取得的同版本本地引擎后，B 构建通过，参考源码未因此改动。

`reference.test.mjs` 在隔离的 `stage3_l1` 数据库和本地 Provider Stub 上分别对 A/B 通过：3.1 answer 回归、结构化 Mock 确定性、登录 401、跨站 403、空白/超长输入 400、两个 AI Route 共享用户级 429 限流、合法 JSON 通过、非法 JSON、缺字段、tags 错类型、字符串或越界 confidence、额外字段、代码围栏全部被拒绝。Provider 401/5xx、超时与缺配置均映射为安全错误；测试 Key、Provider 原始错误未进入响应；浏览器提交的 model、schema、max_tokens 不覆盖服务端设置。suggest 前后的 Resource 列表深度相等，旧 CRUD 与 Alice/Bob 隔离仍通过。

## 真实 Provider 与课程

新 TypeScript structured 路径使用阿里云百炼 China (Beijing) `qwen3.7-flash` 做短文本验收。首次请求为受控 HTTP 502，未保存原始输出，具体原因未验证；第二次 HTTP 200、`kind: real`、严格 Schema 通过，延迟约 998 ms，摘要长度 44、标签 3 个、置信度在 0～1，usage 为 99 prompt / 49 completion / 148 total tokens。验收脚本只输出这些摘要，不输出完整建议、模型原文或 Key。A/B 共用实现，真实调用只在 A 装配项目执行。

新课通过 Lesson Renderer V2 解析：五条新 checklist/checkKeys、两个 Prompt、九个 H2。使用同一 `LessonMarkdown` 组件本地预览，在桌面与 390px 检查标题、正文、教学块和代码换行；实际点击第一处「复制提示词」，剪贴板与代码块逐字一致。正式未发布课程的权限页未开放，因此该权限页的视觉验收未测。

`npm run verify` 通过，原有 67/67 测试通过；`npm run check` 通过。正式课总数仍为 29，Stage 3 仍为 7 节且全部 unpublished。多实例全局限流、生产部署和学生个人 Workspace 不属于本次参考验收。
