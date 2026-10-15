# AI Foundry 项目工坊｜AI 网页阅读与知识整理助手

## Phase 0：技术可行性验证任务书（供 Codex 执行）

> 状态：**待执行，尚未通过任何验证**  
> 日期：2026-10-14  
> 对外产品名称：**AI 网页阅读与知识整理助手**  
> 内部工程代号：`browser-copilot` / `ai-browser-copilot`  
> 平台参考仓库：https://github.com/LazyQ0130/ai-foundry  
> 阶段目标：用最小的真实浏览器扩展验证关键技术，不开发完整产品、不提前写 P1–P8 正文。

## 1. 给 Codex 的工作指令

你是一名负责教学项目可运行性验证的全栈工程师。请先阅读本仓库当前的 README、技术规范与 Project Lab/Capstone 组织方式；课程展示名称统一使用「AI 网页阅读与知识整理助手」，不要在学员界面使用「AI 浏览器副驾驶」作为正式名称。内部 `browser-copilot` 代码命名允许保留。

**只实施 Phase 0 技术 Spike**，验证浏览器扩展的关键运行路径，并留下可重复的证据。不得为了展示效果提前开发完整 UI、知识库、登录系统、Agent 或云端服务。不得直接修改现有 Stage、Capstone 的课程内容、授权、生产数据和发布标记。优先把 Spike 放在隔离的工作分支/独立目录；如缺乏权限，输出实现文件及待应用说明，不要冒充推送成功。

技术基线：Chrome **116+**、Manifest V3、WXT、TypeScript，侧栏使用 React；本地服务使用 Node.js + Express（只绑定回环地址）。确定 Node/npm/WXT 版本后记录可复现的 lockfile；不要未经验证将具体版本写死在课程教材中。对依赖许可证与样例代码来源做简短记录。

## 2. Spike 必须验证的五条主路径

### S0-1. 扩展加载、侧边栏触发

- WXT 构建 Chrome Manifest V3 扩展；不使用 `action.default_popup` 抢占图标点击事件。
- 浏览器工具栏的扩展图标能够打开 Side Panel；重开浏览器也能再次打开。
- 至少保留一张真实浏览器截图和浏览器版本、打包日志。
- **反例：** 点击无反应、只有 popup、sidepanel 路径错误、MV3 background 构建失败。

### S0-2. 当前页临时授权与正文读取

- 初版仅配置必要权限（建议检验 `activeTab`, `scripting`, `sidePanel`, `contextMenus`, `storage`），不添加 `<all_urls>`、`https://*/*` 等永久广泛 host permissions。
- 用户从浏览器工具栏主动触发扩展后，在当前普通 HTTPS 页面中通过 `chrome.scripting.executeScript` 读取页面标题、URL 和可见文本前若干字符，返回 Side Panel。
- 验证 `activeTab` 授权在 Side Panel 中点击读取是否仍生效；必要时通过消息传递给后台协调执行。**此项必须实测，不得仅凭文档猜测。**
- 验证新标签页、跨源导航、`chrome://` 内部页与已撤销授权时的失败反馈。
- 页面正文和网址是**不可信用户数据**，不能当作扩展指令执行。

### S0-3. 划词与右键菜单

- 在普通网页选中文本并点击扩展注册的右键菜单项。
- `selectionText` 经后台消息安全传给侧边栏（必要时由右键用户动作打开面板）。
- 当没有选中文本、选中内容超出阈值或 tab 已变化时，拒绝或提示用户重新选择，不误用旧选区。
- 至少测试两种不同站点和同一窗口不同标签页。

### S0-4. 本地模型代理与 Mock

- 独立 Node.js/Express API 仅绑定 `127.0.0.1`，例如开发端口 `8787`；提供 `/health` 和 `/api/ai/summary` 演示路由。
- 默认用 **Mock Provider** 返回可预测摘要，完成扩展 → 本地服务 → 扩展的真实网络链路；禁止在无明确授权的测试中产生模型费用。
- 真模型 Provider 可以只做可替换接口与环境变量样例，若需要测试真模型则明确区分成功/未测；`.env` 和任何 API Key 不得出现在插件 bundle、repo、日志或截图。
- 校验输入长度、跨源请求来源、超时与错误码。**不把本地演示代理暴露到公网**。

### S0-5. 干净环境重建与打包

- 清理构建产物后安装依赖，完成 `typecheck`、`test`、`build`（以实际脚本为准），生成浏览器可加载的 MV3 文件夹与 ZIP。
- 使用一个干净 Chrome Profile 再次加载、点击图标、读取网页、划词、调用 Mock API。
- 在 README 中写下系统要求、启动命令、加载路径、权限说明、限制与最小复现操作。

