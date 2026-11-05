# H24 固定源码断言（50项）

固定 f3803c96974ad4a94195fb97e5c637e9c2a3afe3。每行静态结论来自实现分支；官方测试仅定位，未执行官方全套。localTest 仅覆盖所列子分支，关键词/hash存在性不证明行为。X复用D1不增加计数；默认exit失败独列。

## S01 · 官方测试分类

[docs/testing.zh.md:7–18](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/testing.zh.md#L7-L18)

官方分类含单元、覆盖率、API e2e、expected、bench、snapshot、Web；A–E是课程证据级，不是官方同名层级。

官方对照：`vitest.config.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S02 · 确定性与清理策略

[docs/testing.zh.md:19–55](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/testing.zh.md#L19-L55)

快照需比较外部workspace，测试资源由测试拥有；Record/Refresh改变基线，平台skip不能计PASS。

官方对照：`package.json`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S03 · source aliases / platform selection

[vitest.config.ts:1–125](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vitest.config.ts#L1-L125)

Vitest源码路径映射及平台选择不能证明Node正式exports/lib启动。

官方对照：`package.json`（定位/静态选读，NOT_RUN）；本轮 `C A4`；证据级 `C`。

## S04 · build / test scripts

[package.json:19–84](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/package.json#L19-L84)

真实命令为build、build:lib、test:snapshot和test:web:built等；本轮未执行官方全量构建或产品Web。

官方对照：`scripts/run-web-snapshots.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S05 · resolveExampleMode / resolveExampleLaunch

[packages/test-support/loader-smoke/src/index.ts:32–132](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/loader-smoke/src/index.ts#L32-L132)

模式严格为src/lib；src带TS加载条件，lib为构建后普通Node；非法模式拒绝。

官方对照：`packages/test-support/loader-smoke/tests/example-launch.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C A4`；证据级 `C`。

## S06 · runLoaderSmoke

[packages/test-support/loader-smoke/src/index.ts:198–259](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/loader-smoke/src/index.ts#L198-L259)

传cwd时目录归调用方；未传时helper会自动递归清理。inspect在退出码检查之后，失败证据须外层保存。

官方对照：`packages/test-support/loader-smoke/tests/loader-smoke.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D A1; C A2`；证据级 `D`。

## S07 · onlyRootAgent / runFixtureTurn

[packages/test-support/loader-smoke/src/agent-turn.ts:41–116](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/loader-smoke/src/agent-turn.ts#L41-L116)

等恰好一个配置根Agent发布，先监听后投递，用收据关联输入并等idle及flush；不是只等一段文本。

官方对照：`packages/test-support/loader-smoke/tests/agent-turn.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D A1`；证据级 `D`。

## S08 · production Profile fixture

[packages/test-support/loader-smoke/tests/fixtures/production-profile.ts:1–115](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/loader-smoke/tests/fixtures/production-profile.ts#L1-L115)

官方fixture组合发行Profile和包安装；作者自有核心YAML没有执行该完整发行入口。

官方对照：`packages/test-support/loader-smoke/tests/loader-smoke.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S09 · loadProfileDirectory / composeEntries

[packages/boot/app-boot/src/profile.ts:678–762](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L678-L762)

真实manifest和Patch组成Loader条目；作者Profile bundles为空但核心服务全部走YAML加载。

官方对照：`apps/cli/src/profile-boot.ts`（定位/静态选读，NOT_RUN）；本轮 `D A1; C A2`；证据级 `D`。

## S10 · startup audit

[packages/boot/app-boot/src/index.ts:1118–1205](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L1118-L1205)

settled后只对已出现且启用的特定必需ID和bootstrap include严审；其余FAILED/PENDING可警告，所以作者额外核必需行ACTIVE。

官方对照：`packages/boot/app-boot/src/index.ts`（定位/静态选读，NOT_RUN）；本轮 `C A2`；证据级 `C`。

## S11 · base composition

[packages/bundle/base/cordis.patch.yml:1–531](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/cordis.patch.yml#L1-L531)

base是正式共享配置树；作者core Profile不能冒充执行base全部插件。

官方对照：`packages/bundle/base/package.json`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S12 · headless composition

[packages/bundle/headless/cordis.patch.yml:1–46](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/headless/cordis.patch.yml#L1-L46)

一次性入口对base施加差异；运行作者driver不等于运行已交付headless。

官方对照：`packages/bundle/headless/package.json`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S13 · sdk-minimal composition

[packages/bundle/sdk-minimal/cordis.patch.yml:1–179](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/sdk-minimal/cordis.patch.yml#L1-L179)

minimal是独立服务组合；只挂SDK server和核心服务不等于该完整发行树。

官方对照：`packages/bundle/sdk-minimal/package.json`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S14 · mountAgentLoopTestDependencies

[packages/test-support/agent-loop-testkit/src/index.ts:1–106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/agent-loop-testkit/src/index.ts#L1-L106)

testkit挂官方循环依赖，不替调用方安装Loop与脚本模型；用于P1真实工具测试依赖。

官方对照：`packages/test-support/agent-loop-testkit/tests/agent-loop-testkit.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C P1`；证据级 `C`。

## S15 · executeModelToolFixture

[packages/test-support/tool-testkit/src/index.ts:1–92](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/tool-testkit/src/index.ts#L1-L92)

真实Tool/Native管线与受控工具body分开；拒绝测试需核body未进入。

官方对照：`packages/test-support/tool-testkit/tests/model-call.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C P1`；证据级 `C`。

## S16 · author schema DSL

[packages/core/tools/src/schema.ts:1–171](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/schema.ts#L1-L171)

required写在属性声明上；对象additionalProperties等由作者DSL转换，不能随意塞Zod或任意JSON Schema。

官方对照：`packages/core/tools/tests/schema.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C P1`；证据级 `C`。

## S17 · seeded properties

[packages/core/tools/tests/properties.spec.ts:1–100](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/tests/properties.spec.ts#L1-L100)

属性测试对不变量取有种子样本，非穷尽证明；40样本不是40独立行为场景。

官方对照：`packages/core/tools/tests/properties.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C P1`；证据级 `C`。

## S18 · MockAdapter / hang / toolCallResponse

[packages/core/agent-loop/tests/mock-adapter.ts:1–139](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/mock-adapter.ts#L1-L139)

脚本化文本、工具和hang提供受控模型边界；不测真实模型推理质量。

官方对照：`packages/core/agent-loop/tests/loop.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D A1; D D5`；证据级 `D`。

## S19 · parseSessionLog / comparison encoding

[packages/test-support/llm-replay/src/index.ts:214–342](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/llm-replay/src/index.ts#L214-L342)

通过固定catalog恢复并校验事件；comparison编码与可执行回放fixture不同，不应覆盖原格式基线。

官方对照：`packages/test-support/llm-replay/tests/llm-replay.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1; D X`；证据级 `D`。

## S20 · deriveReplayScript

[packages/test-support/llm-replay/src/index.ts:467–623](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/llm-replay/src/index.ts#L467-L623)

从已记录请求和Assistant事实派生脚本；chunk前throw/hang等需要override，不凭结算日志推断完整时序。

官方对照：`packages/test-support/llm-replay/tests/llm-replay.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1`；证据级 `D`。

## S21 · installLlmReplay

[packages/test-support/llm-replay/src/index.ts:1037–1213](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/llm-replay/src/index.ts#L1037-L1213)

按Session分配脚本并要求consume；多子级首次请求顺序是回放限制，不能声称随机并行轨迹必定确定。

官方对照：`packages/test-support/llm-replay/tests/llm-replay.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1`；证据级 `D`。

## S22 · MockLlmServerOptions

[packages/test-support/llm-mock-server/src/index.ts:117–178](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/llm-mock-server/src/index.ts#L117-L178)

支持Messages HTTP/SSE脚本、随机种子和故障选项；不是任意Chat Completions服务器。

官方对照：`packages/test-support/llm-mock-server/tests/server.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D D1; D D2; D D3`；证据级 `D`。

## S23 · startMockLlmServer

[packages/test-support/llm-mock-server/src/index.ts:643–755](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/llm-mock-server/src/index.ts#L643-L755)

动态端口、有效请求序列记录；close关闭连接，测试还需等待调用方和子进程释放。

官方对照：`packages/test-support/llm-mock-server/tests/server.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D D1; D D6`；证据级 `D`。

## S24 · writesCurrentSessionFixtures / parseSnapshotManifest

[packages/test-support/session-snapshot/src/manifest.ts:139–218](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/session-snapshot/src/manifest.ts#L139-L218)

replay不写current fixture，record可写；未知字段拒绝。单独测parser不等于完整Snapshot Suite。

官方对照：`packages/test-support/session-snapshot/tests/manifest.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C B4`；证据级 `C`。

## S25 · normalizeSessionSnapshot(s)

[packages/test-support/session-snapshot/src/normalize.ts:350–511](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/session-snapshot/src/normalize.ts#L350-L511)

标识/时间/cwd规范化后可比；Windows嵌套JSON cwd要给escaped alias；plural comparison会处理格式元数据，不能作原始replay基线。

官方对照：`packages/test-support/session-snapshot/tests/normalize.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1; D B2`；证据级 `D`。

## S26 · redactSessionSnapshotIds

[packages/test-support/session-snapshot/src/identity.ts:1–115](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/session-snapshot/src/identity.ts#L1-L115)

typed映射区分Session、Message等身份并保留关联；本课随后用identityMode preserve避免旧式UUID合并。

官方对照：`packages/test-support/session-snapshot/tests/identity.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1`；证据级 `D`。

## S27 · captureWorkspaceSnapshot

[packages/test-support/session-snapshot/src/workspace.ts:1–113](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/session-snapshot/src/workspace.ts#L1-L113)

独立遍历实际workspace与expected树，比文件集合、内容等；Agent文本不是外部事实。

官方对照：`packages/test-support/session-snapshot/tests/workspace.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1; D D4`；证据级 `D`。

## S28 · scrubSystemPrompts / scrubToolSchemas

[packages/test-support/session-snapshot/src/normalize.ts:549–665](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/session-snapshot/src/normalize.ts#L549-L665)

压缩主Snapshot可另存请求头/系统提示/工具Schema，不能把剥离大块解释为无需比较它们。

官方对照：`packages/test-support/session-snapshot/tests/suite.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1`；证据级 `D`。

## S29 · AgentLoop Config / creation

[packages/core/agent-loop/src/index.ts:291–415](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L291-L415)

真实Loop通过Factory创建Agent并依赖所需服务；静态agent配置与SDK动态创建分开。

官方对照：`packages/core/agent-loop/tests/model.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D A1; D C1`；证据级 `D`。

## S30 · Turn / Step / request boundaries

[packages/core/agent-loop/src/agent.ts:327–486](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L327-L486)

Turn与Step开闭不同，运行进程exit0也可能Turn error；测试检查终态及工具事实。

官方对照：`packages/core/agent-loop/tests/loop.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D D3; D D5`；证据级 `D`。

## S31 · buildRequest

[packages/core/agent-loop/src/agent.ts:656–744](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L656-L744)

模型输入由Session派生后冻结；应比较真实下一请求包含工具结果，不用作者自写摘要作唯一证据。

官方对照：`packages/core/agent-loop/tests/tool-calls.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D B1; D X`；证据级 `D`。

## S32 · Session.fromRestore

[packages/core/session/src/index.ts:611–705](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L611-L705)

恢复验证当前header/事件和精确继承前缀，产生新Session；不重新执行工具或复活旧资源。

官方对照：`packages/session/session-format-catalog/src/current.ts`（定位/静态选读，NOT_RUN）；本轮 `D X; D C2`；证据级 `D`。

## S33 · deriveMessages

[packages/core/session/src/index.ts:990–1025](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L990-L1025)

Surface派生模型可见消息，不能把所有审计事件直接拼成输入；X核重建前缀等于真实请求。

官方对照：`packages/session/session-format-catalog/tests/developer-history.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D X`；证据级 `D`。

## S34 · JSONL handles

[packages/session/session-persistence-jsonl/src/index.ts:1310–1470](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-persistence-jsonl/src/index.ts#L1310-L1470)

真实文件读写、flush、handle close分别有确认点；本轮正常关闭/新PID不证明断电或所有Backend。

官方对照：`packages/session/session-persistence-jsonl/tests/fork-delivery.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D A1; D C2; D D6`；证据级 `D`。

## S35 · JsonRpcLineTransport

[packages/sdk/protocol/src/transport.ts:65–160](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/protocol/src/transport.ts#L65-L160)

换行JSON-RPC承载请求/响应/通知，flush和关闭不是Agent任务完成。

官方对照：`packages/sdk/protocol/tests/transport.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D C1; C C3`；证据级 `D`。

## S36 · apply / runtime exit hook

[packages/sdk/server/src/index.ts:25–104](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/index.ts#L25-L104)

正式插件支持运行时exit钩子；默认process.exit。shutdown响应后flush、root dispose再exit；钩子通过不覆盖默认分支。

官方对照：`packages/sdk/server/tests/shutdown.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D C1; D D1; default exit FAILED_NATIVE`；证据级 `D`。

## S37 · HarnessClient process owner

[packages/sdk/client/src/client.ts:1–600](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/client.ts#L1-L600)

客户端持有stdio子进程，close与异常退出需观察进程事实；不能只看shutdown响应。

官方对照：`packages/sdk/client/tests/sdk-client.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `D C1; D C2; C C3`；证据级 `D`。

## S38 · TestRemote

[packages/test-support/client-runtime/src/remote.ts:1–103](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/client-runtime/src/remote.ts#L1-L103)

官方TestRemote支持订阅与emit/disposer，拒绝真实mount；它是测试double，不能证明Host权限和真实连接。

官方对照：`packages/test-support/client-runtime/tests/remote.client.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `C P2`；证据级 `C`。

## S39 · SlotTestRuntime

[packages/test-support/client-runtime/src/index.ts:1–145](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/client-runtime/src/index.ts#L1-L145)

完整Client Runtime还需jsdom、Slots及会话等；本轮只执行TestRemote子集。

官方对照：`packages/test-support/client-runtime/tests/assembly-test-client.client.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S40 · RemoteMock exports

[packages/test-support/remote-mock/src/index.ts:1–17](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/test-support/remote-mock/src/index.ts#L1-L17)

Remote Mock是受控client carrier工具；本轮未执行，不推导真实Host授权通过。

官方对照：`packages/test-support/remote-mock/tests/rpc.client.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S41 · browser scaffold

[apps/web/tests/scaffold.ts:1–140](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/web/tests/scaffold.ts#L1-L140)

固定版本有真实浏览器测试脚手架；产品构建及Host fixture缺失时不得拿教材Chrome截图代替。

官方对照：`apps/web/tests/smoke-real.e2e.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S42 · browser CI owners

[scripts/run-web-snapshots.ts:1–44](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/scripts/run-web-snapshots.ts#L1-L44)

串行HMR/client-plugin owners后再有界池，DSH_WEB_SNAPSHOT_WORKERS须正整数；不是所有文件无条件并行。

官方对照：`vitest.web.config.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S43 · SessionToolResults

[packages/client/ui-trajectory/src/index.ts:1–127](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/ui-trajectory/src/index.ts#L1-L127)

实时成功raw Tool Result按精确Session对象保存有界映射，随后映射seq并随释放清理；不是新的权威历史库。

官方对照：`packages/client/ui-trajectory/tests/tool-results.host.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S44 · TokenUsage

[packages/llm/llm/src/types.ts:182–230](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/types.ts#L182-L230)

usage字段有可选项；缺失值不等于0，Mock usage不等真实计费。

官方对照：`packages/llm/token-meter/src/usage-projection.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S45 · OTel

[packages/telemetry/otel/src/index.ts:1–35](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/telemetry/otel/src/index.ts#L1-L35)

OTel仅暴露基础发送能力，挂服务本身不等于采集所有Session；具体消费者负责创建上报通道和生命周期。

官方对照：`packages/telemetry/otel/tests/event-log.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S46 · OTel architecture

[docs/subsystems/otel.zh.md:1–44](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/otel.zh.md#L1-L44)

本地记录与上传是不同动作；通道、身份、脱敏及发送时机由业务组件配置，本课不上传。

官方对照：`packages/telemetry/otel/tests/session-log.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S47 · redact / contained capture

[packages/session/session-telemetry/src/coordinator.ts:179–255](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-telemetry/src/coordinator.ts#L179-L255)

没有脱敏规则时透传；规则抛错受隔离，不应假设自动安全脱敏。

官方对照：`packages/session/session-telemetry/tests/redact.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S48 · message feedback

[packages/feedback/message-feedback/src/index.ts:1–140](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/feedback/message-feedback/src/index.ts#L1-L140)

反馈是显式业务动作，有自身提交/上传路径，不由Session日志存在推定用户同意上传。

官方对照：`packages/feedback/message-feedback/tests/message-feedback.spec.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。

## S49 · recover / Retry-After

[packages/llm/llm-retry/src/index.ts:120–257](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm-retry/src/index.ts#L120-L257)

策略来自Provider；normal遇Provider延迟超过本地上限可委派，不强行重试；429 wire1秒与1毫秒配置不同。

官方对照：`packages/llm/llm-retry/src/index.ts`（定位/静态选读，NOT_RUN）；本轮 `D D7; D D1`；证据级 `D`。

## S50 · built benchmark contract

[benchmarks/AGENTS.md:1–18](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/benchmarks/AGENTS.md#L1-L18)

基准用构建产物、固定输入、独立worker及原始测量；功能测试耗时不等真实吞吐、缓存收益或费用。

官方对照：`scripts/run-bench-suite.ts`（定位/静态选读，NOT_RUN）；本轮 `STATIC_REVIEW`；证据级 `STATIC`。
