# 真实测试证据分级与本轮回归

固定官方源码：`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。环境 Node v24.16.0，TypeScript 5.9.3；版本/依赖完整清单随各 lab-results.json 留存。本轮复用原断言与固定输入，改审查输出路径；不改变实验期望，不覆盖原课历史证据。所有新 OS 夹具和 node_modules/.cache 临时目录保留，没有执行递归清理。

## A–E 的口径

| 级别 | 实际执行的对象 | 可以支持的结论 | 不能推出 |
|---|---|---|---|
| A | 自制教学子集/普通接口或模拟器 | 子集逻辑和独立参考答案、错误答案识别 | 官方 Cordis/Patch/App Boot 同样运行成功 |
| B | 固定版真实 Cordis，必要时含其 Loader；业务为无外部效果的夹具 | 服务/分发/生命周期、真实 Entry/Fiber 在该输入的行为 | Harness 应用全功能、真实连接、原生 HMR |
| C | 官方局部源码/helper/组件探针 | 真实 Patch/解析组件在该输入的结果 | 完整 Profile 装配或完整应用启动 |
| D | 实际 Harness App Boot / Profile API 路径；每项另标解析、boot、recompose 或 watcher | 指定路径和纯内存本地插件的结果 | 同层所有功能、完整随附应用、原生 HMR 自动通过 |
| E | 完整官方应用集成 | 只有真正执行的端到端目标 | 未运行的外部系统、学习效果与安全认证 |

采用逐例互斥的“最高实际执行对象”分类，避免一个用例同时计 B/C/D。D 不是一个全通过开关；本轮 D 中原生 HMR 始终 NOT_RUN。门闩/ManualClock 是输入/外部资源替身，若分发与回收器为真实 Cordis，仍是 B，不冒称真实墙钟/外部连接。

## 历史与本轮结果对照

| 课 | 历史作者测试 | 本轮最终复验 | 逐例分级（对应 TAP 序号） |
|---|---|---|---|
| H05 | 9/9；类型/擦除、缺依赖、变异另列 | 9/9；strict、TS2345负例、声明擦除、缺依赖与删除 inject 变异均如预期 | A：1–2；B：3–9 |
| H06 | 27/27；变异/两个拒绝子进程另列 | 27/27；strict、TS2769负例/擦除，serial错误答案失败、emit/bail拒绝进程退出1如预期 | B：1–27 |
| H07 | 24/24；遗漏 clearInterval 变异另列 | 24/24；strict、TS2345负例/擦除、泄漏变异失败如预期 | B：1–24 |
| H08 | 20/20；深合并变异另列 | 修正审查输出目录后20/20；原深合并变异仍非零 | A：1–2；B：7–9；C：3–6、14、16；D：10–13、15、17–20 |
| 本轮新探针 | 原先没有 | 4/4 | B：初始校验 vs ACTIVE更新、依赖跨加载/失去/恢复、服务域、Waterfall+卸载在途工作 |

按级别可复算为 A 4项、B 65项（含新增4）、C 6项、D 9项；**这组数量不是“完整 Harness 验收通过数”**。E 未执行，不计0失败或0通过。类型负例、预期拒绝、变异不是额外正向 PASS 用例；同一用例多断言不增计数。

## D 级实际深度

| H08序号 | 真实路径 | 已验证限制 |
|---|---|---|
| 10 | boot + recomposeProfile，缺服务/应用后失败 | 新 FAILED config 可保留；不是原生 HMR |
| 11 | boot requiredIds | 必需服务 PENDING 拒绝启动 |
| 12 | boot 可选缺模块与好兄弟 | 错模块不等于所有兄弟停掉 |
| 13 | boot 根 Include.refresh | 坏/空YAML保树后合法恢复；不是 watcher 自动投递 |
| 15 | 五个官方 Profile 的全部声明 Patch 文件解析 | **PARSE_ONLY**；没有启动 Web/Headless/SDK/ACP/minimal 默认应用 |
| 17 | 磁盘自定义 Profile→两 Bundle 文件→用户/Home/overlay→boot/recompose | 本地纯内存 Provider/Consumer，无真实模型/网络 |
| 18 | loadProfileDirectory 的坏Bundle/坏用户Patch | 解析错误分支；不声称进入完整应用 |
| 19 | 真实boot后 Schema 更新拒绝 | raw新/effective旧/service旧；官方同类测试只选读 |
| 20 | recomposeProfile requiredIds | 已应用后 PENDING 导致拒绝但条目仍可保留 |

原生 HMR 文件通知、模块预导入/替换/恢复的实际运行：NOT_RUN。完整官方应用与官方 Vitest 套件：NOT_RUN。模型、凭据、OS沙箱、真实连接、磁盘恢复、线上媒体/权限/进度：NOT_RUN。学习时间/理解/评分一致性、独立外审：PENDING。本轮没有要求用户运行有较高权限的 Agent。

## 日志入口与复现

- H05：[lab-tests](evidence/h05/evidence/lab-tests.txt)、[lab-results](evidence/h05/evidence/lab-results.json)。
- H06：[lab-tests](evidence/h06/evidence/lab-tests.txt)、[lab-results](evidence/h06/evidence/lab-results.json)。
- H07：[lab-tests](evidence/h07/evidence/lab-tests.txt)、[lab-results](evidence/h07/evidence/lab-results.json)。
- H08最终：[lab-tests](evidence/retry-h08/h08/evidence/lab-tests.txt)、[lab-results](evidence/retry-h08/h08/evidence/lab-results.json)、[五模板解析](evidence/retry-h08/h08/evidence/official-profiles.json)。
- 新增：[探针TAP](evidence/cross-course-module-two-probe-b6e8yjaq.tap)、[运行命令/级别](evidence/cross-course-module-two-probe-b6e8yjaq.json)、[探针源](probes/cross-course.test.ts)。
- 既有 Renderer：[9项](evidence/only-h07-final/renderer-tests.tap)。实际挂载/三宽度各课见 figures-review.md。
- 复用脚本及导出：run-record-labs.json、retry-h08/run-record-labs.json、run-record-content.json、only-h07-final/run-record-content.json、run-record-visual.json、only-h07-final/run-record-visual.json。包含原脚本 SHA、适配后 SHA、命令、退出值和保留目录。

在已准备的本机固定源码/依赖环境，仓库根可依次运行 `python docs/deepseek-harness-v2/module-two-review/scripts/run-audit.py labs 新的运行标签`、content/visual 对应阶段，再运行 run-probes.py。新运行应使用新标签，保留旧日志；render-masters.mjs 会重新导出13图，只允许覆盖 h07-01，其他12图须字节相同。源码缓存和依赖锚点记录在锁定清单；不是要求普通学员在日常工作环境安装完整应用。

## 本轮真实失败记录

第一次集中实验 H08 #15 已正确执行解析，但子进程报告路径的父目录尚未创建，出现 ENOENT，结果19/20；[失败原日志](evidence/h08/run-labs.txt)与其 lab-tests.txt 保留。为审查 runner 预建输出目录后只重跑 H08，20/20；未改课程/官方实现或断言。

新增 H07 链接首次写为763–784，被静态范围检查发现末行越出783行文件；修正为实际 update 的764–782，重新生成 H07 预览、内容/Renderer与三宽度。该夹具/编辑过程记录在 revisions.md，不把首次错误删成“从未失败”。
