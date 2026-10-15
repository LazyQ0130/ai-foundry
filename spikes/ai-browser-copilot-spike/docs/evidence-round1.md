# AI 网页阅读与知识整理助手：Phase 0 技术验证报告

日期：**2026-10-14，Asia/Shanghai**。工程：`spikes/ai-browser-copilot-spike`。

**结论：NO-GO。尚不具备进入 P1–P8 的条件。** 独立最小原型、锁文件、全新目录重建、服务端实际 HTTP 测试和 ZIP 审查已完成；真实 Chrome 扩展加载取得部分证据，但工具栏打开 Side Panel、activeTab 读取、原生右键和扩展到 Mock 的完整链路受到界面工具阻断，不能判为成功。**Phase 0 验收尚未完成；没有发布课程或继续正式研发。**

## 1. 输入依据与范围

已阅读用户提供的两份完整文档，并保留原件副本：

- [Phase 0 任务书](inputs/phase0-task.md)，SHA256 `42efd07493a64ae70b3982d40e8beca41432e75bf6d552dc43611075b9a2c91f`。
- [课程研发蓝图 V1.1](inputs/blueprint-v1.1.md)，SHA256 `59cf0cca2c2a54df9ecb4b6574aa2bbc36b1e08bf7299d33d5b9812269747600`。

文档作为本轮技术任务与长期设计依据；其中 P1–P8、平台通用化、发布等内容没有作为本轮实施指令。本轮代码、文档及证据均新增在独立 Spike 目录。没有更改 Stage 1–4、Capstone 教学正文、Starter、权限、业务 API、数据库或发布标记，没有真实模型调用、额外第三方费用或公网服务。

实际仓库调查确认：主站 React 18 / Vite / Express 5 / Prisma 6，课程 29 节；Capstone C1–C9 的 metadata、授权路由及进度模型独立。蓝图关于未来项目维度的建议成立，但本轮没有迁移或接入。内部部分 Capstone README 属于旧阶段记录，不能据此推断当前只有两节课。详细调查入口和架构见 [decisions.md](decisions.md)。

## 2. 实测环境与证据分级

| 项目 | 实际记录 |
|---|---|
| 系统 / Shell | Windows / PowerShell |
| Node / npm | 24.16.0 / 11.13.0 |
| WXT / TypeScript | 0.21.4 / 5.9.3 |
| Vite / React | 8.3.4 / 18.3.1 |
| Express / Zod / Vitest | 5.2.1 / 4.6.5 / 5.0.4 |
| 真实 Chrome | 155.0.8059.41，已安装 Google Chrome，不是 Chromium 版本替代 |
| 扩展最低目标 | manifest 声明 Chrome 116；116 本身未测 |
| 首个独立 Profile | `.runtime/chrome-profile-1`，通过指定新 user-data-dir 启动 |
| 实际加载扩展 ID | `hijkflihajcoealnhjnepmgabohaimcn`，重新定位工程目录会改变 ID |
| 真实浏览器截图 | **未取得**，窗口状态捕获受工具策略阻断 |
| 真模型 | **未测**；只提供 Provider 接口/环境变量模板，不读取任何真实 Key |

分级原则：构建和 schema 断言只证明对应代码检查；回环 HTTP 请求证明服务端实际运行；CDP 安装和 worker 注册只证明加载部分；必须由原生交互验证的能力，缺证据一律 BLOCKED。没有用合成 onClicked、CDP action 或普通扩展标签页冒充 Side Panel / activeTab 成功。

## 3. 五条主路径结论

| 路径 | 最终状态 | 已取得证据 | 缺失证据 |
|---|---|---|---|
| S0-1 扩展加载与侧栏 | **BLOCKED** | WXT MV3 build/zip；首个真实 Chrome Profile 加载，worker 注册 | 实际工具栏点击、真实侧栏截图、重开浏览器；最终重建包加载复验 |
| S0-2 临时授权与正文 | **BLOCKED** | 最小权限 manifest；只读注入、消息 schema 和上下文检查已实现 | activeTab 在真实 Side Panel 中复用；HTTPS 正文、撤权/跨源/内部页行为 |
| S0-3 划词与右键 | **BLOCKED** | 原生菜单、session 暂存、一次消费和限长代码已实现 | 两站点右键、不同 tab、空/超长/失效选区的原生交互 |
| S0-4 本地模型代理 | **BLOCKED** | 实际 8787 服务、回环监听、health/Mock 200、外站 Origin 403、边界自动测试 | 扩展→API→真实侧栏往返和 UI 故障反馈；真模型为明确未测 |
| S0-5 独立重建与打包 | **BLOCKED** | 全新目录 npm ci/typecheck/test/build/zip 全通过，实际 ZIP 审查通过 | 第二个干净 Profile 全流程 |

