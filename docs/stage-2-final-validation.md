# Stage 2 最终验证（待云端验收）

## 2.1 → 2.8

| 课程 | 已完成的教学主题 | 现有证据范围 |
| --- | --- | --- |
| 2.1 | 读懂现有 Next.js 项目，输入与预览 | 本地页面与课程验证 |
| 2.2 | 浏览器 JSON 请求与第一条真实 API | 受控本地 HTTP |
| 2.3 | Prisma、PostgreSQL、首次持久化与 migration | 本机 PostgreSQL；此前 Neon 未验证 |
| 2.4 | 完整 Resource CRUD | 本机 PostgreSQL 与浏览器 |
| 2.5 | 注册登录、密码哈希与 Session | 本地 A/B、HTTP 与浏览器 |
| 2.6 | 服务端 ownerId 与 Alice/Bob 隔离 | 本地 A/B 双账号 |
| 2.7 | Loading、Empty、Error、Validation 和写入结果未知 | 本地 A/B 与隔离故障注入 |
| 2.8 | GitHub → Vercel → Neon 的生产交付 | 课程与本地构建已准备；云端未完成 |

2.1～2.7 的详细证据见各课验证报告。2.8 的实时证据见 `docs/stage-2-l8-validation.md`。本地测试不能代替生产测试。

## 冻结结论

Stage 2 暂不能冻结：专用 Neon 库、Production migrations、Vercel deployment、公网 HTTPS、生产注册/Session/CRUD/隔离仍需真实验证。2.8 暂未发布；已有课程结构仍为 8 节，Stage 3 保持未发布，总正式课 29 节。等生产全链路通过、平台测试与课程页面检查通过后，更新本结论。

## 尚待真人试学与工具范围

还没有真人学生完整试学 2.8，真实账号授权与云服务界面由项目所有者操作。WorkBuddy 未验证；Network 只在此前本地浏览器课程验证中使用，2.8 公网请求尚未验证。Neon 当前停留在登录前，Vercel 工作区已登录但部署未发生。不得把这些状态写成云端通过。
