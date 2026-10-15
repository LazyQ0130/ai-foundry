# P1 验收矩阵

2026-10-14，当前：**19 PASS / 0 未解决FAIL / 1 BLOCKED（原生操作待人工）**。这是P1自己的闸门，不影响Phase0 GO。PASS仅覆盖该行声明的证据等级。

证据根：[artifacts/p1-20261014](artifacts/p1-20261014)。自动脚本、控制台/HTTP、真实Chrome headless、原生人工四种来源分别标注。Headless的普通扩展文档不是原生SidePanel。

| ID | 验收项 | 状态 | 等级与结果/证据 |
|---|---|---|---|
| P1-01 | 版本与独立运行环境 | PASS | Node24.16.0/npm11.13.0，独立目录CLI；两个final-package-ci.txt及构建日志中的WXT0.21.4 |
| P1-02 | 锁文件与Phase0版本一致 | PASS | 自动；lock-provenance.json、delivery-audit.json：170个非根lock条目version/integrity相同，两份lock完全一致 |
| P1-03 | Starter新目录安装 | PASS | 真实npm ci；starter-final-package-ci.txt，含prepare；不是使用作者的node_modules；另在仓库外TEMP完成*-external-ci.txt复验 |
| P1-04 | Reference新目录安装 | PASS | 真实npm ci；reference-final-package-ci.txt与reference-external-ci.txt |
| P1-05 | Starter开发环境启动 | PASS | 实际CLI/HTTP；starter-dev.txt、dev-and-recovery.json；TODO未完成时不要求工具栏工作 |
| P1-06 | Reference开发启动与更新 | PASS | 实际CLI+HTTP+Chrome155 headless扩展文档；reference-dev.txt、reference-dev-update-extension-document.png；修改恢复均观察到，不含原生侧栏 |
| P1-07 | 生产Manifest最小权限 | PASS | 自动产物检查+真实chrome.permissions：仅sidePanel、无host/popup/content_scripts；*-production-manifest.json、chrome-headless-integration.json |
| P1-08 | Chrome MV3加载与后台配置 | PASS | 真实Chrome155 headless CDP测试安装；Reference action listener存在，getPanelBehavior=false；Starter无listener是预期；chrome-headless-integration.json |
| P1-09 | React渲染与交互 | PASS | 真实Chrome扩展文档DOM点击，Reference确认成功，Starter按钮禁用；390/520宽度无溢出，无未处理pageerror；同JSON与extension-document截图 |
| P1-10 | 两份类型检查与生产构建 | PASS | 真实CLI；*-final-package-typecheck.txt、*-final-package-build.txt；构建来自最终ZIP的新解压目录 |
| P1-11 | 源码ZIP重装及产物一致 | PASS | 两个最终ZIP各13文件，新目录npm ci/typecheck/build；scope-and-reinstall-check.json：各5个生产文件与交付扩展ZIP逐字节一致；reference-wxt-zip.txt验证原生命令打包 |
| P1-12 | 失败与恢复 | PASS | 实际TS2322→exit2→修复exit0、端口3080冲突exit1→停旧服务恢复；type-error-and-recovery.json、dev-port-conflict.txt、dev-and-recovery.json；离线缺包转联网成功也留原始日志 |
| P1-13 | Lesson Renderer V2正文 | PASS | 实际解析器/渲染器；8任务、4Prompt、与39份正式正文无key冲突；现有9个渲染单测通过；实际Chrome本地预览1440/390、Prompt复制、DeepDive与任务勾选通过；不是生产路由/持久化验收 |
| P1-14 | 交付安全与三层区分 | PASS | 白名单13源文件，ZIP与源码一致，未带Key/.env/Profile/开发机绝对路径；Starter/Reference只有三文件差异；delivery-audit.json |
| P1-15 | Phase0保护 | PASS | 273份Phase0非生成源码/证据哈希不变，含原报告/ZIP；scope-and-reinstall-check.json |
| P1-16 | 工具栏→原生SidePanel→确认 | PASS | 人工：用户明确确认工具栏关闭重开、确认按钮成功；此前提供确认成功截图；manual-20261014-163826/user-evidence.json。原生操作由用户执行，非作者自动化 |
| P1-17 | 原生SidePanel开发更新与恢复 | PASS | 人工：改动前后截图+用户明确确认原文恢复；验收副本App与最终源码ZIP只读比对结果见manual-20261014-163826/user-evidence.json |
| P1-18 | 停dev后的生产版原生入口 | PASS | 人工：用户明确确认“停 dev 后生产版打开、确认都成功”；manual-20261014-164023/user-evidence.json。未推断全新Profile已通过 |
| P1-19 | 全新Profile加载、关闭重开 | BLOCKED | 未用Phase0结果替代；人工指南B后半组，需要真的独立窗口执行 |
| P1-20 | 排除工作区其他改动 | PASS | ZIP显式白名单，写入限三个新根和.runtime，无staging/commit/push。基线监测发现4个任务外文件期间变化，保留未回退、未混入交付；scope-and-reinstall-check.json，详见报告 |

## 已修复问题与历史证据

- 离线npm缓存缺yargs-parser tarball：原starter-ci.txt/reference-ci.txt保留，两个全新目录联网按锁安装成功；未清空失败目录。
- dev监听host与生成origin不同：attempt2保留localhost产物现象，最终显式origin回环；最终development-manifest.json仅含回环host。
- WXT root缺package元数据导致zip名undefined：reference-wxt-zip-before-root-fix.txt；最终root为项目/srcDir为extension，命令zip恢复正常。
- 作者QA第一轮把无aria-pressed的禁用完成按钮也选中：chrome-headless-integration-attempt1.json是**测试选择器错误**，修复为8个明确button[aria-pressed]后通过，未修改平台组件。
- 作者dev HTTP探针首轮误请求非服务端产物路径sidepanel.html：dev-and-recovery-attempt1.json；改用/@vite/client后继续。该次不是WXT构建失败。

没有把上述历史FAIL覆盖成“从未失败”；当前未解决的是P1-19全新Profile安装与关闭重开BLOCKED。[人工指南](p1-manual-chrome.md)将它们合并为A/B两组，收到逐项真实结果后才能更新闸门。

Chrome116兼容性未测、P3真实模型未测、完整产品验收未做，均超出P1本轮通过范围。未接入线上课程/资源/进度，所以不能宣称平台端到端已验收或课程已发布。