这些 BLOCKED 是验收范围未完成，不代表已证实 WXT 或 Chrome API 不可行。

## 4. SP-01–SP-12 强制验收矩阵

最终计数：**1 PASS / 0 未解决的 FAIL / 11 BLOCKED**。开发中发现并修好的失败另列，不能隐去；未执行部分没有记作 PASS。

| 编号 | 场景 | 状态 | 证据及判断 |
|---|---|---|---|
| SP-01 | 干净环境安装 MV3 | **BLOCKED** | [browser-9222.json](artifacts/browser-9222.json) 记录实际 loadUnpacked 返回 ID/版本；运行时列出 `chrome-extension://…/background.js`。但没有完整错误面板/截图及最终重建包加载复验，保守不判整项通过 |
| SP-02 | 点击图标打开侧栏 | **BLOCKED** | [界面工具阻断原文](artifacts/browser-tool-block.json)。代码配置 action/side_panel 不替代实际点击 |
| SP-03 | 授权后读取 HTTPS 网页 | **BLOCKED** | Chrome 成功导航 `https://example.com/`、标题为 Example Domain，仅证明页面可访问；未取得图标授权后的页面快照 |
| SP-04 | 无授权 / 跨源后读取 | **BLOCKED** | 授权提示与校验代码存在，activeTab 撤销和新标签页行为未在浏览器实测 |
| SP-05 | 切 tab 后旧请求返回 | **BLOCKED** | `sameContext` 与 schema 有辅助断言；generation/Abort/双重 tab 检查有实现，真实异步竞态未测 |
| SP-06 | 两站点原生划词 | **BLOCKED** | 两个 fixture 及右键菜单已提供；没有两站点的实际选区交互、tab 归属与截图 |
| SP-07 | 空 / 超长 / 失效选区 | **BLOCKED** | 2000 字符、60 秒、一次消费和失效处理有实现；原生回传及 UI 拒绝反馈未测 |
| SP-08 | Mock 页面数据往返 | **BLOCKED** | [api-smoke.json](artifacts/api-smoke.json) 是 **Node fetch** 客户端，不是扩展。服务端 200 不能证明完整扩展链路 |
| SP-09 | 关闭 / 超时 / 非法响应 | **BLOCKED** | 服务端真实 HTTP 超时 504、非法 Provider 502 已测试；API 关闭及客户端 UI 超时/非法 JSON 的浏览器反馈未测 |
| SP-10 | manifest / 包无全站权限和 Key | **PASS** | [package-audit.json](artifacts/package-audit.json) 审查实际重建 ZIP：MV3、5 个必要权限、无 host_permissions/content_scripts/popup；无 .env/API/test/map 文件；密钥启发式扫描无命中。未读取或打包真实 Key；扫描不是数学上的不存在证明 |
| SP-11 | Chrome 内部 / 禁止注入页 | **BLOCKED** | 代码过滤内部页与扩展商店；真实 Chrome 禁止注入及错误反馈未测 |
| SP-12 | 第二个干净 Profile 全复验 | **BLOCKED** | 全新依赖/构建目录不是第二个 Chrome Profile；未完成第二个 Profile 安装及四条操作 |

按任务书 GO 必须通过的 SP-01/02/03/04/06/08/10/12，仅 SP-10 完整通过，因此结论必须是 NO-GO。

## 5. 已完成的实际运行与可复现证据

### 5.1 全新目录重建：PASS（SP-12 的前置条件，不是 SP-12 本身）

执行 `./scripts/rebuild.ps1`，用明确源文件白名单复制到此前不存在的 `.runtime/rebuild-20261014-123246`。无 node_modules、.wxt、.output 起步，不执行任何删除。脚本逐步检查退出码：

| 命令 | 结果 | 原始日志 |
|---|---|---|
| npm ci | PASS，安装 240 packages，审计 241 packages | [rebuild-ci.txt](artifacts/rebuild-ci.txt) |
| npm run typecheck | PASS | [rebuild-typecheck.txt](artifacts/rebuild-typecheck.txt) |
| npm run test | PASS，1 个文件 / 6 项测试 | [rebuild-test.txt](artifacts/rebuild-test.txt) |
| npm run build | PASS，MV3 5 个运行文件，326.94 kB | [rebuild-build.txt](artifacts/rebuild-build.txt) |
| npm run zip | PASS，100282 bytes | [rebuild-zip.txt](artifacts/rebuild-zip.txt) |

环境和目录分别见 [rebuild-environment.txt](artifacts/rebuild-environment.txt)、[rebuild-path.txt](artifacts/rebuild-path.txt)。依赖审计 [npm-audit.json](artifacts/npm-audit.json) 为 0 个已知漏洞；lock 中含可选平台包，许可证清单有 290 个条目，与本机实际安装数不同是正常情况。

