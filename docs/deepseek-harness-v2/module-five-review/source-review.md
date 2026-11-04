# 材料与固定源码审查记录

本轮先读材料及原始证据，再做必要修订和结论，没有仅按H20准备包摘要验收。工作区初始HEAD为`1288733`；[初始保护清单](evidence/workspace-before.json)在正文改动前生成。[材料索引](evidence/material-inventory.json)记录526份相关文本/源码/证据的路径、字节和SHA256；索引数量不代表526个测试或526份独立阅读结论。

## 课程材料阅读范围

|材料|完成的审读方式/用途|
|---|---|
|A-blueprint-v2.md|完整蓝图，按章节分块阅读；核模块边界、H17–20目标与H21–24实际课名/顺序/前置|
|前四模块正式审查|module-one-review/README.md及acceptance/revisions；module-two-review/README.md；module-three-review/review-report.md；module-four-review/review-report.md，连同本轮有关负担/门禁/证据边界|
|当前生产标准|E-production-standard.md、module-one-review/production-standard-v1.md、module-two/three/four-review各production-standard增补，完整并读|
|H17–H20最终正文|四份lesson.md完整讲解、图注、实践、综合、全部思考/参考答案；嵌入完整代码块按同名lab文件另读以避免重复输出，不以此省略程序审查|
|程序与验证|各课全部lab、support/bootstrap/runner、测试定义、源码断言、质量报告；123条原TAP逐项与本轮对齐；66份历史run JSON完整解析exit/命令/输出/错误并保留失败索引，核各不同轨迹与负例|
|16张正式配图|figures.json逐图核SVG语义/正式PNG/引用/图注；重新导出与三宽度界面检查；母版及320宽联系表实际看图|
|H20准备包|README与01–13全部文件；追读引用的四课最终材料、证据、原规划、已知缺口，未把PREP等同正式审查结论|
|H12/H14桥接|规范请求/工具流水线相关正文、批次语义和源码；与H20失败Attempt/取消/结果提交对照，不修改旧课|
|H21–H24|正式蓝图规划完整阅读；只提取交接知识，不执行该模块新开发|

read_material.py仅压缩空行和固定GitHub URL前缀，正文未生成摘要代读。raw JSON完整结构解析与原始TAP逐条审读分工：历史重复运行不再当新的测试项，失败保留原stdout/stderr，成功demo里的`error:`文本不被误判为TAP失败。所有原始文件仍可沿索引打开。

## 源码身份与语义核对

本地只读固定源：`C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。Git对象缓存：`C:/Users/QYF/.codex/research/deepseek-harness-f3803c9`。四份source-lock并集**9619文件**逐个比较Git blob与SHA256；四课**198条断言**（38/50/54/56）核路径、范围和源hash。结果在[source-check](evidence/source-check.json)，每条含claim/symbol/range/证据的[source-assertion-index](evidence/source-assertion-index.json)。没有声称逐行阅读整个9619文件，也不把hash匹配称为语义证明。

|重点源码|实际语义核对内容|
|---|---|
|core/session|types、index、surface、request-header、tool-history、fork、repair、preparation；提交前后、懒缓存、Seq/Offset、五类消息、来源校验与修复边界|
|core/agent-loop与core/agent|Factory create/resume/lifecycle、Loop Step/Attempt、取消/whenIdle/maintenance、Assistant安全前缀；Scope/AgentHandle发布与退出责任|
|session-persistence / JSONL|Handle/storage-contract、路由缓冲、flush/close、read/write所有权；JSONL storage/format/lease/win32/zstd与有效尾；区分通用契约/具体实现|
|session-projection|definition/register、catch-up/snapshot/viewCheckpoint、身份及通知；不把业务Projection当Surface引擎|
|compaction / compaction-basic|命令/自动入口、锁、选区/工具配对、辅助摘要、重验与逐事件提交、压力阈值与overflow恢复预算|
|llm / llm-retry / token-meter|单次stream与规范失败、不可变provider/policy、normal/always、延迟/取消、Waterfall、Usage/估计/价格与W/O/B公式|
|core/tools|pipeline/batch的call登记、prepare、dispatch、已启结算、停止补位、模型序result；不推外部回滚|
|官方说明|session.zh的Header/Surface/Fork；persistence.zh的seam/排空；compaction.zh的调用链/失败；llm-streaming.zh的请求重建/失败/策略相关章节，与具体源码交叉|

官方Session fork.spec.ts、AgentLoop request-error.spec.ts、shutdown-drain.spec.ts、scope-lifecycle.spec.ts已静态阅读（含完整测试主体/断言/清理钩子）。它们支持包含切点、同Step恢复、根退出排空和创建/退出发布责任的判断；**未执行官方Vitest整套**，其中shutdown等清理钩子有递归删除，与本工作区用户指令冲突。本轮改用已审课程runner及保留临时产物的隔离探针，不运行这些清理钩子。未请求用户批量删除，也未自行清理目录。

## 来源冲突的处理

六处精度差异逐项见[一致性矩阵](technical-consistency.md)：蓝图缓存顺序、官方开放Fork相邻概括、Compaction失败步骤措辞、Retry的durable措辞、蓝图日志hash不变的范围、LLM streaming恢复新Turn概括。依据顺序为固定实现+对应测试与实际轨迹，再解释说明文档的概括边界；不擅改上游或历史规划。本轮新增顺序/预算与whole探针补足准备包明确的组合空缺，未提升为完整E。
