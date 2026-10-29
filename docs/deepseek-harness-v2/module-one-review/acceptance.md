# 修订后自动验收记录

日期：2026-10-29。本轮结果以 [validation.json](evidence/validation.json) 及当前文件哈希为准。历史各课报告不重写为本轮状态。

| 检查 | 实际结果与覆盖 | 不可推出的结论 |
| --- | --- | --- |
| 四课独立实验 | H01 7、H02 8、H03 10、H04 12，共37项通过；各单文件 self-test 另重跑 | 不是完整 Harness 或真实 API 测试 |
| 现有 Renderer | 9项回归通过；各课真实 parser/SSR，完整程序/答案与文件同步，全局任务键保留唯一 | 未接线上课程、权限、进度或媒体 |
| 当前引用完整性 | 172 个逐课正文范围，114 条已有断言，91 个文件的固定 Git blob/行界限；补核审查文档链接、原断言测试与原索引文件哈希 | 静态通过不是语义自动证明，分支与官方断言选读另见 source-review.md |
| AST 辅助 | H03 6项、H04 5项结构/顺序定位，新类/成员归属2项，共13项 | 不代表遍历了所有路径；实参求值、条件与回调仍需语义审阅 |
| 真实源码 helper | H03 流/会话4项，H04 参数/组合/隔离环境10项，共14项 | 没运行 boot/runProfile、完整应用、flush、真实握手或安全隔离 |
| 图源/成图 | 12图重新渲染，与原正式 PNG 逐哈希一致；字体、边界、重叠检查通过 | 几何检查不理解图义；12图已另实际看图 |
| 四课阅读与交互 | 4课×3宽度；每宽度检查3图 decode/alt/图注、唯一H1、默认折叠、键盘、完整代码复制、适用JSON复制、代码横滚、实际原图弹页、静态阅读预览，无页面横溢 | 不代表所有用户尤其低视力读者都舒适；未实际人工遍看每张截图 |
| 模块测验 | 12题/100分，12折叠答案；三宽度实际键盘开合、答案/评分内容与页面宽度检查通过 | 不自动评自由答案，未校准分值、阈值、学习效果 |
| 原文件保护 | 1856个原跟踪文件只允许4正文+4预览变化，其余1848个及915个原 output 文件哈希一致；目录新增/缺失也检查 | 不覆盖或自动处理其他并行工作 |
| 提交边界 | 仅八项必要修订及 module-one-review 新文件；最终暂存范围与提交另核 | 无线上发布、平台/数据库/价格/权限变更 |

原 Node 输出文件沿用 `.tap` 扩展名，但本机默认 reporter 为 spec 文本，不能当严格 TAP 协议解析；日志保留原样，验收按实际 tests/pass/fail/skipped 字段读取。四课渲染完整阶段成功后，因新 runner 的 helper 输出重定向错误，仅重跑受影响 helper 阶段，见 run-record.json 和 revisions.md。没有改课程实验/上游代码来适配失败。

## 复查命令

在 AI Foundry 根目录运行，先核固定源码缓存与 H04 原隔离 probe 依赖仍存在；不在 AI Foundry 根安装 Harness 依赖。QA 要求本机现有 Playwright 与 Chrome；可用 `AIFOUNDRY_QA_NODE_MODULES`、`AIFOUNDRY_QA_CHROME` 指定已有位置。

```powershell
python -X utf8 docs/deepseek-harness-v2/module-one-review/scripts/check-source.py
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/module-one-review/scripts/check-members.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/module-one-review/scripts/metrics.ts
python -X utf8 docs/deepseek-harness-v2/module-one-review/scripts/run-audit.py
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/module-one-review/scripts/assessment-preview.tsx
python -X utf8 docs/deepseek-harness-v2/module-one-review/scripts/check-preview-sync.py
python -X utf8 docs/deepseek-harness-v2/module-one-review/scripts/validate-review.py
```

run-audit 重用原课实际组件、CSS、验证逻辑，只把派生脚本的导入/根与证据输出转到审查位置；重新生成四份允许修订的预览。临时文件在 node_modules/.cache 和 OS 临时夹具保留，不递归删除。probe 的固定外部依赖、来源与 integrity 仍使用 H04 原 manifest 和上游同 Commit lock；未执行新的安装脚本。`--helpers-only` 用于仅复查 helper。

最后的保护门禁故意绑定本轮初始快照，未来用户改了其他文件会要求核查差异，不应改旧快照求通过。整站 build/发布型内容检查可能写目录或 ZIP，本轮平台无改动，采用既有 Renderer 和限定作者门禁，不运行发布工序。

未验证：真实学员效果与时长、评分者一致性、独立技术/教学外审；完整官方套件和构建、真实 Provider/网络/SDK/ACP、OS 沙箱、原生 HMR、磁盘恢复与线上鉴权/进度。状态保留 PENDING/NOT_RUN，不转换成 PASS。
