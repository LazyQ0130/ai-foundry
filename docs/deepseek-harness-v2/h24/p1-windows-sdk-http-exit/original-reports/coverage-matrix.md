# H24 覆盖与等级矩阵

23项=C9/D14。每行对应TAP身份；A2有3行，D4有2行；X和重跑不另加，40属性样本只算1。环境Windows/Node24.16.0，命令及所有程序hash见lab-results。

| # / 级别 | 入口与真实组件 | Mock/受控部分 | 实际断言 |
| --- | --- | --- | --- |
| 1 / D A1 Loader YAML composes real core, drives tool and independently reads file | YAML Profile / Loader Smoke；AppBoot+Loader+Loop+Tools+Session+JSONL | scripted official MockAdapter and constant safe tool | ACTIVE; safe external file; unchanged bytes; real tool/result |
| 2 / C A2 startup refuses missing | negative Profile process；real module/config/activation checks | missing provider / invalid config / bad author export | exit1; no ready; no config file; three parameterized cases |
| 3 / C A2 startup refuses bad-config | negative Profile process；real module/config/activation checks | missing provider / invalid config / bad author export | exit1; no ready; no config file; three parameterized cases |
| 4 / C A2 startup refuses bad-export | negative Profile process；real module/config/activation checks | missing provider / invalid config / bad author export | exit1; no ready; no config file; three parameterized cases |
| 5 / C A3 actual Loader export unwrap reveals hidden inject regression | actual unwrap contract；Cordis Loader | author good/bad module | good named inject survives, bad default hides inject; guard rejects regression |
| 6 / C A4 source and built launch contracts refuse invalid mode and missing lib | mode contract and missing built process；official mode/launch + ordinary Node | no LLM; deliberately absent lib | invalid mode refuses; no tsx in lib; missing lib fails, positive built NOT_RUN |
| 7 / D B1 real replay, Snapshot normalizer, tool history and complete workspace compare | real Replay and Snapshot pure helpers；full author YAML core, replay, normalizer, identity, workspace | reviewed immutable v4 response fixture | Session equality; complete workspace; full prompt/schema sidecars; consumed |
| 8 / D B2 independent identical input gives identical normalized output without rewriting baseline | two fresh Profile worlds；real Loader/Loop/Tools/Session/JSONL | identical input and scripted model | same normalized output and unchanged baseline bytes; repeats not new cases |
| 9 / D B3 a false expected result turns red while correct immutable fixture stays green | intentional expected mismatch；same real replay chain | wrong expectation only in memory | red detected; correct baseline unchanged, correct comparison green |
| 10 / C B4 official manifest rejects unknown fields and replay mode cannot write current fixtures | manifest contract；official parser and mode predicate | author manifest | replay false / record true; unknown field rejects; not full suite |
| 11 / D C1 real SDK subprocess drives Loader-composed Session and external tool result | real SDK stdio subprocess；Client/Server/Protocol + YAML core + JSONL | MockAdapter; official test exit hook | accepted/run/events, actual file and child exit0 |
| 12 / D C2 new SDK PID resumes persistent history without automatic prompt | new SDK PID resume；new process, persistent JSONL/Loop | MockAdapter; test exit hook | no prompt on resume, old byte prefix retained, next request sees history |
| 13 / C C3 SDK propagates deliberate child startup exit and reaps its process | controlled startup failure；real SDK process owner | author child deliberately exit7 before boot | start rejects; actual child reaped exit7 |
| 14 / D D7 provider Retry-After above normal ceiling refuses a retry | real loopback Messages failure；DeepSeekAdapter+Retry+Loop+Session | official rate_limit HTTP server | wire1000ms > ceiling1ms; requests1/retry0/Turn error |
| 15 / D D1 real Messages adapter retries 429 through SDK, Loader, tool and JSONL | real loopback HTTP via SDK；Loader+SDK+Adapter+Retry+Tools+JSONL | 429/tool/success server; safe tool; test exit hook | requests3; retry/retry-started1; writes1; next request tool; child exit0; port rebind |
| 16 / D D2 partial disconnect retries actual transport and closes a legal Turn | partial disconnect；real Adapter+Retry+Loop+JSONL | official partial_disconnect then success | requests2/retry1/Turn completed/tools0; port released |
| 17 / D D3 terminal authentication failure is observed from events rather than no-throw | terminal auth failure；real Adapter+Loop+JSONL | official auth_error | requests1/retry0/Turn error/tools0, process0 not task success |
| 18 / D D4 external fact gate rejects false success after tool-error | external-world false success gate；real Tools/Native/Loop+JSONL | tool throw or guard deny; misleading final model text | body1/0, writes0, isError, target absent, unchanged KEEP; two cases |
| 19 / D D4 external fact gate rejects false success after deny | external-world false success gate；real Tools/Native/Loop+JSONL | tool throw or guard deny; misleading final model text | body1/0, writes0, isError, target absent, unchanged KEEP; two cases |
| 20 / D D5 cancellation waits for SDK child exit, records abort and admits no tool body | in-flight close/cancel；SDK+Loop+Session+JSONL | official MockAdapter hang; test exit hook | gate reached; same close promise; actual child0; abort Turn; tools/writes0 |
| 21 / D D6 two repeated isolated runs release real writer and loopback port | two isolated repeats；same D1 real chain | same HTTP script and test exit hook | different root/PID, writer closed, port rebind; not extra semantic scenarios |
| 22 / C P1 seeded property checks real native tool guard and argument contract | seeded property samples；official Tools/Native/testkit dependencies | constant tool body, boolean input generator | seed24, 40 samples, reject/invalid => body0; one C test |
| 23 / C P2 official Client Runtime TestRemote exposes its limited event-double contract | Client Runtime subset；official TestRemote class | event double, no UI/Host | unsubscribe, mount rejection, shadow guard; not jsdom or browser |

