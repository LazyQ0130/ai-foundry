import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { LessonMarkdown } from '../components/LessonMarkdown.js'

// Tool downloads and provider-specific settings belong here, not in lesson bodies.
const environmentGuide = `
## 工具与安装

**第 0 课只需完成下面第 1～4 项，然后回到第 0 课。** 第 5、6 项给后续单独开始 Stage 3／4 的学员，第一次启动 Stage 1 先不做。

:::concept{title="术语预告：后面的模型与 Agent 配置"}
Chat 是让模型回答问题，3.1 才配置；Embedding 是把文本表示为便于查找的数字，3.4 才配置；Agent 的工具调用从 4.1 开始。现在不用记后面的变量和协议，也不必提前填写。后续「给 AI 的技术备注」中的实现名称可照抄，实际操作与验收仍按对应课完成。
:::

### 1. 安装并登录 AI 开发工具

AI 开发工具是装在电脑上的软件：你用聊天描述需求，它能读取和修改你选中的项目文件。Stage 1 推荐使用 [WorkBuddy 官方下载页](https://www.workbuddy.cn)；其他能打开本地文件夹、读取和保存文件的工具也可以使用。

1. 在官网选择与你电脑对应的 Windows 或 macOS 安装包。浏览器下载完成后，从下载列表打开安装包。
2. Windows 按安装向导完成安装；macOS 按安装包提示将应用放入「应用程序」，再打开。具体系统步骤可查 [Windows 安装指南](https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide)或 [Mac 安装指南](https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Mac-Guide)。
3. 打开软件，点「登录」，在打开的官方登录页面按提示完成登录，再回到软件。个人学习选择个人登录方式；账号验证由你本人完成。
4. 点击「新建任务」，找到能输入文字并发送的对话框。看到可以发送任务的界面，就完成了安装和登录；这时还没有把课程项目交给 AI。

### 2. 安装 Node.js，并确认 npm 可用

Node.js 负责运行课程项目；npm 是随它安装的工具，用来准备项目需要的代码包。

1. 打开 [Node.js 官网](https://nodejs.org/en/download)，选择标有 LTS（长期支持）的版本和你的操作系统，下载图形安装器：Windows 用 .msi，macOS 用 .pkg。不用复制网页上其他安装方式的脚本。
2. 打开安装器，按默认选项完成安装。若 Windows 出现组件选择页，保留 npm package manager 和 Add to PATH 的默认选项，它们分别让 npm 可用、让终端能找到命令。
3. 安装完成后重新打开终端。Windows 在开始菜单搜索「Windows PowerShell」并打开普通 PowerShell 窗口，不选 PowerShell ISE；macOS 在「应用程序 → 实用工具」打开「终端」。一次输入一条命令，按 Enter 执行：

\`\`\`bash
node -v
npm -v
\`\`\`

**成功标志：两条命令各返回一行版本号。** node 的输出通常以 v 开头，npm 通常只有数字；两个版本不必一样。命令前已有的 PS、路径或 > 不用输入。新安装选官网当前 LTS；已有环境与后续 Starter 的要求，让 AI 对照各自 package.json 的 engines 核对，不必自己背最低版本号。

:::stuck{title="命令找不到，或 PowerShell 不允许运行 npm.ps1"}
先关闭旧终端、打开一个新终端，再试上面两条。如果 Windows 的 node 可用，而 npm 提示「无法加载 npm.ps1，因为在此系统上禁止运行脚本」，输入 npm.cmd -v；后续可对应使用 npm.cmd install、npm.cmd run dev，不必为课程修改系统执行策略。若 node 也找不到，重新检查安装是否完成及 Add to PATH 选项。
:::

### 3. 把同一个项目交给 AI 和终端

回到[第 0 课](/lesson/stage-1/s1-l0)，下载并解压 Starter。在 WorkBuddy 新建任务的输入框左下角点「选择工作空间」，选中解压后的 aifoundry-stage1-starter；其他工具找「打开文件夹」等入口。找不到时可查 [WorkBuddy 创建任务说明](https://www.workbuddy.cn/docs/workbuddy/Create-Task)。

选中的文件夹应能同时看到 app、components、lib 和 package.json。不要选 ZIP，也不要选还套着一层项目文件夹的外层目录。在对话框发送下面这段只读检查：

\`\`\`text
请只读取当前工作文件夹，告诉我完整文件夹路径，以及 package.json 的 name，不要修改文件。
\`\`\`

**成功标志：AI 报告你选中的实际路径，name 为 personal-knowledge-workbench。** 若它说找不到文件，先重新选择文件夹；不要让它重新创建一个项目。工具只回复代码时，后续明确要求保存到当前项目，再到浏览器验证。

终端也要进入同一个文件夹，具体 cd 步骤见第 0 课。另开一个终端后也需要重新确认目录；项目命令都在能看到 package.json 的目录运行。

### 4. 先记住停止、复制和刷新

| 操作 | Windows | macOS | 你会看到什么 |
| --- | --- | --- | --- |
| 停止开发服务 | 在运行 npm run dev 的终端按 Ctrl+C | 同样按 Ctrl+C | 重新出现可输入命令的提示位置，服务停止 |
| 复制终端文字 | 选中文字后用终端菜单的「复制」；Windows Terminal 可用 Ctrl+Shift+C | 选中文字后按 Cmd+C | 可把文字粘贴到别处 |
| 刷新课程项目页面 | 浏览器按 Ctrl+R | 浏览器按 Cmd+R | 浏览器重新读取当前页面 |

**终端中没有选中文字时，Ctrl+C 会停止程序。** 想复制报错时先选中文字并使用复制操作；误停服务就在项目目录重新运行 npm run dev。浏览器地址要输入顶部地址栏，包含 http://；服务启动后保持终端打开。

**工具准备好就可以[回到第 0 课](/lesson/stage-1/s1-l0)，完成下载、解压与第一次启动。** 下面的模型配置留到对应阶段再看。

### 5. 单独从 Stage 3／4 Starter 开始：先让数据库运行

已经完成前阶段且环境可用，可以跳过。这里为独立 Starter 提供本机数据库和 Stage 3 云数据库两条路线，不用另买前阶段课程；模型 Key 留到本阶段正文。

**先选路线，再开始安装。** Stage 3 可以直接用下面的「B：云数据库」，不安装 Docker、WSL，也不需要进 BIOS；已有可用 Docker 时用 A。两条路线都要完成真实迁移、账号与资料检查。Stage 4 的固定评估仍要求本机专用库，Capstone 也有独立环境要求；这里的 Stage 3 云路线不替代那些验收。

本节开始会用到 **.env 配置文件**：里面每一行都是“配置项名称=值”，程序启动时读取这些设置；这些有名字的配置项也叫环境变量。例如 AI_PROVIDER_MODE=mock 表示先用固定的练习替身。你只在文件中填写，不需要把它当命令执行；配置保存后要停止并重启服务，才能核对新设置是否生效。

#### A：已有 Docker，使用本机数据库

1. 按 [Docker Windows 官方安装说明](https://docs.docker.com/desktop/setup/install/windows-install/)或 [Mac 说明](https://docs.docker.com/desktop/setup/install/mac-install/)安装 Docker Desktop；Mac 先确认 Apple 芯片／Intel。Windows 安装器选 WSL 2 后端，按提示重启，打开 Docker Desktop 等引擎启动。在新终端运行 docker version，**同时有 Client 和 Server 才继续**。WSL 需更新时用管理员 PowerShell 执行 wsl --update，按提示重启；未安装按[微软说明](https://learn.microsoft.com/en-us/windows/wsl/install)执行 wsl --install --no-distribution。虚拟化无法启用时先按官方错误说明解决，不假装数据库已运行。
2. 打开自己下载并解压的 Starter 文件夹，终端 cd 到能看到 package.json、compose.yaml 的目录。用编辑器把 .env.example 的内容复制到**本机新建的 .env**，没有 .txt 后缀；已有 .env 只核对对应项，不覆盖其他值。
3. **Stage 3 原样 Starter** 的 DATABASE_URL 已对应本机 stage3_learning 和公开练习口令，沿用模板；只限本机学习。**Stage 4** 先在项目终端生成自己的本地数据库口令：

\`\`\`bash
node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"
\`\`\`

成功会输出一行 48 位随机十六进制文字，由你本人复制，不发给 AI。在 Stage 4 的本机 .env 填下列两项，**两个占位处换成同一行随机文字**；这种编码不用手工处理 @／# 等密码转义。其他模板项保留，AI_PROVIDER_MODE 先为 mock：

\`\`\`text
STAGE4_LOCAL_DB_PASSWORD=这里换成自己的48位随机文字
DATABASE_URL="postgresql://postgres:这里换成同一行48位随机文字@127.0.0.1:55433/stage4_learning?schema=public"
\`\`\`

4. 保留 Starter 的 .gitignore，先按第 6 项确认本项目 Git 与秘密忽略。然后在同一项目终端一次执行一条：

\`\`\`bash
npm install
docker compose up -d
docker compose ps
npx prisma migrate deploy
npx prisma migrate status
npx prisma generate
npm run dev
\`\`\`

**每条成功才继续**：安装无错误，db 为 Up／healthy（starting 就等几秒再查），迁移为 Database schema is up to date，Client 生成成功，最后 Local／Ready。Stage 3 此时是三次迁移，Stage 4 是四次；不要删旧迁移凑数。Stage 4 已有 pgvector 的迁移，Stage 3 到 3.4 才增加。

5. 浏览器打开终端给出的同一个 Local 地址，注册专用学习账号；先新增一条非敏感资料，再刷新确认还在。Stage 4 还要确认现有 AI／知识文档入口，当前 Mock 不花真实额度。按[双账号操作](#accounts)确认登录会话；然后回自己阶段第一课。

:::stuck{title="独立 Starter 起步：端口、口令或数据库失败"}
55433 被占用先核对是哪一个项目；自己的旧 Stage 3 数据库仍开着时，到旧项目目录 docker compose down，再回当前目录启动，不加 -v。别人的服务不停止。缺 compose.yaml 先查解压和目录；仅 Client 先打开 Docker 引擎；Stage 4 提示 STAGE4_LOCAL_DB_PASSWORD 缺失先查 .env 文件名和占位符。数据库初始化以后改口令不会自动改已有数据卷中的密码，恢复本人保存的原值再启动，不删卷重建；必须换密码时先请 AI 说明针对这份库的安全修改。任何 migration 失败都先停，保留原库，检查目标与脱敏错误，不运行 reset／db push。关闭应用用 dev 终端 Ctrl+C；下次 docker compose up -d 后 npm run dev，原账号和资料应仍在。
:::

#### B：Stage 3 云数据库，从第一节就可以使用

先确认自己的网络能打开 [Neon 控制台](https://console.neon.tech/)。注册与验证由本人完成。无法访问或没有可用权限时先记录卡点；已有可用 Docker 可改用 A，不必为了继续课程现场修改 BIOS。

1. 在控制台点 Create project，建立单独的 Stage 3 练习项目，取自己能辨认的名称。不要沿用公开作品的生产库。记录所选项目、branch 和 database；这里的 branch 是云数据库分支，不是 Git 分支。
2. 进入该项目的 SQL Editor，选择同一 branch 和 database，先执行下面三句。它们是网页数据库命令，不粘贴到 PowerShell。第一句确认当前库，第二句准备向量扩展，第三句查实际扩展版本：

\`\`\`sql
SELECT current_database() AS course_database;
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
\`\`\`

**成功标志：库名与你选择的一致，最后一项返回 vector 和非空版本号。** 扩展准备好不代表已经完成 3.4 的分块与向量入库；那些仍要在正文亲手实现和验收。

3. 点 Connect，保持同一 branch、database 和 role。选 Direct／unpooled（直连），有 Connection pooling 开关时关闭它，复制完整连接地址。它供本课的小型本机应用与迁移共用；保留 TLS 等末尾参数，不手拼密码，也不把地址发给 AI。可按 [Neon 连接指引](https://neon.com/docs/get-started/connect-neon)找入口；官方其他版本的 Prisma 安装代码不照抄，本课程保留 Starter 的固定依赖和正式迁移。
4. 在编辑器把 Starter 的 .env.example 复制为 .env，只替换 DATABASE_URL 的示例值，其他配置保留，AI_PROVIDER_MODE 先为 mock。检查没有 .env.txt；已有 .env.local 时核对同名地址一致，避免应用与 CLI 连接两份库。按下方第 6 项先确认 Git 忽略，再在项目终端一次执行一条：

\`\`\`bash
npm install
npx prisma migrate deploy
npx prisma migrate status
npx prisma generate
npm run dev
\`\`\`

**每条成功才继续**：三次已有迁移部署成功，状态为 Database schema is up to date，生成 Client 后服务显示 Ready／Local。云路线不运行 docker 命令。浏览器打开 Local 地址，按本页双账号步骤注册自己的练习账号；创建一条资料，刷新后仍在，另一账号看不到，退出后受保护请求被拒绝。核对这些结果后回到 3.1，3.4 可以沿用这份独立库。

连接失败先对照同一项目的 Connect 参数与所选库，确认用了直连地址、保留安全参数，且 CLI 与网页应用读取相同文件；停止旧服务并重启再检查。认证错误核对本人凭据，扩展失败核对权限。只给 AI 脱敏错误类别，不去掉 TLS、不换生产库、不 reset 或重发不确定的写入。下次继续只需在原项目启动 dev；关闭本机服务不会删除云库数据，仍须自己保留云项目和配置。3.1～3.7 的目录、模式切换与恢复统一看[Stage 3 全程路线](#stage3)。

:::task{title="理解核对：配置文件与启动"}
用自己的话简短回答，拿不准再展开答案。本课的实际操作与验收仍要完成。

1. AI_PROVIDER_MODE=mock 这一行应该写进 .env，还是当命令输入终端？
2. 配置已保存，想让运行中的服务使用新值，接下来要做什么？
:::

:::deepdive{title="核对答案：配置文件与启动"}

1. 写进 .env 配置文件，由程序启动时读取。保留其他配置，文件不能误叫 .env.txt。
2. 在同一项目停止旧服务，再启动，等 Ready 后核对实际模式。只刷新网页不够。
:::

### 6. Starter 没有 Git 历史：建立本机保存点

只在自己的解压项目根目录做，不在桌面或 AIFoundry 平台仓库运行。输入 git --version，应显示版本；找不到则按 [Git 官方下载页](https://git-scm.com/downloads)安装对应系统版本，完成后打开新终端并重新 cd。已有项目仓库沿用；新解压且没有 .git 的 Starter 才执行：

\`\`\`bash
git init
git check-ignore .env
git status --short
\`\`\`

成功标志：初始化在当前项目，忽略检查输出 .env，状态只列出项目源文件。若提示不在仓库或目录不对先停；.env、.runtime、node_modules、.next 出现在候选清单时，先让 AI 只检查 .gitignore 的规则与已跟踪路径，不读值、不删除文件。需要报告／备份的项目还应有 /.runtime/；运行 git check-ignore .runtime/course-check-proof 应输出该路径。

首次提交若提示 Author identity unknown，只为本项目设置身份；姓名换成自己的显示名，下面邮箱是本地练习用，不是平台注册或登录密码。已配置身份不必改：

\`\`\`bash
git config user.name "这里换成自己的显示名"
git config user.email "learner@local.invalid"
\`\`\`

新 Starter 先运行 git add --dry-run . 只看将加入的路径，确认没有秘密、依赖、构建缓存或运行报告，再 git add .，查看 git diff --cached --name-status，确认同一范围后 git commit -m "save starter baseline"。**成功标志：提交有编号，git log -1 --oneline 能看到它，git status --short 无未解释的改动。** 已有未提交工作要先审查，不能用这一套直接收进未知文件；后续沿对应正文查看 diff 与具体文件，不用 reset／clean 或批量删除凑干净。这些命令只保存本机代码，不备份数据库，也还没有推到 GitHub。

## Console：三步查看浏览器错误

从 1.2 开始需要时再看。本节按 Chrome／Edge 的开发者工具说明；它是浏览器自带面板，不需要安装。这里看错误，不要求往 Console 粘贴代码。

1. **打开面板。** 先在浏览器打开自己的知识工作台。Windows 按 Ctrl+Shift+I（也可 F12，部分电脑需 Fn+F12）；macOS 按 Cmd+Option+I。也可在浏览器菜单找「更多工具 → 开发者工具」。面板可能在右边或下方，这是正常的。
2. **选 Console（控制台）。** 在面板顶部标签栏找 Console；看不到就点标签栏的双箭头／更多标签。直接打开控制台的快捷键是 Windows Ctrl+Shift+J、macOS Cmd+Option+J。不要把浏览器地址栏或系统终端当控制台。
3. **重做出问题的动作。** 面板保持打开，刷新页面，再点击刚才出问题的控件。若出现新的红色错误，记下第一条错误文字和文件位置；不要复制 Cookie、密码或 Key。

**成功标志：能找到 Console，并看到本次操作产生的信息。** 没有红色错误不等于功能一定正确，还要按课程观察页面结果。快捷键没有反应时先点一下网页再试，或使用浏览器菜单。键位可对照 [Chrome 官方说明](https://developer.chrome.com/docs/devtools/shortcuts)。

## Network：三步确认请求与响应

从 2.2 开始需要时再看。Network 是浏览器记录网络请求的面板，可以证明刚才的按钮是否真的向服务端发了请求。

1. **先开面板再操作。** 在自己的项目页面按 Windows Ctrl+Shift+I／macOS Cmd+Option+I，顶部标签选 Network（网络）；被折叠时在双箭头／更多标签中找。左上角记录按钮通常是红色圆点，若暂停则点击恢复记录。面板打开前发生的请求可能没有记录，打开后再刷新或点按钮。
2. **找到本次请求。** 点 Fetch/XHR 筛选，只看接口通信；在过滤框输入接口末尾，例如 resources、me 或 answer。然后回到页面点一次发送／重新读取。列表应出现对应的新行。没有行时清空过滤条件、改回 All（全部），确认记录未暂停，且点的不是只在本页显示预览的按钮。
3. **看三处证据。** 点击那一行，Headers（标头）里找 Request Method（方法）和 Status Code（状态码）；Payload（载荷）里看发出的 JSON；Response（响应）里看服务端返回的 JSON。GET 通常没有 Payload，这是正常的。只查看课程要求的字段，不复制 Cookie、Set-Cookie 或 Authorization 值。

**成功标志：能把刚才的页面动作对应到一条请求，并读出方法、状态码和响应。** 200/201 通常是成功，400 是输入被拒绝，401 是未登录，403 是来源或权限被拒绝；故意做失败验收时出现红色请求行可以是正确结果。Pending 表示仍在等待，Failed／连接错误则先确认服务终端仍显示 Ready 和正确端口。

:::task{title="理解核对：Console 与 Network 证据"}
先用自己的话回答，拿不准再展开答案。

1. 要找浏览器错误、核对实际请求、证明存库，分别看什么证据？
:::

:::deepdive{title="核对答案：Console 与 Network 证据"}

1. 分别看 Console 错误、Network 请求和响应、数据库记录与重新读取。没有红色错误，不能单独证明保存成功。
:::

## 双账号：普通窗口与无痕窗口

从 2.5 开始需要时再看。Alice、Bob 是课程对两个人的称呼，不是平台预先发给你的账号；请在**自己的知识工作台**注册两个专用测试账号，不在 AIFoundry 教学网站另注册。

![两个普通标签页共享同一会话，普通窗口与无痕窗口分别保存 Alice 和 Bob 的会话](/course-media/operations/accounts-session-guide.webp "共享会话与独立会话（AI 生成的概念示意，非浏览器截图）")

1. **普通窗口用 Alice。** 打开项目地址，注册 alice_practice（已存在就登录自己的该账号，或换一个新名字），密码使用自己的测试密码，至少 8 位，不复用个人密码。核对页面显示当前用户名。
2. **无痕窗口用 Bob。** Chrome 菜单选「新建无痕窗口」，Edge 选「新建 InPrivate 窗口」；Windows 可按 Ctrl+Shift+N，macOS 可按 Cmd+Shift+N。在新窗口输入与普通窗口**完全相同**的项目地址，再注册／登录 bob_practice，核对用户名。不要一个窗口用 localhost、另一个用 127.0.0.1，也不要把端口换掉。
3. **分别操作并核对。** 两边分别刷新页面，普通窗口仍是 Alice、无痕窗口仍是 Bob，才算两套独立会话。2.5 尚未做所有权隔离，两边能看到同一批数据库资料是预期；2.6 之后，各自新增一条非敏感资料，应只在本人数据库列表出现。静态示例资料不用于判断隔离。

**成功标志：两个窗口同时显示不同用户名；2.6 之后互相看不到对方新建的资料。** 两个普通标签页会共享登录；多个无痕窗口之间也可能共享同一无痕会话，所以本课使用「普通＋无痕」，不要用两个无痕窗口冒充两个人。关闭所有无痕窗口后需要重新登录，账号与数据库资料不会因此被删除。快捷键和会话行为可查 [Chrome 无痕说明](https://support.google.com/chrome/answer/95464)。

:::task{title="理解核对：两个账号与独立会话"}
先用自己的话回答，拿不准再展开答案。

1. 要同时用 Alice 和 Bob，本页让你用哪两种窗口？
2. 两个窗口应该访问同一个完整项目地址，还是用不同端口？为什么？
:::

:::deepdive{title="核对答案：两个账号与独立会话"}

1. 普通窗口与无痕窗口，分别登录并刷新核对不同用户名。两个普通标签页通常共享 Cookie，不能当两套独立会话。
2. 同一个完整地址，才能比较同一项目中的两个账号。2.5 尚未加资料归属，共享是预期；2.6 后才核对私有隔离。
:::

## Chat 模型配置

以下是仓库课程参考实现已验证过的配置，不代表今天已重新执行云端调用，也不保证每个账号都能使用这些模型。模型可用性、额度和接入地址以自己的控制台为准。配置核对日期：2026-10-08；原始验证记录保留在仓库验收文档。

参考 Provider 为阿里云百炼 China (Beijing)，Chat 模型为 qwen3.7-flash。参考 [官方 API Key 与地域说明](https://help.aliyun.com/zh/model-studio/get-api-key)，使用自己北京地域 Workspace 的地址、Key 和额度，不能跨地域混用。

### 第一次取得 Key 和接入地址

3.1 完成 Mock 后再做这几步；登录、实名认证和创建 Key 由你本人操作。

1. 打开[百炼控制台](https://bailian.console.aliyun.com/)，用自己的阿里云账号注册／登录；按官方提示开通百炼，提示实名认证时先完成验证。看到控制台首页才继续。
2. 从上面的官方 API Key 页面进入 Key 管理，右上角选择 **华北2（北京）**。创建 Key 时选择自己的归属账号与业务空间（Workspace）；已有可用 Key 可沿用。无法创建先查账号／空间权限，不向 AI 提供密码或验证码。
3. 点击自己 Key 旁的复制图标，稍后直接填入本机配置。记下所在地域和业务空间；Key 不发到聊天。Key 已创建不等于模型有权限或额度，要在该空间核对课程模型是否可用。
4. 从[官方首次调用说明](https://help.aliyun.com/zh/model-studio/first-api-call-to-qwen)的 OpenAI 兼容示例取得 **Base URL**（接口根地址）。按自己的地域与空间填写；示例含 WorkspaceId 时，在控制台「业务空间管理」找到本空间 ID，替换整个占位符。只填到兼容接口的 v1，不追加 /chat/completions 或 /embeddings。官方文档存在通用地址和空间地址的不同示例，按自己空间的实际接入说明核对，不混拼两种地址。

**准备成功标志：知道自己的地域、空间，已取得本人的 Key 和兼容接口根地址。** 这仍不是模型调用已通过；真实证据要回到 3.1 的产品页面取得。上述入口按 2026-10-14 官方说明复核，模型实跑记录仍是前述日期，不冒称今天已调用。

### 填进项目，而不是贴进终端

API Key 是模型服务商给你的调用凭证，用来识别账号、权限和用量；它不是模型名字，也不是在聊天框里输入的问题。Base URL 是请求进入该服务的根地址。两者要对应同一地域和业务空间，只有地址、没有有效凭证，仍不能调用。

在编辑器打开与 package.json 同层、被 Git 忽略的服务端 .env；没有就新建，不能叫 .env.txt。保留已有数据库配置，只填下面这些键，每个键只出现一次。下面是**文件内容，不是终端命令**；尖括号连同占位文字一起换成自己的值：

\`\`\`text
AI_PROVIDER_MODE=real
AI_CHAT_BASE_URL=<自己北京地域 Workspace 的兼容接口 Base URL>
AI_CHAT_API_KEY=<仅在本机填写自己的 Key>
AI_CHAT_MODEL=qwen3.7-flash
AI_TIMEOUT_MS=20000
AI_CHAT_DISABLE_THINKING=1
\`\`\`

未配置真实模式时先用 mock 完成确定性验收。参考 Adapter 的超时范围为 1000～30000 ms，普通回答固定 max_tokens:256；AI_CHAT_DISABLE_THINKING=1 只在实现明确支持的模型上发送 enable_thinking:false。替换模型前检查 Adapter、参数兼容性和回归测试，不能只换名字就假定兼容。

保存后在项目终端依次运行 git check-ignore .env 和 git status --short：前者应输出 .env，后者不能列出秘密文件。已有 .env.local 等文件时，让 AI 只检查同名键和加载顺序，不回显值。Ctrl+C 停止旧 dev，再运行 npm run dev，等 Ready 后回[3.1 真实问题验收](/lesson/stage-3/s3-l1)。后续每次切 mock／real 或改服务端配置，都按这一保存、停服务、重启顺序进行；只刷新网页不会让旧服务可靠地换配置。

:::stuck{title="Key 已填，但真实模式仍失败"}
仍显示 Mock 先查实际生效的 AI_PROVIDER_MODE 和是否重启；认证失败查 Key 与地域／业务空间是否对应、是否仍有占位符；模型不可用查该空间的模型权限与额度；连接失败查根地址是否多拼了接口路径。只给 AI 脱敏错误类别，不发 Key 或完整请求头。先把 AI_PROVIDER_MODE 改回 mock 并重启，确认旧功能仍可用；问题未解决就记录真实模式未通过，不换模型名字凑成功。
:::

## Embedding 配置

参考 Embedding 模型为 text-embedding-v4，维度 1024。Chat 和 Embedding 配置独立，在同一学员项目的服务端 .env 追加：

\`\`\`text
AI_EMBEDDING_BASE_URL=<自己北京地域 Workspace 的兼容接口 Base URL>
AI_EMBEDDING_API_KEY=<仅在本机填写自己的 Key>
AI_EMBEDDING_MODEL=text-embedding-v4
AI_EMBEDDING_DIMENSION=1024
\`\`\`

课程数据库、检索过滤和参考测试按 1024 维设计。模型或维度变化时需要验证数据库兼容性并重新建立对应索引；不要混用 Mock 与 Real 或不同模型的向量，不要截断或补零掩盖不匹配。

按 Chat 小节的配置检查与重启步骤生效，再回[3.4 入库验收](/lesson/stage-3/s3-l4)：HTTP 成功且 kind=real、文档 ready、数据库每个分块实际维度为 1024，才算完成。Chat 成功不能替代 Embedding 验收；失败就回到 mock 并重启，保留原文档记录，不手改模型标签冒充重新索引。

## Agent 兼容与配置安全

Stage 4 沿用上面的 Provider 配置。参考实现保留 tool_choice=auto、enable_thinking=false、parallel_tool_calls=false；真实模型可能直接回答，记录实际路径，不强制工具调用来凑验收计数。

这些秘密各有用途：模型 API Key 允许调用模型服务；数据库口令允许连接数据库；AGENT_APPROVAL_SECRET 用来校验保存提议没有被偷换；MCP_AUTH_SECRET 用来检查 MCP 请求是否获准进入服务。登录 Session Token 则识别当前登录会话。它们不能相互替代，审批与 MCP 的两个 Secret 要使用不同的随机值；没有必要为所有项目找一串“通用 Key”。

Key、数据库地址、审批与 MCP Secret 只留在服务端，不使用 NEXT_PUBLIC_ 前缀；登录 Cookie／Token 也不粘贴给 AI，不放入日志、截图或 Git。登录课使用随机 Session Token，本课程没有要求另外添加一个名为 SESSION_SECRET 的变量。保存配置后检查 git status，确认 .env 被忽略，并重启本地服务。

:::task{title="理解核对：Key、Secret 与登录凭证"}
先用自己的话回答，拿不准再展开答案。

1. 审批 Secret 和 MCP Secret 各管什么？应该用同一个随机值吗？
2. 服务端 API Key 应放服务端配置，还是放 NEXT_PUBLIC_ 开头的公开配置？
:::

:::deepdive{title="核对答案：Key、Secret 与登录凭证"}

1. 前者校验保存提议没被偷换，后者检查 MCP 请求是否获准进入。用途不同，必须用不同随机值。
2. 放只供服务端读取的配置。公开前缀会把值带到浏览器，不能用来保存 Key 或其他秘密。
:::

更换 AI 开发工具通常不需要改项目；更换 Provider 或模型则必须重新验证结构化输出、流式、Embedding 和 Tool Calling。环境页集中记录推荐值，代码与测试仍承担兼容性校验。

## 多终端：保留服务，再开检查窗口

从 1.5 第一次需要两个窗口时再看。一个终端正在运行程序时，不要把下一条检查命令粘到它的日志里。最容易辨认的做法是开两个独立窗口：

| 窗口 | 当前用途 | 应看到什么 |
| --- | --- | --- |
| A：开发服务 | 在项目根目录启动 npm run dev，保持运行 | Ready、Local 地址和后续请求日志 |
| B：检查命令 | 同一项目中运行 Git、验收脚本等一次性命令 | 命令结束回到可输入的位置 |

1. Windows 再从开始菜单打开一个普通 PowerShell 窗口；macOS 在已打开的「终端」菜单选 Shell → 新建窗口。原来的窗口 A 保留，可并排摆放。使用编辑器终端的同学也可点面板的「＋」，但每个标签仍分别核对目录。
2. 新窗口 B 先进入项目。复制自己项目的完整文件夹地址，用英文引号包住；例如 cd "C:/Users/你的用户名/Desktop/你的项目"，macOS 则换成自己的路径。示例中的中文要换掉，不直接回车照用。
3. Windows 输入 Get-Location，再输入 dir package.json；macOS 输入 pwd，再输入 ls package.json。应显示当前项目路径和这个文件。A、B 都在同一份项目后，才在 B 运行检查。新窗口可能从个人主目录开始，不会自动跟随 A。
4. 只停止开发服务时，在 A 按 Ctrl+C，等提示位置回来；B 跑的一次性检查结束不需要关闭 A。误关 A，就在该项目重新启动 dev，并使用它新显示的 Local 地址。

**例外按正文核对**：2.7 故障副本的 A／B 都在副本目录，恢复日常学习后两边都回日常项目；不要拿副本地址或配置做日常检查。Prisma migration 等要求先停服务的操作，按该课顺序做。管理员 PowerShell 仅用于正文明确的系统准备，日常项目命令用普通窗口。

## 找报告：文件栏里没有 .runtime 时

.runtime 是课程保存本机运行记录的目录，通常被 Git 忽略。点开头不代表它在每个系统都自动隐藏；编辑器可能过滤了忽略文件，报告也可能尚未生成。这里不改 Git 忽略规则来让它显示。

1. 先等检查程序结束，查看它打印的报告路径和失败信息。复制的是文件路径，不是报告内容；报告可能含完整回答，仍只留本机。
2. 在当前项目的编辑器，用「文件 → 打开文件」直接粘贴那条实际完整路径。若使用“按名称打开文件”搜不到，改用打开文件对话框，或在系统文件管理器的地址栏输入项目内 .runtime 的实际路径；不要依赖全局搜索是否包含忽略文件。
3. 仍找不到，在窗口 B 确认项目路径，再运行 Windows 的 Get-ChildItem -Force .runtime，或 macOS 的 ls -la .runtime。成功会列出已有文件；不要把项目日志或秘密内容整段复制给 AI。
4. 列表存在但编辑器没显示时，检查该编辑器的隐藏／排除／忽略文件显示设置，或直接按路径打开。提示目录／目标文件不存在时，回查脚本是否成功、是否在另一份项目运行；不能新建空报告冒充结果，也不反复重跑付费评估。

打开后先核对本轮模式、案例数、失败数及文件更新时间；旧报告不算本次结果。报告仍被 Git 忽略，查看文件不等于应把它提交。

## Stage 3 全程：云数据库配本机应用

选了第 5 项 B 后，3.1～3.7 可以一直沿用**同一项目文件夹、同一个独立 Neon 项目／branch／database**。数据库在云端，网页和 Next 服务仍在自己电脑运行；不需要再按 3.4 的路线 A 安装或启动 Docker。本路线没有替你完成模型账号、真实调用或正文验收，Stage 4 固定评估与 Capstone 的本机要求也不因此改变。

首次连接成功、能读到自己的资料后，先按下面恢复表的“配置备份”步骤保存这份成功配置；以后改模式或排错都只改相应的键。不要等地址丢失才找 Git，Git 不保存被忽略的 .env。

### 三种地址和文件，不要互换

| 名称 | 放在哪里／用来做什么 |
| --- | --- |
| DATABASE_URL | 完整云数据库连接串，只放本机服务端 .env；Prisma 和应用都连接它。不是浏览器地址，不填进评估 BASE_URL |
| Local 地址 | 窗口 A 的 npm run dev 显示的 http://localhost:端口；浏览器、CHECK_BASE_URL、EVAL_BASE_URL 用同一个主机名和端口，不带 /api |
| 模型 Base URL | 模型服务商的接口根地址，只放 .env 的 AI_CHAT_BASE_URL／AI_EMBEDDING_BASE_URL；不是数据库或评估地址 |
| .env.course-checks | 仍在 package.json 同层，只放 CHECK_*／EVAL_* 等检查配置；不把 DATABASE_URL 或模型 Key 搬进这里 |
| .runtime | 项目根目录里的本机报告与备份目录，被 Git 忽略；不是要进入后再运行课程命令的工作目录 |

自己的项目根目录应同时能看到 package.json、prisma、scripts；3.7 开发后还会有 eval。窗口 A 运行 dev；窗口 B 每次重新 cd 到**同一根目录**，运行 npm test、数据库检查与评估。不要 cd 到解压的工具包、scripts 或 .runtime 里执行它们。数据库 SQL 只在同一 Neon 库的 SQL Editor 执行。

同一个键在 .env 中只写一次。已有 .env.local／.env.development 等文件或终端变量时，让 AI 只读核对加载来源，不输出值；Next 与 Prisma 不能各自读到不同数据库。确有重复，只恢复或统一对应的键，不整份覆盖配置。Windows 若 npx.ps1 和 npm.ps1 一样被执行策略拦住，分别用 npx.cmd、npm.cmd，不必为课程改系统策略。

### 按课接着走

| 课 | 接上前一课的操作 | 本课结束仍要核对 |
| --- | --- | --- |
| 3.1 | 首次按第 5 项 B 完成安装、三次已有迁移、Client 生成和登录；先 mock，后配置 Chat real | 普通问答真实证据、旧资料与隔离；保存本机版本 |
| 3.2／3.3 | 各课开始先按下方步骤切回 mock；测试通过后再切 real | 不增加 migration；建议、流式和旧功能各自验收 |
| 3.4 | 沿用原云库，跳过全部路线 A；确认 vector 后只增量应用第四次 migration | 旧用户与资料保留、真实 vector(1024)、Mock／真实入库、数据库故障与隔离测试 |
| 3.5／3.6 | 开始先切 mock，按当前模式准备文档；真实验收再切 real 并新建真实向量文档 | 仍为四次 migration；Query 与文档同模型／维度；检索、来源和双账号隔离 |
| 3.7 | 新建专用 Mock 评估账号，固定三篇资料；真实一轮用另一个新的评估账号，题集不变 | 完整案例数、报告模式与时间、人工复核；Mock 和真实报告都保留，真实结果如实记录 |

3.4 的 npm run test:db 是由你和 AI 实现的测试入口，可使用本人确认的独立云学习库；先按正文只读核对目标，再写本轮新建的合成测试账号。它不是 Stage 4 的固定本机数据库脚本，不应通过改掉 Stage 4 guard 来借用。后续 3.5～3.7 复用它，缺脚本就先补开发。

### 每次切换 Mock／真实模式

1. 在 A 按 Ctrl+C，等出现可输入命令的位置。在编辑器只把 .env 的 AI_PROVIDER_MODE 改成 mock 或 real，保留原数据库地址及两组模型配置；real 前先核对自己的账号、模型权限和用量。
2. 在同一项目重新运行 npm run dev，等 Ready，浏览器继续用这次 Local 地址。先核对页面和本次响应的 kind，再按该课操作；只刷新页面不能换服务端模式。
3. 模式决定新向量怎样生成，不会把旧 Mock 向量变成真实向量。保留旧文档；用当前模式建立对应文档，再核对 ready、模型和 1024 维。不要只改标签或维度。真实生成与提问仍消耗自己的额度，按正文等待限流窗口，不盲重试。
4. 3.7 还要在 B 核对 .env.course-checks 的 EVAL_MODE 与产品一致；真实模式另需 EVAL_REAL_CONFIRM=YES。退出真实评估时改回 mock／NO，并重启为 Mock；只关确认开关不会把应用本身切回 Mock。

### 失败后，先恢复什么

| 卡点 | 照着恢复 | 恢复成功标志 |
| --- | --- | --- |
| 连不上云库／认证失败 | 停止连续写请求；核对原项目、branch、库与 Direct 连接。只恢复本人保存的 DATABASE_URL，保留 TLS 参数；不要换新项目或删除原库。先在同库 SQL Editor 只读确认库名和原资料，再重启 dev、重新 GET | 读到原 ID／资料，登录仍正常；SQL Editor 可用但应用失败时继续检查本机网络与配置，不重新入库碰运气 |
| 配置备份：修改前留恢复点 | 先确认 Git 忽略 .env* 与 /.runtime/；项目里还没有 .runtime 时，先在编辑器文件栏新建这个文件夹。把原 .env 另存为其中一个新的备份文件名，再回原 .env 修改。备份只留本机，恢复时对照它只还原本次改的键 | Git 状态没有秘密文件，应用与 CLI 使用同一份配置；Git 提交只恢复源码，不恢复数据库或 .env |
| migrate 失败 | 停在失败命令，恢复连接后先在 B 运行 npx prisma migrate status，核对原库与 migration 历史；有失败迁移则交给 AI 只读检查并给出针对性修复。未核清前不重复 deploy，不 reset／db push／删迁移 | 迁移状态正常，原用户资料仍在，3.4 后为四次；再 generate、重启应用。数据库已迁移时不能只回退源码就称恢复 |
| 写入响应丢失／文档 failed | 先重新读取当前账号列表，在 SQL Editor 按已知 ID 只读核对；不确定是否已成功就先不重发。failed 保留错误证据，按正文修复后用新合成文档重测 | 原资料仍在；失败文档不冒充 ready，没有半成品 Chunk；新文档确实 ready |
| 评估中断／模式不一致 | 在运行评估的 B 按 Ctrl+C，保留已记录的进度与旧报告；A 若仍正常不用停止。按 3.7 核对账号、模式和知识包；中断的一轮不算完成，也没有自动续跑 | 新一轮另行决定是否完整执行，真实调用须本人确认；只认本轮模式、时间和完整案例数，不以存档或旧报告顶替 |

如果网络恢复后仍失败，可按 [Neon 连接排错](https://neon.com/docs/connect/connection-errors)核对受控错误。找不到报告用[查找运行报告](#reports)；新终端的打开、目录检查与误关服务恢复用[多终端管理](#terminals)。上述恢复步骤不免除正文的真实调用、安全和数据库事实要求。
`

