# Stage 2 V1.1｜新手学习阻塞修复记录（2026-09-30）

本轮只修改 2.1、2.3、2.7、2.8 正文、Stage 2 蓝图和项目页验收文案。开工前核对了 Stage 1 第 0 课、1.5、Stage 2 四篇目标正文及 `docs/stage-2-final-validation.md`。未改 Starter ZIP、课程架构、API、Prisma 模型或迁移。

| 阻塞 | 修复位置 | 学员可执行的结果 |
| --- | --- | --- |
| GitHub 断层 | `course-content/stage-2/s2-l7.md`「下一节」；`s2-l8.md`「第一次把本地项目推送到 GitHub」与常见错误 | 课前准备账号；2.8 从注册、空仓库、本地 commit、remote、首次 push 到网页 SHA 核对逐步操作；1.5 保持本地 Git 边界。 |
| 大陆地区访问 | `s2-l8.md`「部署前先看所在地的访问条件」「完成 Stage 2 项目验收」和交付证据；`src/data/site.ts` Stage 2 项目标准 | 分开记录技术部署和所在地访问；校园网、家庭宽带、手机流量逐项实测或写未测；自定义域名仅可选，不保证有效，也不要求付费才完成基础技术交付。 |
| Neon 新手路径 | `s2-l3.md`「第一次在 Neon 建立练习库」 | 注册、Create project、Connection Details、根目录 `.env`、SQL Editor 均有明确路径；增加 `SELECT COUNT(*) FROM "Resource";` 只读核对、脱敏截图占位及遮罩密码警示。 |
| Prisma 版本漂移 | `s2-l3.md`「本课程固定 Prisma 6.19.3」Warning | `prisma` 与 `@prisma/client` 都固定 6.19.3；不得安装 latest 或擅自升级主版本。Prisma 官方公告指出 v6 仅收安全补丁至 2026-11-19；课程维护者须在此前规划单独升级和回归，本轮没有实施升级。 |
| Stage 2 单独购买起点 | `s2-l1.md` 开头；`docs/stage-2-course-blueprint.md` 前言 | 没项目的学员可从免费第 0 课领取 Starter，但需补齐功能和能力自检才进入 2.1；Starter 不等于 Stage 1 最终作品。 |

## 一致性与来源

- 四篇正文原有 `checkKeys` 均保持不变，各 5 项；未改进度存储逻辑。Stage 2 项目页和蓝图现与 2.1 入课条件、2.8 技术交付与所在地可访问性分开记录的口径一致。
- 链接已打开核对：[GitHub 注册](https://github.com/signup)、[GitHub 现有项目推送说明](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)、[Neon 控制台](https://console.neon.tech/)、[Prisma 版本状态](https://www.prisma.io/docs/orm/release-status)、[Vercel 大陆访问知识库](https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china)、[Vercel 自定义域名](https://vercel.com/docs/domains/working-with-domains/add-a-domain)。Neon 控制台未登录时会跳转登录页；按钮位置会随官方界面调整。
- 2.3 原有的 Prisma 系统要求链接会跳到当前大版本，已改为明确的 [Prisma v6 系统要求](https://www.prisma.io/docs/orm/v6/reference/system-requirements)。
- `s2-l3.md` 保留图片占位说明，没有把虚构图当作真实截图，也没有把生产连接信息写入文档。后续若补图须使用真实脱敏截图。

## 验证

- 首次 `npm run verify` 的 67/67 测试通过，但本机平台数据库缺少 2.8 的已发布目录记录，`check:content` 提示先运行 `db:seed`。运行现有 `npm run db:seed` 后重跑 `npm run verify`：67/67、四阶段 15 篇正文、稳定清单键和 128 个构建文件保护检查均通过。
- `npm run check:starter` 通过，Starter ZIP 与源文件一致；Git 状态未显示 Starter 文件改动。
- 移动端排版检查：课程正文沿用已有 `min-w-0` 容器、正文 `overflow-wrap:anywhere`、代码块水平滚动、Prompt 自动换行和小于 640px 的排版规则；本轮没有新增固定宽度元素。现有渲染测试覆盖四篇已发布正文、教学块和 Prompt 内容。浏览器工具的安全策略拒绝打开本地 `file:` 预览，并禁止改用间接路径绕过；**本轮未取得授权课程页的 390px 实际浏览器截图，视觉宽度仍待界面复验。**
- Prompt 复制检查：新增内容都在 Prompt 块外，原有 Prompt 文本未改；`LessonMarkdown` 仍只将代码块正文传给复制按钮，现有渲染测试通过。**未在本轮手动读取浏览器剪贴板。**

本轮仅修复课程引导，不代表真人新学员已完成全程试学，也不代表 Vercel 在中国大陆三种网络实际可达。
