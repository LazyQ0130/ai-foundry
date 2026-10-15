# AI 网页阅读与知识整理助手：Phase 0 Spike

**Phase0技术闸门GO：12 PASS / 0 FAIL / 0 BLOCKED。扩展0.0.2未发布，P1–P8未开始。** 本工程保留WXT/React/Express最小原型，仅验证读取网页、接收原生右键选区和本机Mock。最终结果包括实际Chrome人工操作与明确文字确认，不只依据类型检查。

- [最终技术验证报告](docs/evidence.md)：逐项状态/证据、架构、修复、风险、蓝图建议和进入后续研发的条件。
- [已填验收记录](docs/manual-acceptance-record.md)、[架构决策](docs/decisions.md)、[蓝图调整建议](docs/blueprint-adjustments-phase0.md)。
- [Windows复现指南](docs/manual-chrome-acceptance.md)、[最后合并实测步骤](docs/manual-final-smoke.md)；[空白模板](docs/manual-results-template.md)用于未来新一轮记录，不代表当前待执行。

## 环境与重建

实测Windows11、Chrome155.0.8059.41、Node24.16.0/npm11.13.0；WXT0.21.4、React18.3.1、TS5.9.3、Express5.2.1、Zod4.6.5。Spike使用独立lockfile，Node声明>=22。manifest的Chrome116下限未实测，不能据此保证所有116+版本兼容。

需要重建时，在本目录执行：

```powershell
Set-Location -LiteralPath 'C:\Users\QYF\Desktop\AIFoundry\spikes\ai-browser-copilot-spike'
npm ci
npm run typecheck
npm test
npm run build
npm run zip
```

实际记录为5个文件44项测试、新目录ci/typecheck/test/build/zip成功。`scripts/rebuild.ps1`复制明确源文件到新目录重建并保留旧目录，不递归删除；详见报告。最终收尾仅改文档/核验证据，没有覆盖用户已验收的包。

## 加载与本机Mock

在Chrome开发者模式中加载`.output/chrome-mv3`，实际manifest版本应为0.0.2。归档ZIP：[ai-browser-copilot-phase0-0.0.2-chrome.zip](docs/artifacts/worker-lifecycle-fix/ai-browser-copilot-phase0-0.0.2-chrome.zip)。

```text
SHA256 c42d91517699e4d4335c3c8bc8330e227a987d48ee7551026c45d9b8b18f6bab
```

确认扩展卡片/侧栏ID后启动API。以下ID是本轮实测值；其他机器/加载目录应使用本机实际ID：

```powershell
$env:EXTENSION_ORIGIN='chrome-extension://hijkflihajcoealnhjnepmgabohaimcn'
$env:PROVIDER='mock'
npm run api
```

仅监听127.0.0.1:8787。`api/.env.example`是样例，不自动加载；不读取主站.env，不需要数据库或API Key。点击工具栏A打开原生侧栏并授权当前普通HTTPS页，再读取、Mock；划词后在选中文字上右键发送，再点接收。遇到真实错误按复现指南收集Console/Network/版本信息，不放宽权限。

## 权限、状态与边界

权限仅activeTab、scripting、sidePanel、contextMenus、storage；无host_permissions、全站matches、常驻Content Script或popup。Chrome155实测本机API可在精确扩展Origin CORS和固定CSP下访问，新增host权限为0；其他版本/策略需另验。

普通action回调同步打开Side Panel；Side Panel按钮不产生新activeTab。正文6000字符；选区2000字符、60秒有效、一次消费；导航代次在storage.session跨正常worker重建恢复，真实上下文变化仍失效。session临时选区不是持久笔记，使用TTL不代表定时物理删除。

Mock只验证通路；真实Provider、问答/引用质量、笔记/RAG/云同步未实现，未测试真模型或产生模型费用。Origin不是公网鉴权，本机演示API不能直接作为公众服务。PDF、复杂SPA/Shadow DOM、iframe等不在本轮已验证范围。正式产品与课程发布另有未来验收，不由Phase0 GO代替。

## 自动验证工具

- `npm test`：真实HTTP/API客户端测试及Chrome适配器替身回归，44项；不替代原生工具栏/右键验收。
- `npm run test:network`：独立无界面Chrome实际网络与受控DOM探针，端口8787须空闲；不模拟用户grant或原生侧栏。
- `npm run test:worker-lifecycle`：真实Chrome worker停止/唤醒与storage.session，tab/scripting为夹具；默认新证据目录，保留旧材料。
- `npm run api:fault`：仅QA，SPIKE_FAULT=delay/timeout/invalid-provider；切换前停止原服务，完成后恢复普通Mock。
- `python scripts/audit-package.py docs/artifacts/worker-lifecycle-fix`：审查最终归档ZIP。

本轮改动只在此Spike；main分支，未commit/暂存/推送/部署，无批量删除。主仓库已有未提交修改保留；Stage1–4、Capstone、数据库、权益、线上业务和发布状态未改。工作停止在Phase0最终报告，不自行进入P1–P8。