## 3. 建议的最小目录（按 WXT 官方规范调整）

```text
ai-browser-copilot-spike/
├── extension/
│   ├── entrypoints/
│   │   ├── background.ts
│   │   └── sidepanel/...
│   ├── src/contracts/   # 用 TS/Zod 固定消息格式
│   └── wxt.config.ts
├── api/
│   ├── src/server.ts
│   └── src/provider/mock.ts
├── tests/fixtures/      # 静态测试网页和示例选区
├── docs/
│   ├── decisions.md     # 实际依赖版本与授权策略
│   └── evidence.md      # 实测环境、命令、截图路径和结果
└── README.md
```

## 4. 必须记录的证据矩阵

| 编号 | 场景 | 期望结果 | 验收状态（实际执行时填写） |
|---|---|---|---|
| SP-01 | 干净环境安装 MV3 插件 | 插件加载无报错 | NOT RUN |
| SP-02 | 点击工具栏图标 | Side Panel 正常打开 | NOT RUN |
| SP-03 | 授权后读取普通网页 | 标题、URL、文本与当前页一致 | NOT RUN |
| SP-04 | 无授权或跨域导航后读取 | 提示重新授权，不偷偷扩大权限 | NOT RUN |
| SP-05 | 切换标签页且旧请求返回 | 旧页面结果不能覆盖新页面 | NOT RUN |
| SP-06 | 在两个网站划词右键 | 内容进入侧边栏且 tab 归属正确 | NOT RUN |
| SP-07 | 空选区、超长选区、失效 tab | 明确失败，不误用历史数据 | NOT RUN |
| SP-08 | Mock AI API 正常响应 | 页面数据可往返 | NOT RUN |
| SP-09 | API 关闭、超时、非法响应 | UI 有反馈，不无限等待 | NOT RUN |
| SP-10 | 检查 manifest 与打包文件 | 无全站永久读取权限，无 API Key | NOT RUN |
| SP-11 | Chrome 内部页/禁止注入页 | 安全失败，不致扩展崩溃 | NOT RUN |
| SP-12 | 干净 Profile 完整复验 | 按 README 可以重现 | NOT RUN |

每项需要记录 **PASS / FAIL / BLOCKED**，附证据文件、命令和简短分析。`NOT RUN` 不得伪装成 `PASS`。任何实际尚未测试的 API 行为，必须标明“待验证”。

## 5. Phase 0 交付物

1. 可独立运行的 WXT Spike 源码、锁文件与最小测试网页。
2. Mock API、环境变量模板、无密钥泄露的测试记录。
3. `docs/evidence.md`：真实 Chrome 版本、各 SP 测试状态、截图、日志、失败原因。
4. `docs/decisions.md`：权限链路选择、Chrome 版本、消息路径、通信和注入边界、放弃的方案。
5. **GO / NO-GO** 结论：哪些路径真实通过、哪些仍阻断，是否足以开始正式 P1–P8 课程研发。
6. 如实际改动了代码，清楚列出分支、提交 SHA、推送状态；未经允许不修改生产业务、不发布课程。

## 6. 明确不做

本阶段不开发完整 AI 聊天界面，不加入跨网页记忆、RAG、登录、云端同步、自动网页操作，不接入生产 AI Foundry 权限系统，不修改购买价格，不开放付费学员课程，也不购买新服务或产生额外第三方费用。

## 7. GO / NO-GO 标准

GO 仅当 SP-01、02、03、04、06、08、10、12 全部 PASS，且关键权限模型与消息归属在实测中成立。其余测试失败需要说明风险并确定修复计划；涉及密钥、跨标签页内容泄漏、永久全站权限的问题必须解决后才可 GO。否则 NO-GO，并提出具体替代方案和复验计划。

## 8. 参考依据

- WXT 入口官方文档：https://wxt.dev/guide/essentials/entrypoints
- Chrome Side Panel：https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Chrome activeTab：https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- Chrome scripting：https://developer.chrome.com/docs/extensions/reference/api/scripting
- Chrome contextMenus：https://developer.chrome.com/docs/extensions/reference/api/contextMenus
- Chrome storage：https://developer.chrome.com/docs/extensions/reference/api/storage

---

**当前状态声明：** 这是交给开发代理执行的技术验证任务书，*不是*测试通过报告。AI Foundry 正式课、现有 Capstone 和线上权限均未修改。
