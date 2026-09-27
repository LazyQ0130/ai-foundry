# Stage 1 收尾验收（2026-09-28）

基线：GitHub main `be20d38baca0a7fc2060b97bfc1085c706f19460`。本轮先完成 Starter 交付卫生，再发布 1.6，不编写 Stage 2。原有未跟踪 `docs/WALKTHROUGH_2026-09-27.md` 保留，不纳入提交。

## Phase A：真实问题与修复

源码 `.gitignore` 存在，但旧 `isStarterFile` 无差别拒绝隐藏路径，旧 ZIP 确实不含它。README 确实含作者章节，其中把统计数字问题作为 1.3 设计的说法已过期。

- 只在 `relative === '.gitignore'` 时放行；其他隐藏路径继续拒绝，嵌套 `.gitignore` 不允许。
- 必需文件增加 `.gitignore`，缺失直接失败，不静默生成；源文件仍是唯一来源。
- 原 ignore 内容未改：node_modules、.next、out、.DS_Store、pem、npm 日志和 .env* 均覆盖。
- 学生 README 去掉整个“给课程作者的话”，保留启动与目录说明。有效作者事实改为内部目录链接，见 `course-content/internal/stage-1/README.md`，不复制过期设计。
- 1.5 只改 ignore 相关内容：正常检查已有文件；检查后再看 status，然后 add；新增缺失/不完整兜底。原 add 后依赖或环境文件出现的 Stuck 保留。
- 直接白名单、缺必需文件、实际植入隐藏/测试/内部文件的临时项目测试通过。Phase A 完成时 check:starter、bundle 均通过，然后才编写 1.6。

最终 ZIP **24,333 字节**，SHA256：

`7DE9C2D1B2A72FE352A2E0D3EE99C76C8541796470AC93E0F4A718AE1B3E93CE`

旧交付 `D4E95406F8E3040C0C8A3E039EAE51C14882EDCBDCA645C02F2C8DC2185484FF` 已失效。本轮中间 ZIP 也不作为最终交付。正常构建器保留原有确定性 mtime 配置，未改时间戳、未手工 patch ZIP。

## Phase B：正文与发布

新增 `course-content/stage-1/s1-l6.md`，5 个全新 checkKeys，4 处作者配图注释，正文使用 H2/H3、段落、列表、行内代码。只有 Check、Stuck、一个 DeepDive；没有完整功能 Prompt、Debug Prompt、代码答案或统一最终页面。

学生只选排序 / 清除筛选 / 同规模自定义中的一个。先检查原功能、保存稳定点；自己写四句话及至少三个验收场景，含组合操作；让 AI 复述后再改；亲自验收，必要时描述问题、定位并最小修复；看修改范围，再亲手保存完成版本。不系统新增 React、Git 或 Debug 方法，不引入依赖、后端、API、数据库或持久化。

1.6 isPublished=true，执行既有 db:seed。第 0 课与 1.1 仍为唯一 Preview，1.2～1.6 保持付费边界。Stage 2～4 发布状态、正文和价格不变。

## A/B 参考验证

详见 [内部参考](../course-content/internal/stage-1/s1-l6/README.md) 和同目录 Git/hash evidence。

A 从 1.5 恢复后的 checkbox / 单次筛选页开始，做日期排序；B 从 1.5 恢复后的 button / 分段筛选 / 独立统计组件开始，做清除筛选，保留个性标题。每份只改 `app/page.tsx`，数据与依赖无变化。两者实际 install/dev/TypeScript/build 通过。

浏览器确认旧行为 `9/9、3/9、2/9、0/9、重要教程 2/9、Next.js 1/9、Excalidraw + 重要 0/9`，新功能组合和刷新均正常。A 测最早、最新、切回默认，不丢失重复；B 测组合清除、零结果清除、重复点击及清除后继续筛选。

实际 Git 历程：起点 clean + commit → 修改时只有 page → 浏览器验收及构建 → 完成 commit → clean，log 可见前后两个版本。A `e49bdd0 → 588c233`，B `de52e80 → e9c4b7a`。仅在临时目录模拟学生操作，不替用户项目恢复或删除内容。

## 网站完整手工 E2E

使用隔离 `aifoundry_test` schema 的专用 Stage 1 授权账号（尾号 7146），通过浏览器登录。从第 0 课一路点击 Next 到 1.6；每课实际点击所有 checklist、标记完成、刷新，再确认任务和状态保存。没有通过 API 代替这次手工点击。

