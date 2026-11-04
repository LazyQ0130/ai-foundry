# H22 · Workflow、Jobs、Goal 与任务调度

内部正式研发稿；未发布、未接目录。正式标题及四种生命周期目标遵循30讲蓝图，Workflow为本次任务的实验主线。固定DeepSeek Harness Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Harness `0.2.2-alpha.2`，Cordis `4.0.6-alpha.1`。

- [正式正文](../../../course-content/internal/deepseek-harness/h22/lesson.md)；[静态阅读预览](reading-preview.html)。
- [质量结论](quality-review.md)；[分项覆盖](coverage-matrix.md)；[46条源码断言](source-checklist.md)。
- [准备及范围](preparation.md)；[H21衔接](knowledge-bridge.md)；[H23前置交接](h23-handoff.md)。
- [差异与失败历史](discrepancies.md)；[Renderer与视觉](renderer-regression.md)。
- [原始测试](evidence/lab-tests.txt)；[行为轨迹](evidence/behavior-traces.json)；[最终范围保护](evidence/validation.json)。

23项有效执行=C19/D4，12项既有Renderer回归、三宽度与11份完整代码复制通过。综合X复用D1，demo/历史重跑不叠加；Cordis等必要依赖不另算B。作者结论 **CONDITIONAL GO**：真实外部Provider、E级完整应用、目标学员试读、实测时长及独立外审仍待验证。实际清理、写入拒绝等仅限列明本地条件。

## 复现

在仓库根目录运行，安装本仓库开发依赖的工作目录应已就绪；不变更业务package文件。需要Node 24、Python3、固定源码缓存与隔离依赖锚点。默认Windows路径和完整准备见[实验README](../../../course-content/internal/deepseek-harness/h22/lab/README.md)。`run-labs.mjs`先核源码Git blob/SHA256锁，再验证全部直接/传递依赖的name+version+integrity；不符即拒绝。

```powershell
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs A
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs B
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs C
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs D
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs X
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs boundaries
node docs/deepseek-harness-v2/h22/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h22/scripts/final-audit.py
```

整套run-checks重建源码断言/链接、程序同步、原生实验、图源、SSR预览、内容统计、现有Renderer及三宽度交互。`evidence-index.py`只汇整当前原始记录；人工看图另记。最后审计要求人工样本hash仍匹配，若重新生成图，应重新查看并更新人工记录，不能用自动几何检查代签。

final-audit.py 是作者原研发工作区的范围保护审计，依赖当时4963文件及原有用户改动快照；移植机器应重建自己的研发前快照，不能把原快照当作可移植课程测试。学员实践使用run-labs入口。

正式NodePtcRuntime与Windows ACL runner由固定源码esbuild打包到新临时根；使用正式受限令牌执行，read-only、partial enforcement，无unrestricted回退。动态ffi所需koffi用新scratch下junction指向验证过的既有隔离依赖，不复制/删除依赖树。目录、文件与junction全部保留。Linux/macOS读者需另配正式受限后端并重新验收；本套入口的runner实测限Windows。

静态HTML来自当前LessonMarkdown SSR+平台CSS，移除无事件绑定的复制按钮，图相对映射；实际React页面的复制等交互在localhost私有夹具核验。`/course-media`只在作者QA映射，没有写入public或在线素材服务；打开HTML不代表产品课程已上线。

本次仅H22两个目录进入提交。保留H01–H21、五模块审查、历史证据、output及所有原有用户改动。未改课程路由、数据库、价格、权益或发布状态；完成后停止，不开发H23、不作第六模块审查。