## 环境能力独立标记

| 能力 | 状态/边界 |
| --- | --- |
| Keyless Mock Provider | 已执行：官方MockAdapter/Replay；真实Adapter到官方回环HTTP Mock |
| 真实Provider / 互联网 | NOT_RUN；无付费请求，不从dummy key推认证安全 |
| 真实SDK子进程 | 已执行；当前通过使用runtime-only exit钩子，默认分支P1见报告 |
| 真JSONL / 跨进程恢复 | 已执行：正常关闭后新PIDResume；非崩溃/断电认证 |
| 真实网络 | 回环HTTP/SSE已执行；WebSocket/真实互联网未执行 |
| 完整作者核心Profile | 源码YAML核心成功；不是完整发行Profile或E |
| lib正向入口 / E keyless | NOT_RUN；A4仅证缺产物响亮失败 |
| Client Runtime / Remote Mock | TestRemote子集C；完整SlotRuntime/jsdom及RemoteMock均NOT_RUN |
| 产品Web真实浏览器 | NOT_RUN；缺产品built/Host依赖；Chrome教材QA单列 |
| Trajectory / OTel / feedback | 静态固定分支研究，未执行上报或产品视图；无用户数据外发 |
| 合成性能 / Provider性能和成本 | NOT_RUN，测试duration不是基准 |
| 学员/实测学习时间/外审 | PENDING |

## 原始证据

[lab-results](evidence/lab-results.json)、[23项身份](evidence/test-grades.json)、[当前TAP](evidence/lab-tests.txt)、[实际组件/协议/文件trace](evidence/behavior-traces.json)、[X trace](evidence/trace-X.json)、[默认退出失败](evidence/default-exit-failure.json)。原始run和历史失败保留。测试PASS不等故障场景任务成功，不等产品GO。

额外故障边界：模型超时、SDK任务中途失联、tool/call已记录但缺tool/result的完整注入均NOT_RUN。主动取消不替超时，启动前exit7不替中途断连，正常JSONL恢复不替缺结果修复；未知外部效果先查独立事实/幂等状态，不自动重做。本轮不截断真实存储。