交付 [MV3 ZIP](artifacts/ai-browser-copilot-phase0-0.0.0-chrome.zip)，SHA256：

```text
e728cdb03e33eb20e3006becaf58a821d32b900636e3d0c0bc1fa89f3667aa06
```

### 5.2 服务端实际运行：PASS（不等于扩展网络链路）

执行 `$env:EXTENSION_ORIGIN='chrome-extension://hijkflihajcoealnhjnepmgabohaimcn'; npm run api`。启动日志见 [api-server.txt](artifacts/api-server.txt)，实际 socket 监听地址见 [api-listener.json](artifacts/api-listener.json)：**127.0.0.1:8787**，没有公网地址绑定。

Node fetch 实际请求记录见 [api-smoke.json](artifacts/api-smoke.json)：health 200；相同扩展 Origin 的受控 fixture 请求 200，返回确定性 `[MOCK]`、匹配 requestId/snapshotId；外站 Origin 请求 403。输入明确是人工 fixture，不冒充已捕获网页。

6 项自动测试中，5 项启动真实回环 HTTP socket，覆盖精确来源预检、可预测往返、空/外站 Origin、伪造 Host、body/text 长度、非法 JSON/未知字段、30/min 限流、悬挂 Provider 超时 504、非法/错配响应 502。另 1 项只是消息 schema / tab+URL 纯函数断言。API 服务在测试后停止，重现时按 README 启动。

### 5.3 Chrome 加载部分：已观察，整条验收 BLOCKED

`npm run browser:launch` 启动已安装 Chrome 的新 Profile，CDP loadUnpacked 返回真实 ID、版本与时间（04:30:06 UTC，即上海 12:30:06）；记录见 [browser-9222.json](artifacts/browser-9222.json)。随后实际枚举到 background worker URL，重载扩展并打开 Example Domain。加载使用本机独立测试 Profile 的调试参数，不是学员必需配置，也不是对正式浏览器设置的改动。

后续真实 Windows 界面取证首次发现窗口最小化；按工具建议激活、刷新窗口后，安全检查明确拒绝继续，理由为 **无法足够可靠地确定当前浏览器 URL 以执行策略检查**。完整返回文案保存在 [browser-tool-block.json](artifacts/browser-tool-block.json)。没有继续输入、点击或通过其他自动化方式绕过拒绝，未取得浏览器截图。原生交互与最终构建产物的 Chrome 复验因此全部保留为 BLOCKED。

## 6. 问题调查、修复和最终结果

以下为过程记录摘要；最初失败来自工具输出，不将后续通过日志伪称首轮即通过。

| 发现的问题 | 调查与修复 | 最终结果 |
|---|---|---|
| storage.session 值被新 Chrome 类型定义为 unknown，直接读取报 TS2339 | 增加 SelectionSlot 运行时 schema；读取后解析，不以强制 any 规避 | 类型检查 PASS |
| @types/chrome 没有所用 TabActiveInfo / TabChangeInfo 名称 | 改用事件实际所需的最小结构类型 | 类型检查 PASS |
| 测试输入 v 被推断为 number | 用 `1 as const` 保留消息版本字面值 | 类型检查 PASS |
| 首轮 HTTP 测试 4 项失败，响应 403 | 随机测试端口与写死的 Host:8787 不一致；按实际监听端口严格校验回环 Host | 实际 HTTP 测试正常 |
| 伪造 Host 测试仍失败，意外返回 200 | 本环境 Node fetch 没有按期望覆盖 Host；改用 node:http 显式发送伪造 Host，验证服务真实拒绝，未放松服务校验 | 403 验证 PASS，全部 6 项测试 PASS |
| WXT build 出现主仓库 Tailwind 警告 | Vite 自动继承父 PostCSS；显式设置独立空 PostCSS plugins | 新目录构建无该警告 |
| ZIP 初始文件名带 undefined | WXT root 是 extension 子目录，该目录无 package version；补最小 private package.json | ZIP 文件名固定为 0.0.0 |
| Windows 界面无法取证 | 首次最小化后按提示激活/刷新；恢复尝试被工具 URL 安全检查停止 | **未解决，BLOCKED**；不将其诊断为扩展缺陷 |

## 7. 关键风险、替代路径与复验计划

