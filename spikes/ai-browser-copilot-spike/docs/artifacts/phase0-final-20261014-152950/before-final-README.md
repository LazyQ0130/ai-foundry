# AI 网页阅读与知识整理助手：Phase 0 Spike

**NO-GO，待真实 Chrome 人工验收；未发布，不进入 P1–P8。** 本工程保留上一轮 WXT/React/Express 最小原型，只包含读取页面、接收右键选区、调用本机 Mock 三个操作。正式课程、Capstone、数据库和权益未接入。

先读 [Windows + Chrome 人工验收指南](docs/manual-chrome-acceptance.md)，结果填写 [人工记录模板](docs/manual-results-template.md)。当前 [技术报告](docs/evidence.md) 和 [架构/权限决策](docs/decisions.md) 区分真实 HTTP、无界面 Chrome、测试替身和原生人工交互证据；上一轮报告保留为 `docs/evidence-round1.md`。

## 当前修复包0.0.2

普通worker休眠不能使未变网页快照失效。现将匿名contextToken存入storage.session，保留真实切页/刷新拒绝与选区TTL；44项测试和真实Chrome生命周期对照已通过，用户已人工文字确认原生Mock与45秒空闲后重复调用均成功；其余测试仍待完成。现有用户重新加载扩展到0.0.2，再点A、重新读取、Mock；成功后停留45秒再试一次Mock。

## 先前修复包0.0.1

旧版自动Side Panel action跳过activeTab grant，已改为普通chrome.action.onClicked同步打开面板。现有用户在chrome://extensions点本扩展重新加载箭头，确认0.0.1后再回网页点A图标读取。37项测试和真实Chrome启动配置已验证，用户0.0.1原生读取复验也已PASS；跨源撤权、右键、Mock等仍未通过全部验收。0.0.1旧包保留；当前包见docs/artifacts/worker-lifecycle-fix/ai-browser-copilot-phase0-0.0.2-chrome.zip。

## 运行

在本目录执行（勿在主仓库根目录安装扩展依赖）：

```powershell
npm ci
npm run typecheck
npm test
npm run build
npm run zip
```

已验证 Windows、Node24.16.0、npm11.13.0、WXT0.21.4；Node要求>=22，与主站Node20.19下限不同。Chrome实际验证155.0.8059.41，manifest声明116下限，116本身未测。

加载 `.output/chrome-mv3`，不要加载ZIP。当前交付ZIP见 `docs/artifacts/worker-lifecycle-fix/ai-browser-copilot-phase0-0.0.2-chrome.zip`，旧包保留在round2。从实际Chrome卡片取得扩展ID，在另一个PowerShell设置：

```powershell
$env:EXTENSION_ORIGIN='chrome-extension://替换为实际32位扩展ID'
$env:PROVIDER='mock'
npm run api
```

只监听127.0.0.1:8787。`api/.env.example` 是模板，不会自动加载。无模型Key，不读主站.env。点击工具栏打开真正Side Panel后，先授权读取，再点击Mock；详细成功与失败步骤均在人工指南。

## 自动验证与边界

- `npm test`：44项（5个文件），只收集tests目录，避免.runtime旧副本重复计数。涵盖真实HTTP边界/客户端故障，以及Chrome适配器替身的消息、选区和导航竞态。替身测试不能证明Chrome原生行为。
- `npm run test:network`：已安装Chrome的独立无界面Profile，测试真实扩展worker/文档到本机API的CORS、未授权注入拒绝及受控DOM抽取。无图标/右键模拟，不作为真实Side Panel验收；端口8787须空闲。保留Profile与每次独立证据目录，不递归清理。
- `./scripts/rebuild.ps1`：复制明确源文件到新目录，从无依赖/产物起步，完成ci/typecheck/test/build/zip；日志默认写入新的时间戳目录。可设置 `$env:EVIDENCE_DIR='docs/artifacts/某个新目录'`。不删除文件。
- `npm run api:fault`：仅人工测试夹具；设置SPIKE_FAULT=delay、timeout或invalid-provider，复用原API安全边界。切换前先Ctrl+C停止原服务；测试后恢复普通`npm run api`。
- `python scripts/audit-package.py docs/artifacts/toolbar-grant-fix`：审查该目录实际ZIP。原始证据保留在上一轮artifacts与本轮round2中。

`npm run test:worker-lifecycle` 使用独立夹具扩展验证真实Chrome后台终止/唤醒与session恢复；tab/scripting是固定适配器，不证明原生授权或用户网页摘要。

## 权限与限制

仅activeTab、scripting、sidePanel、contextMenus、storage，无host_permissions、全站权限、常驻Content Script或popup。**Chrome155的真实扩展网络测试已证明：在本API精确CORS配置下，无额外host权限也能访问127.0.0.1:8787。** 这不是跨源豁免，而是普通CORS：实际收到扩展Origin、OPTIONS和POST，服务只放行配置的扩展ID。CSP另将网络目的地限制到该端口，fetch禁止跳转、显式不带credentials。其他版本/策略和真正侧栏仍需人工验证。

页面只以顶层只读函数提取纯文本（6000字符），不读表单、隐藏节点和iframe。Panel→runtime→Background→scripting结果回传，没有网页到后台的任意指令桥；Content Script/tab伪造消息会被拒绝。

后台使用导航代次contextToken及前后tab/URL复查；切页/刷新使旧快照失效，普通worker休眠会从session恢复未变页面代次。选区限2000字符、60秒、窗口内串行一次消费；session只临时暂存，未持久保存网页历史。Panel在fetch前后检查快照代次，切页取消请求并丢弃旧响应。原生竞态仍待人工验收。

Mock只演示通路。无完整聊天、笔记、RAG、登录、云服务、真实Provider或收费调用。Origin不是公网鉴权；不得将本机教学API直接公开部署。PDF、深层ShadowDOM、iframe及登录墙不在本轮范围。

本轮所有改动限于此Spike。main分支下本地文件，未提交、推送或发布；保留主仓库已有工作区改动。