export default function Environment() {
  // Stable anchors let lessons link to the specific setup they need.
  const sections = ['tools', 'console', 'network', 'accounts', 'chat', 'embedding', 'agent', 'terminals', 'reports', 'stage3']
  const parts = environmentGuide.trim().split(/(?=^## )/m)
  return <section className="shell py-10 sm:py-14">
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-brand-700">开始之前 · 免费公开</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">课程环境说明</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">第 0 课只看「工具与安装」即可，完成后回到第 0 课。后面的模型与环境变量配置，等对应阶段再看。</p>
      <nav aria-label="环境说明目录" className="my-6 flex flex-wrap gap-3 text-sm text-brand-700">
        {['工具安装', 'Console 操作', 'Network 操作', '双账号测试', 'Chat 模型', 'Embedding', 'Agent 与安全', '多终端管理', '查找运行报告', 'Stage 3 全程路线'].map((title, i) => <a key={sections[i]} href={`#${sections[i]}`} className="underline">{title}</a>)}
      </nav>
      {parts.map((body, i) => <div id={sections[i]} key={sections[i]} className="scroll-mt-24"><LessonMarkdown body={body} /></div>)}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-sm leading-6 text-slate-600">环境准备好后，进入第 0 课完成检查。</p>
        <Link to="/lesson/stage-1/s1-l0" className="btn btn-lg btn-primary mt-4 w-full sm:w-auto">从第 0 课开始<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  </section>
}