| 课 | 保存项 | 刷新后的正式进度 | Prev / Next |
| --- | --- | --- | --- |
| 0 | 4/4 | 0/6 | 无上一课 / 1.1 |
| 1.1 | 5/5 | 1/6 | 0 / 1.2 |
| 1.2 | 5/5 | 2/6 | 1.1 / 1.3 |
| 1.3 | 5/5 | 3/6 | 1.2 / 1.4 |
| 1.4 | 5/5 | 4/6 | 1.3 / 1.5 |
| 1.5 | 5/5 | 5/6 | 1.4 / 1.6 |
| 1.6 | 5/5 | 6/6，100% | 1.5 / 无下一课链接，提供阶段自检 |

末课正文与完成 CTA 到 `/stage/stage-1#cp-1`，显示原有四项自检及 6/6。阶段变为 completed，不出现 1.7 或 404。原有 Stage 1 完成后的“继续学习”回准备课入口改为自检，阶段页不再显示错误的“下一节”。只补 Stage 1 的条件分支、已有自检条目展示和锚点；未改进度算法、数据库结构或通用 Renderer。

自检第一项轻微扩为“从自己的需求开始……亲自验证并保存完成版本”，其余 Bug / 修改文件 / 保存恢复条目保留。不新增考试系统。

## 页面验收

- Desktop 1440×1000：正文与三栏布局正常；390×844 Mobile：标题换行、任务清单和末课 CTA 正常。
- 实测文档宽度分别 1425 / 375，不超过 viewport 1440 / 390；无整页横向溢出。
- 1.6 H2/H3、Check / Stuck 可见，DeepDive 可展开；配图注释不显示；无完整 Prompt，因此不增加复制按钮。
- 1.5 现有 Prompt 复制实测成功，剪贴板与完整文本一致；Concept 仍正常。所有七篇正文的特殊块和解析另有自动测试。
- 本地真实截图：`preview/stage1-final-lesson-mobile.png`、`preview/stage1-final-checkpoint.png`，验收截图不放入课程、不伪装为学生页面、不打包分发。

## 最终 ZIP 实测

最终 ZIP 解压到新的 `C:\Users\QYF\AppData\Local\Temp\aifoundry-s1-final-6sEPlK\final-zip`。根目录含 .gitignore、README、package/lock、app/components/lib 与原配置。README 无作者说明；无 .git、.env*、node_modules、.next、course-content、docs、内部 reference 或测试文件。

解压后重新 npm install（0 vulnerabilities）、TypeScript、npm run build；随后 npm run dev 在 3029 端口实测：默认 9 张、Excalidraw 搜索 1 张、工具 2 张、无匹配 0 张、刷新回到 9 张。交付源码的搜索、标签、卡片和“共 9 条资料”行为不变；重要筛选与新功能仅在内部参考项目，不进入 Starter。

## 自动验证与工具边界

最终 `npm run verify` 覆盖 typecheck、build、npm test、check:content、check:bundle；另跑 check:starter 和 test:production。62 项测试全部通过，7 篇正文 parse 成功、checkKeys 全局唯一、数据库一致、85 个 dist/public 文件未泄漏正文。build 保留既有主包大于 500 kB 提示，不为本轮重构 bundle。

新增 API 全阶段用例确认 0～6 正式计数和最终 completed；新增 reference 行为测试及完成入口测试。第一次检查暴露测试清单未加入新 key、另一个新测试误以为 API 要拒绝未勾选完成：补充 fixture 并删除错误前提，保留现有 Progress 行为，没有修改后端来迎合测试。

生产 smoke 的旧 s1-l2 未发布 404 断言已过期，本轮更新为已发布未登录 401，同时检查 1.6 与内部参考不可从静态路径读取。认证代码未改。

当前 Codex 已实做；只读复述阶段哈希未变，随后完成 A/B 实现与范围检查。**尚未完成默认 WorkBuddy 工具实测。** 当前可用工具不能控制它；没有声称跨工具验证。

未写 Stage 2、未改 Stage 2～4 内容、价格、Auth、支付、Renderer、Progress 算法或 Dashboard。没有批量删除文件或目录。仅 Stage 1 末课收尾入口做必要的小修改。
