# Stage 2 最终验证（2026-09-29～30）

## 2.1 → 2.8

| 课程 | 已完成的教学主题 | 现有证据范围 |
| --- | --- | --- |
| 2.1 | 读懂现有 Next.js 项目，输入与预览 | 本地页面与课程验证 |
| 2.2 | 浏览器 JSON 请求与第一条真实 API | 受控本地 HTTP |
| 2.3 | Prisma、PostgreSQL、首次持久化与 migration | 本地独立 PostgreSQL schema 与迁移验证 |
| 2.4 | 完整 Resource CRUD | 本机 PostgreSQL 与浏览器 |
| 2.5 | 注册登录、密码哈希与 Session | 本地 A/B、HTTP 与浏览器；生产参考项目重新验证 |
| 2.6 | 服务端 ownerId 与 Alice/Bob 隔离 | 本地 A/B 双账号；生产双浏览器会话与双向 ID 越权测试 |
| 2.7 | Loading、Empty、Error、Validation 和写入结果未知 | 本地 A/B 与隔离故障注入；生产空状态、输入校验和权限错误 |
| 2.8 | GitHub → Vercel → Neon 的生产交付 | 专用 Neon、Vercel Production Build Logs、公开 HTTPS 与生产 CRUD 实测 |

2.1～2.7 的详细证据见各课验证报告。2.8 的部署与故障排查记录见 `docs/stage-2-l8-validation.md`。A/B 两套代码均在独立本地项目通过最终构建脚本；公网 Production 部署和双账号实测使用 A。

## 冻结结论

Stage 2 的课程范围为 2.1～2.8，八节均已发布；专用生产数据库、三次迁移、公开 HTTPS、生产注册与 Session、CRUD、服务端所有权隔离均已验证。平台 `npm run verify` 最终 67/67 测试通过，课程页桌面与 390px、Prompt 复制和清单刷新保存均已检查。课程内容与功能可作为 Stage 2 当前基线。Stage 3 保持未发布，四阶段正式课总数为 29。详细失败排查与复测结果见 2.8 验证记录。

## 尚待真人试学与工具范围

尚无真人学生从头到尾试学 2.8；浏览器和 API 验收由开发测试账号完成。WorkBuddy 未验证。部署和数据库操作使用 Neon、Vercel 官方界面，验证记录不含生产密码、Cookie 或连接串。真人试学反馈可在后续迭代中修订讲解和操作细节。
