# Stage 2 验收工具

解压后只把 `scripts` 中的工具文件复制到你正在学习的知识工作台的 `scripts` 文件夹（没有就新建）。不要把整个项目替换掉。若已有同名文件，先让 AI 比较差异，不覆盖自己的改动。

在能看到 `package.json` 的项目根目录运行。保持另一个终端的 `npm run dev` 开着。需已完成对应课的接口、`npm install` 和 `npx prisma generate`，依赖沿用项目已有的 Next.js、dotenv、Prisma，不安装新版本。

默认检查 `http://127.0.0.1:3000`。若端口不同，在本机 `.env.course-checks` 写 `CHECK_BASE_URL=http://127.0.0.1:实际端口`。只有分类不同才追加 `CHECK_TAG=你的实际分类`。该文件必须被 `.gitignore` 的 `.env*` 规则忽略；先运行 `git check-ignore .env.course-checks`，应输出文件名。

2.3 的匿名新增与坏输入：`node scripts/course-checks.mjs --case resource-create`。只创建一条新非敏感资料并打印 ID，核对 GET 和四类坏输入；不自动删除或重试，失败后先按 ID 核对。

2.4 刚完成 PATCH、尚未开发 DELETE 时，运行 `node scripts/course-checks.mjs --case resource-patch`。它新建一条非敏感资料，检查 PATCH、独立 GET、坏输入 400、不存在 ID 404，保留修改后的记录，最后 `PASS resource-patch`；不调用 DELETE。记下打印 ID，查询数据库核对。失败先按该 ID 只读检查，不重复运行来猜结果。

2.4 两个接口完成后再用 `--case resource-crud`，它修改并只删除自己本次新建的单个 ID，检查原记录不变。两项脚本都不能替代页面／数据库／重启证据。已有登录保护导致 401 时停止，使用后续带 Session 案例，不取消认证。

2.3 受控故障用 `--case resource-db-failure`，只接受正文规定的 127.0.0.1:65431/course_unreachable 无效目标；先按正文备份正常 DATABASE_URL 行、确认端口关闭、重启，再验证 GET/POST 503。无论结果如何，恢复被改的那一行并重启，GET 200 和原 ID 仍在才算恢复。不能在真实库故障或线上使用此开关。

Cookie 名称由应用约定；工具接受 32 随机字节的 base64url（43 字符）或 hex（64 字符）编码，仍严格检查 HttpOnly、SameSite=Lax、Path=/，并以 /me、退出、到期和数据库事实验收会话，绝不以换名称跳过安全要求。

```bash
node scripts/course-checks.mjs --case cookie
```

2.5 验证没有 Cookie 时 401、有 Cookie 时 200、退出后旧 Cookie 仍被拒绝。脚本自动建立专用账号，Cookie/密码只在内存中，不要求从浏览器复制。

```bash
node scripts/course-checks.mjs --case session
```

2.5 验证过期 Session。仅将脚本新创建、并在 API 和数据库两边核对过的那一条 Session 改为过期，不修改你的浏览器会话，不清表。应用和脚本必须指向同一独立学习库，连接配置从 Next 的本机环境文件读取。

2.7 的页面过期实验：在自己的本机页面新注册 `p1_expiry`（已用过改为 `p1_expiry_2`），保存一条测试资料，不退出或重新登录。在 `.env.course-checks` 填 `CHECK_UI_USERNAME=p1_expiry`（实际新名字），15 分钟内运行：

```bash
node scripts/course-checks.mjs --case ui-session
```

只允许最近新建、且恰有一条有效 Session 的专用账号。看到 `PASS ui-session` 后，在原测试页面先开 Network 再点“重新读取”，观察 GET 401、旧资料/草稿/成功提示清除并出现登录入口。不要先刷新整个页面，避免把重新加载清空误当作组件正确处理了 401。命令仅触发过期，不宣称 UI 已通过。

```bash
node scripts/course-checks.mjs --case ownership
```

完成 2.6 后验证双方列表、跨账号 PATCH/DELETE 404，以及两条测试资料仍在且没有被改。不要在 2.5 尚未实现 ownership 时要求该项通过。

