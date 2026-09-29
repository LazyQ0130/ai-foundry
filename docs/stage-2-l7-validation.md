# Stage 2.7 发布与验证记录（2026-09-29）

## 范围与课程

本轮新增 `course-content/stage-2/s2-l7.md`：14 个 H2、3 个 H3、4 段分步 Prompt、5 个全新清单键、2 个 Check、1 个 Concept、14 个具体 Stuck；预计 80～110 分钟。A/B 参考源码在 `course-content/internal/stage-2/s2-l7/`。平台只将 s2-l7 标记发布，s2-l8 仍未发布；Stage 2 保持 8 节，四阶段正式课保持 29 节。执行了 `npm run db:seed`。

## 实现

沿用 2.6 的 `accountEpoch` 与 `AbortController`，GET 状态为 idle/loading/ready/empty/error：只有成功的空数组进入 Empty；重读时保留旧列表但标明“上一次结果”；失败时不把旧列表当新结果。GET 401 清空私有资料、表单草稿与旧反馈并提示重新登录。POST/PATCH/DELETE 的等待状态立即显示，同一次操作用 ref 阻止重复请求；前端检查空格标题、简介与分类，服务端继续验证所有字段，400 展示实际消息。写入响应无法判断时显示“结果未确认”，先重新读取核对，再允许同类写入，不自动重发。明确 POST 201 后若 GET 失败，保存成功与列表读取错误同时保留。

服务端代码、User/Session/Resource 模型与迁移未变。`ownerId` 仍在 GET 的 Prisma 查询条件及 PATCH/DELETE 原子写条件中；A/B 的原有自选功能与静态九条资料未覆盖。

## A/B 参考项目与真实接口

沿用本机 PostgreSQL `localhost:55432` 的独立 schema `s2l3_a_20260928` 与 `s2l3_b_20260928`，仅在本轮新建专用练习账号和资料。两边分别运行 `npm install`、`prisma generate`、`prisma migrate status`（3 个迁移已同步）、`tsc --noEmit`、`next build`、`next dev`、`next start`。最终源码覆盖到两份临时运行副本后再次通过 TypeScript 和生产构建。连接值留在临时项目 `.env`，不进入仓库。

两边均再次执行 2.6 的真实 HTTP/Prisma 回归脚本：未登录四方法 401；Alice/Bob GET 只含自己资料；猜测他人 ID 的 PATCH/DELETE 为 404；旧无归属 ID 不可修改或删除；客户端伪造 ownerId 被 400 拒绝；本人 CRUD 与异常 Origin 拒绝均通过。直接查询历史 ID `[1,2,4]` 仍在，两边 `ownerId=null`，未重置或清空数据库。本轮另在两边以独立账号直发空格标题、非法 tag、字符串 important，POST/PATCH 分别返回 400；错误响应未含连接串、密码哈希、Token 或栈。

## 受控故障与浏览器证据

测试注入仅放在 A 的临时运行副本，最终重新复制交付版路由并构建；B 另以进程环境变量提供**失效的数据库连接**启动独立服务，未修改真实 `.env`。

| 场景 | 实际证据 |
| --- | --- |
| A 慢 GET | 测试路由延迟约 2.2 秒，浏览器先显示“正在从数据库读取”；有旧列表时显示“上一次结果”，完成后显示真实记录。 |
| B 空列表 | A 新 Bob 的个人 GET 成功且列表为空，浏览器显示“你还没有保存资料”，静态九条仍单独显示。A/B HTTP 新账号 GET 均返回 `[]`。 |
| C 数据库故障 | B 使用失效 DATABASE_URL 的独立服务：带测试 Cookie 的 GET/POST/PATCH/DELETE 均为 503，响应无连接串或异常栈；正常连接服务 GET 为 200。A 浏览器通过临时 GET 503 注入看到错误与重读入口，旧列表标为未确认。 |
| D 输入校验 | A 浏览器空格标题显示具体错误，简介仍在；A/B 直发空格标题、非法 tag、错误 important 类型均为 400，记录没有被错误写入或修改。 |
| E 延迟保存 | A 测试路由在数据库创建后延迟约 2.2 秒，按钮与表单进入禁用等待；按唯一标题直查数据库仅 1 条。 |
| F POST 成功而 GET 失败 | A 测试路由只让 GET 返回 503：浏览器同时显示保存成功、真实记录 ID 与列表读取失败；没有自动二次 POST。 |
| G 登录过期 | 仅使 A 专用测试账号 Session 过期；下一次 GET 401 后页面立即清空个人列表、草稿、保存提示并显示重新登录。 |
| H Alice → Bob | A 的 Alice 旧 GET 延迟时退出，再注册 Bob。Bob 只显示自己的 Empty，无 Alice 资料、草稿或旧成功提示；旧请求不能覆盖新账号。 |
| I 原功能 | A 静态九条和日期排序保留；B“工具”筛选 2/9、清除后 9/9，自选标题保留；两边 2.6 所有权 HTTP 回归通过。 |

另在 A 的临时路由中让 POST **先写入，再等待 10 秒**，等待期间停止服务以模拟响应丢失。数据库按唯一标题直查为 1 条，浏览器显示“尚未确认本次操作结果，请先重新读取”，没有自动重发。最后一次组件调整把该提示明确改成“保存结果未确认”，并暂禁同类写入直到成功重读；最终代码重新通过 TypeScript 与构建。测试延迟、503、响应丢失开关均未进入交付源码。

## 课程网站与自动检查

平台执行 `npm run db:seed`、`npm run verify` 和 `npm run check:starter`。`verify` 包含 typecheck、build、65/65 测试、`check:content`（4 阶段、14 篇已发布正文）与 `check:bundle`（116 个 dist/public 文件、14 篇保护正文未泄露）；Starter ZIP 检查通过。发布/权益测试证明无 Stage 2 权益返回 403，Stage 2 TEST 权益返回 200 且五个清单键可保存，2.8 仍返回 404。

浏览器使用本地临时 TEST 权益账号打开 2.7：H2/H3、4 个 Prompt、Concept/Check 与 14 个 Stuck 正常渲染；复制按钮显示“已复制”，但浏览器剪贴板读取为空，因此不声称实际读到了复制文本（Renderer V2 自动测试验证只复制代码块）。勾选首项后刷新仍为 1/5。Desktop 与 390px 视口检查，移动端 `innerWidth=390`、`clientWidth=scrollWidth=375`，完整渲染后没有横向溢出。测试账号及其 Session、权益、进度和清单已清理。

## 工具边界与未修改范围

本轮没有可调用的 WorkBuddy、Network 或 Neon 云端工具；真实验证使用本地 PostgreSQL、HTTP 和浏览器，不将其称为云端验证。未提前开发或部署 2.8，未公开部署匿名实验，未修改 Stage 1 Starter、`ownerId` 所有权模型、AIFoundry 平台 Auth、价格、支付或进度算法，未新增依赖或大型状态库。