| 风险 | 已做处理 | 下一步验收要求 |
|---|---|---|
| 工具栏/侧栏授权假设错误 | 最小权限实现，无全站兜底 | 先恢复可用的界面验证环境或由测试人员手工执行 README；图标触发后在真实侧栏注入、跨源撤权；失败则调查 Chrome grant，不扩大权限 |
| 本地 fetch 被 CORS/本地网络策略阻断 | 精确 Origin 校验，标准 CORS，限制 CSP | 记录浏览器实际请求 Origin、预检和错误；若必要试最窄回环 host 权限，并设计无 Origin 场景的本地鉴权；未经实测不冻结 |
| 跨 tab / URL / 同 URL 重载混入旧结果 | 前后上下文校验、generation、Abort、session 选区失效 | 人工切 tab 与受控延迟并发测试；如同 URL 重载仍存在窗口，补 documentId/导航代次绑定后重测 |
| worker 休眠、面板未打开导致选区丢失 | 先同步 open，session 暂存，一次消费 | 实测面板冷启动、worker 重启、连续右键与过期选区；错误必须可恢复且无旧选区误用 |
| 网页内容含恶意指令 / 敏感表单 | 纯文本渲染、排除表单、无执行工具、无真模型 | 先测 fixture 抽取；真模型抗提示注入和引用真实性留正式阶段专门评估，Mock 不能证明 |
| Node 20 与 WXT 0.21.4 不兼容 | Spike 独立 Node >=22，实测 Node 24.16.0 | 教材明确独立工程环境，不更改主站最低版本来凑兼容 |
| Chrome 116 下限未经验证 | manifest 目标保留，未调用新于116的设计必需 API | 在受控离线兼容环境或固定可获浏览器上补测，避免用旧浏览器登录/日常浏览；实测后决定教材最低版本 |
| Origin 被误当公网鉴权 | 仅回环绑定，拒绝真实 Provider 启用 | 本轮不部署公网。将来真实/公网服务需独立鉴权、配额和滥用设计 |

复验顺序：先在无浏览器交互阻断的环境重建 → 用最终 MV3 包完成 SP-01/02/03 → 测 SP-04/05/11 → 两个 HTTPS 站点和多 tab 测 SP-06/07 → 扩展网络及故障注入 SP-08/09 → 正常重开 Chrome → 第二个全新 Profile 跑 SP-12。每一步记录版本、命令、tabId/URL、截图/录屏、失败修复与重测结果。未完成前继续 NO-GO；不能只补一张截图就认定全部通过。

## 8. 对课程蓝图的必要调整建议（仅建议，未修改原稿或教材）

1. **单独注明扩展工程 Node 环境。** 当前 WXT 0.21.4 要求 Node >=22，本次实际验证 24.16.0；主站 Node20.19 下限不适用。课程只写已复验组合，并携带 lockfile。
2. **把“Chrome116+”拆成 API 设计下限与实际验收版本。** 本次安装 Chrome155；不得写成116实测通过。保留低版本/当前版本的兼容证据栏。
3. **权限链路继续作为 Phase0 硬闸门。** 明写侧栏按钮不授予新的 activeTab；补无授权 tab、跨源导航、同 URL reload、面板冷启动与 worker 重启场景。
4. **增加“扩展→本机 API”独立验收。** 普通网页 CORS、扩展 host 权限、服务端 Origin 校验不是同一件事。记录实际 header、预检与本地网络策略；禁止把服务端 curl/fetch200 当完整成功。
5. **Phase0 `/api/ai/summary` 不冻结为正式主接口。** 后续 Phase1 将最小 snapshot 映射到 blocks/contentHash 等正式契约，再统一 `/api/ai/respond`；本轮没有提前实现问答、引用或笔记。
6. **加入“不删除式干净重建”。** 新目录无依赖起步 + 新 Chrome Profile 是两个独立条件，均需通过。适配本仓库禁止批量删除的约束。
7. **测试证据增加层级。** compiler/schema、真实HTTP、ChromeAPI加载、原生交互分别记账；Mock 不证明真实 Provider、提示注入防护或答案质量。
8. **保留现有平台边界。** 未来仍需项目维度进度/勾选键和旧 Capstone 回归；当前不要向 capstoneLessons 或29节统计加入 P1–P8，也不要 seed 发布标记。

## 9. 交付、Git 状态与阶段决定

- 源码、lockfile、fixture、README、架构、日志、依赖许可证清单、ZIP 均在本 Spike 目录；未依赖现有平台代码运行。
- 分支仍是 **main**；本轮采用任务书允许的独立目录隔离方式。
- 基础提交 SHA：`d5cb93798e9293fe95033ba92755b7090a3e548f`。
- **本轮无新 commit SHA、未暂存、未提交、未推送。** 不把工作区已有的平台修改归为本轮成果。基线与结束的状态对比见 artifacts 中 worktree 记录。
- 没有运行平台根构建、seed、迁移、发布或部署；没有更改线上业务。没有进行批量删除。
- **进入 P1–P8：不具备条件。** 核心 gate 的实际交互证据缺失；保持 Phase0，按上面复验计划解决阻断后再作 GO 决策。本轮止于该报告和最小技术原型。