```bash
node scripts/course-checks.mjs --case origin
```

2.6 验证本机异常 Origin 403、资料数量不变。请求仍发往你自己的本机项目，`https://course.invalid` 仅是故意错误的请求头，不会访问该网站。

每个案例有 `PASS` 行和真实 HTTP 状态，最后有 `PASS <案例名>`。出现 `FAIL` 就是未通过，不自动重试、不删除安全检查。新测试用户的名字以 `p1_` 开头；测试资料只用非敏感内容，留在独立学习库里，不自动清库。

2.8 的线上 Origin 检查只向**你自己的正式 HTTPS 地址**发一次无 Cookie、空请求体的 POST，不登录、不创建线上测试账号、不操作数据库：

```bash
node scripts/course-checks.mjs --case production-origin --url https://这里换成自己的正式域名
```

不能把示例域名原样使用。应有 `PASS production-origin-rejected: HTTP 403`；其他状态都是本项未通过。

`LOCAL_URL_REQUIRED`：填本机 HTTP 地址，只有主机和端口，不含 `/api`。`API_DATABASE_MISMATCH`：应用与脚本不在同一库，先核对环境文件并重启服务。`GIT_IGNORE_REQUIRED`：先修配置文件忽略/跟踪状态，不提交真实配置。`CHECK_EXECUTION_FAILED`：检查服务是否 Ready、依赖与数据库是否可用；只将脱敏错误发给 AI，绝不粘贴 Cookie、密码或连接串。

## 2.7 隔离故障演示

完整逐步说明在 2.7 正文。先停止日常 dev，确认自己的独立学习库、三次迁移和 `/.runtime/` 忽略规则。在日常项目运行 `node scripts/fault-project.mjs prepare --learning-db`；成功后进入 `.runtime/s2-l7-fault-demo`，依次 `npm install`、`npx prisma generate`、`npm run dev -- --hostname localhost --port 3008`。副本只复制代码，使用新的随机 schema，不复用原会话或资料，不复制原秘密文件。只在副本新建账号。

第二终端也进入副本，`node scripts/fault-proxy.mjs normal` 启动 localhost:3007 入口。切换模式前 Ctrl+C 停该代理，终端重新运行 slow-get、slow-write、read-fail-after-write、lose-write-response 中的一种；模式名放在命令最后，终端 A 不停。前两种延迟真实响应两秒，第三种在真实写入成功后注入 GET 503，第四种在返回成功响应头后截断一次响应正文，JSON 读取失败；避免直接断连接触发浏览器自动重发。工具不重发写入。用 `node scripts/fault-project.mjs count 唯一标题` 核对数据库行数。

真实数据库故障单独在 normal 模式运行 `node scripts/fault-project.mjs db-break`，只临时改名副本 Resource 表，观察应用 GET 503；立即 `node scripts/fault-project.mjs db-restore` 恢复原表并检查 GET 200。两条命令核对副本目录、随机 schema 和标记，不允许在日常项目执行。中途退出后也先 db-restore。不删除任何目录、资料或测试库。

2.6 也可先准备此副本。`node scripts/fault-proxy.mjs slow-account-get` 仅让 Resource GET 响应延迟 10 秒，同一浏览器 Alice→退出→Bob 测迟到响应；两个独立窗口不能代替竞态测试。normal 恢复。进入 2.7 后保留副本，逐个同步审核过的业务文件，不覆盖副本配置，不重新 prepare 或删除目录。

`PROJECT_COPY_SCOPE_REQUIRED` 列出尚未支持的顶层目录名称：让 AI 判断其中是否有运行所需源码，逐个审核复制范围，不把缺文件当业务故障。常用 hooks/utils/styles 等目录已支持；构建缓存、秘密文件与符号链接仍不复制。

结束时先恢复表，Ctrl+C 停代理与副本 dev，关闭实验窗口，`cd ../..` 回日常项目再 `npm run dev`，重新登录日常账号确认资料仍在。副本不是会自动同步的项目；在副本修的业务代码需审查后合回原项目，不能复制副本 .env。localhost Cookie 跨端口共享，实验期间关闭日常项目标签。
