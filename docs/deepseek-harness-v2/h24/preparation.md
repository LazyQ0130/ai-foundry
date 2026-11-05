# H24 正式蓝图门禁与准备

第一步在本轮完整读本地30讲蓝图3280行，按顺序分段显示，仅省略重复GitHub URL文字；不是用暂题或上一课交接代替。全部30讲标题/唯一目标和输入SHA256在[preparation-inputs](evidence/preparation-inputs.json)。研发基线4d6801324b5c19f1e8800a2be60dd80360b21314。

| 门禁 | 结论 |
| --- | --- |
| 正式H24 | 《大型 Agent 系统测试与综合架构分析》 |
| 唯一核心目标 | 为一条跨模块链建立事实、测试与限制的证据矩阵 |
| 范围 | 合同回归、属性不变量、snapshot/replay、benchmark的证据边界；真实加载、外部事实、故障和验收矩阵 |
| 第六模块H21–H24 | 蓝图依赖图称“协作与综合证据”；从Activation所有权、任务抽象到控制/订阅，再收束证据矩阵 |
| 硬门禁 | 越权0、未批准写入0、取消后新动作0、虚报验证0；P0/P1不能条件通过 |
| H25边界 | 《自己编写一个 Cordis 插件》：重复挂载/卸载纯插件；仅交前置，不实现下一课 |
| H29/H30边界 | 可观测性归因和工程CI深挖留后续；本课只保留验收所需诊断/资源条件 |
| 集中审查前置 | 四课完整交付、技术依赖/术语、16图、逐项真实/Mock证据、最高等级、P2/开放问题、建议场景与输入身份 |

已读第一至第五模块集中报告和E/v1及逐模块有效增补，H21–H23正文/答案、质量、实验与H23→H24交接；实验在当前连续研发上下文阅读并核关键实现。本轮补读H03/H04/H08/H09–10/H13–20的依赖段落。输入哈希不能代替语义阅读，也不是独立第二审稿人的签署。当前较短默认主线不要求学员读遍全部源码。

固定源码先核全部请求路径，结果均存在，见[requested-paths](evidence/requested-paths.json)。官方testing.zh.md、test-support README及Loader Smoke/Testkit/Replay/Mock Server/Snapshot/Client Runtime/Remote Mock，真实CLI/AppBoot与Bundle、SDK/Gateway/Controller/Connection/UI/Trajectory、OTel/Feedback及官方场景均按相关分支研究。上游测试定位/选读，没有执行其递归清理套件。本轮采用当前真实运行工具和固定源码，未改上游源码。

## 运行环境与八棵依赖树

作者Windows10.0.26300，Node24.16.0。runner核固定源Git blob及运行前SHA256；再核每棵npm锁里所有直接/传递包name/version/integrity对固定pnpm-lock。不是只核顶层版本。源码默认`C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，可由HARNESS_SOURCE_CACHE覆盖；Git校验缓存可由HARNESS_GIT_CACHE覆盖。

| 环境变量 | 作者锚点（均在C:/Users/QYF/.codex/research/） | 主要包 |
| --- | --- | --- |
| H24_DEPS_ANCHOR | h04-probe-deps/node_modules/commander/index.js | commander15.0.0、ajv8.20.0、js-yaml4.3.2、resolve.exports2.0.3等 |
| H24_ZOD_ANCHOR | h09-probe-deps/node_modules/zod/index.js | zod4.4.3 |
| H24_NATIVE_ANCHOR | module-four-probe-deps/node_modules/koffi/index.js | koffi3.1.1、chokidar5.0.0、yaml2.9.0等 |
| H24_LIMIT_ANCHOR | h18-persistence-deps/node_modules/p-limit/index.js | p-limit7.3.3、Temporal polyfill0.5.1等 |
| H24_PTC_ANCHOR | h22-ptc-deps/node_modules/acorn/dist/acorn.js | acorn8.18.0、acorn-walk8.3.5、birpc4.2.0 |
| H24_WIRE_ANCHOR | h23-wire-deps/node_modules/ws/index.js | ws8.21.3、eventsource-parser3.1.0等 |
| H24_TEST_ANCHOR | h24-fixed-test-deps/node_modules/execa/index.js | execa10.0.1、tsx4.23.13、fast-check4.9.0；锁定pretty-ms/pure-rand/yoctocolors |
| H24_HTTP_ANCHOR | h24-http-deps/node_modules/undici/index.js | undici7.29.1 |

完整8棵package.json/package-lock副本见[evidence/dependency-manifests](evidence/dependency-manifests/)，核验见[dependencies](evidence/dependencies.json)。他机需在**各自全新的空目录**按锁清单准备，再设置锚点；若目录已有node_modules则停止，不能用npm ci或其他操作批量清理。缺依赖要修准备环境，不能跳过预检。native包还需对应平台产物；不承诺跨平台即装即用。

依赖准备曾在另一个新作者缓存h24-test-deps中原地更正三个漂移传递包，npm控制台报告3 added/3 removed。该替换操作不符合本任务对批量删除的保守约束；没有执行删除shell命令，没有触及受保护文件。原控制台存在但未伪造历史raw日志，操作在[dependency-install](evidence/dependency-install.json)如实登记。之后改为全新h24-fixed-test-deps精确锁定，仅一次新增23包；旧缓存保留，新增HTTP树独立。不能写“绝无任何包替换”。

隔离Home/Profile/workspace/JSONL、白名单环境、恒定虚构任务、dummy key、本地HTTP动态端口。Loader Smoke传cwd，所有目录/原始记录保留；关闭客户端、dispatcher和Mock Server后等真实退出与端口复用。不碰真实用户Session/Profile/凭据、output和线上业务；不上传遥测。

三个停点60–80/70–100/110–150分钟，共240–330。蓝图120–165，差额120–165；H23估230–310，本课再增10–20。W01 P2持续，环境时间另计；学员实际时间/效果未测。
