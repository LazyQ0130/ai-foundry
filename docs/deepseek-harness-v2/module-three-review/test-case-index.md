# 144项逐例证据索引

每项等级据受测对象、装配、操作和断言复核；C组件含必要真实依赖，但未接入Driver任务链，D验证多个组件协作的生命周期/请求路径。B未单独运行；E未运行。原始日志与新日志名称相符，不按报告标题重分类。

| 课 | 等级 | 实际用例（原始TAP名） | 历史 / 本轮 |
|---|---|---|---|
| h09 | C | C01 Registry without factory rejects both creation operations | PASS / PASS |
| h09 | C | C02 real Registry delegates caller fiber, rejects duplicate factory and releases slot | PASS / PASS |
| h09 | C | C03 real entry identity and advanced detach reject mismatch, collision and stale teardown | PASS / PASS |
| h09 | D | D01 A uses real Loop: queries, roots, snapshots and collisions | PASS / PASS |
| h09 | D | D02 B: public Agent lacks dispose; stale Handle and former caller cannot delete replacement | PASS / PASS |
| h09 | D | D03-setup initialization/cleanup path | PASS / PASS |
| h09 | D | D03-commit initialization/cleanup path | PASS / PASS |
| h09 | D | D03-session-listener initialization/cleanup path | PASS / PASS |
| h09 | D | D03-agent-listener initialization/cleanup path | PASS / PASS |
| h09 | D | D03-cancel initialization/cleanup path | PASS / PASS |
| h09 | D | D03-normal initialization/cleanup path | PASS / PASS |
| h09 | D | D04 setup sees live writable Session and unpublished Agent; created sees committed scoped registrations | PASS / PASS |
| h09 | D | D05 serial listener barrier holds create; failed creation preserves queued input without starting model | PASS / PASS |
| h09 | D | D06 owner unload during async creation listener waits for listener and scope before detaching | PASS / PASS |
| h09 | D | D07-handle stops and drains real maintenance before scope/registries | PASS / PASS |
| h09 | D | D07-owner stops and drains real maintenance before scope/registries | PASS / PASS |
| h09 | D | D07-factory stops and drains real maintenance before scope/registries | PASS / PASS |
| h09 | D | D08 explicit parentAgent, caller, historical parent and object identity are independent | PASS / PASS |
| h09 | D | D09 real resume rejects absent backend; pre-aborted create announces nothing | PASS / PASS |
| h09 | D | D10 real resume reconstructs new objects through memory backend fixture; dispose retains stored facts | PASS / PASS |
| h09 | D | D11 teardown attempts registry cleanup after write-close failure and preserves rejection | PASS / PASS |
| h09 | D | D12 queued wake starts only after serial creation listeners; pre-step rejects before any model call | PASS / PASS |
| h09 | D | D13 aborting the creation signal after success does not dispose the live Agent | PASS / PASS |
| h09 | D | D14 concurrent same-id preparation publishes one lifecycle and preserves winner | PASS / PASS |
| h10 | C | C01 actual Inbox claims all next-step then one next-turn, before live claimed notification | PASS / PASS |
| h10 | C | C02 actual Inbox rejects duplicate identity across lists without adding a fact | PASS / PASS |
| h10 | C | C03 actual Inbox clear records canceled next-step before next-turn | PASS / PASS |
| h10 | C | C04 actual stream component publishes chunks before settlement, committed end after Session append | PASS / PASS |
| h10 | D | D01-direct real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-one-tool real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-multi real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-two-tools real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-reject real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-empty real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-retry real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-terminal real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-tool-error real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D01-max-tokens real Loop boundary counts and endings | PASS / PASS |
| h10 | D | D02 three-Step task reads prior tool results in later frozen requests | PASS / PASS |
| h10 | D | D03 A verifies real trace annotations and rejects Attempt-as-Step answer | PASS / PASS |
| h10 | D | D04 actual maintenance is publicly idle; queued claims I,S,F1 then F2 over two Turns | PASS / PASS |
| h10 | D | D05-steer routing during running follows correct boundary | PASS / PASS |
| h10 | D | D05-followup routing during running follows correct boundary | PASS / PASS |
| h10 | D | D05-inject routing during running follows correct boundary | PASS / PASS |
| h10 | D | D06-pre-step cancellation at a controlled boundary | PASS / PASS |
| h10 | D | D06-request cancellation at a controlled boundary | PASS / PASS |
| h10 | D | D06-stream cancellation at a controlled boundary | PASS / PASS |
| h10 | D | D06-keep-inbox cancellation at a controlled boundary | PASS / PASS |
| h10 | D | D06-drop-inbox cancellation at a controlled boundary | PASS / PASS |
| h10 | D | D07 inject while truly idle parks input and performs no turn until a waking call | PASS / PASS |
| h10 | D | D08 rejected first pre-step leaves claimed input removed but later next-turn still pending | PASS / PASS |
| h10 | D | D09 retry repeats request only, not assembly/pre-step/admitted user | PASS / PASS |
| h10 | D | D10 request middleware failure is terminal, not automatically sent to request-error recovery | PASS / PASS |
| h10 | D | D11 stopping listener steering is rechecked; max-tokens stays sticky across later completed Step | PASS / PASS |
| h10 | D | D12 model choice is captured per proposed Step, later select applies to next Step | PASS / PASS |
| h11 | C | C01 sections sort by order then code-unit name; assembly is unresolved and render uses captured variables | PASS / PASS |
| h11 | C | C02 unknown, undefined and malformed references fail explicitly; literal section survives | PASS / PASS |
| h11 | C | C03 complete restores exact chosen section after waterfall while transformed variables/tools survive | PASS / PASS |
| h11 | C | C04 multiple effective complete sections reject assembly | PASS / PASS |
| h11 | C | C05 complete does not skip evaluation failures from other registered section providers | PASS / PASS |
| h11 | C | C06 duplicate names, nonfinite order and invalid variable names reject registration | PASS / PASS |
| h11 | C | C07 renderer keeps whitespace/lone opening braces, does not recursively substitute values or consult prototype | PASS / PASS |
| h11 | C | C08 all registered variable providers run at assembly, even unused ones | PASS / PASS |
| h11 | C | C09 refresh updates registered runtime facts while accepted sections/variables/tools/waterfall additions remain | PASS / PASS |
| h11 | C | C10 independent suppressors keep required context; restore depends on the accepted input being refreshed | PASS / PASS |
| h11 | C | C11 refresh adds missing required registrations, does not collect new optional ones | PASS / PASS |
| h11 | C | C12 includeRuntimeContext=false suppresses optional providers and expert additions, keeps required | PASS / PASS |
| h11 | C | C13 refresh restores required context removed by presentation waterfall | PASS / PASS |
| h11 | C | C14 context ties preserve collection order, unlike section code-unit name ties | PASS / PASS |
| h11 | C | C15 scoped section shadows before evaluation and exact disposer restores global | PASS / PASS |
| h11 | C | C16 scoped variable wins value although global provider is still evaluated first | PASS / PASS |
| h11 | C | C17 scoped context suppression affects only matching scope and scoped listener does not see global assembly | PASS / PASS |
| h11 | C | C18 anonymous global and matching scoped Tool Providers add contributions, not same-name overrides | PASS / PASS |
| h11 | C | C19 default/configured toolOrder is canonical, with lexicographic rest insertion | PASS / PASS |
| h11 | C | C20 known hidden tool is absent normally; unknown toolOrder name rejects | PASS / PASS |
| h11 | C | C21 bad toolOrder shape read | PASS / PASS |
| h11 | C | C21 bad toolOrder shape <unlisted-tools>,read,read | PASS / PASS |
| h11 | C | C22 provider cannot return reserved rest name as an actual tool | PASS / PASS |
| h11 | C | C23 presentation waterfall cannot add/replace provider tools; tool parameters are detached | PASS / PASS |
| h11 | C | C24 waterfall text is authoritative without complete; failures propagate | PASS / PASS |
| h11 | D | D01-plain prompt updates, unchanged render and empty clearing use real prepared route capabilities | PASS / PASS |
| h11 | D | D01-in-history prompt updates, unchanged render and empty clearing use real prepared route capabilities | PASS / PASS |
| h11 | D | D02 series start preserves unchanged in-history prompt; changed text consolidates active nodes | PASS / PASS |
| h11 | D | D03 tool visibility changes declarations/header and dependent guidance; earlier requests keep old data | PASS / PASS |
| h11 | D | D04 admission refresh changes dynamic snapshot without re-evaluating prompt variable | PASS / PASS |
| h11 | D | D05 suppression enabled during request preparation keeps required context only | PASS / PASS |
| h11 | D | D06-render-error failure phase records correct boundaries without model/user admission | PASS / PASS |
| h11 | D | D06-context-error failure phase records correct boundaries without model/user admission | PASS / PASS |
| h11 | D | D06-tool-order-error failure phase records correct boundaries without model/user admission | PASS / PASS |
| h11 | D | D07-cancel-prepare cancellation before admission commits no pending prompt/input | PASS / PASS |
| h11 | D | D07-cancel-assemble cancellation before admission commits no pending prompt/input | PASS / PASS |
| h11 | D | D08 retry refreshes context per attempt, but assembles/evaluates variables once and admits user once | PASS / PASS |
| h11 | D | D09 two real Agents see scoped persona/variable/tools/listeners and exact disposer restores defaults | PASS / PASS |
| h11 | D | D10 changed/empty runtime context appends full snapshot and one clearing marker, preserving prior facts | PASS / PASS |
| h11 | D | D11 initially empty prompt reserves an empty system node, no model system message until nonempty update | PASS / PASS |
| h12 | A | A01 minimal AsyncIterable yields one accumulated state per piece | PASS / PASS |
| h12 | C | C01 segmented text progresses without premature completion; absent finish defaults to stop | PASS / PASS |
| h12 | C | C02 interleaved indexes retain first-seen order, reasoning and raw tool JSON separately | PASS / PASS |
| h12 | C | C03 first block-end is authoritative and ignores later deltas and re-close | PASS / PASS |
| h12 | C | C04 max-tokens drops every tool including closed valid JSON and aligns replay metadata | PASS / PASS |
| h12 | C | C05 interrupted prefix keeps nonblank open/closed text and reasoning, omits every tool | PASS / PASS |
| h12 | C | C06 incomplete unknown block fails normal assembly but interrupted prefix omits it | PASS / PASS |
| h12 | C | C07 misaligned replay entries discard metadata without discarding content | PASS / PASS |
| h12 | C | C08 message and tool result are distinct frozen identified role values | PASS / PASS |
| h12 | C | C09 compact runs preserve original delta boundaries/timestamps and equal expanded assembly | PASS / PASS |
| h12 | C | C10 compact snapshots detach chunks and earlier snapshots from later pushes | PASS / PASS |
| h12 | C | C11 strict durable expansion rejects dt length | PASS / PASS |
| h12 | C | C11 strict durable expansion rejects index | PASS / PASS |
| h12 | C | C11 strict durable expansion rejects keys | PASS / PASS |
| h12 | C | C12 provider routes register atomically and disposal is precise | PASS / PASS |
| h12 | C | C13 advisory catalog can be empty while an exact model routes; defaults and waterfall execute | PASS / PASS |
| h12 | C | C14 prepare rejects absent route while direct stream normalizes absence | PASS / PASS |
| h12 | C | C15 malformed exact model defaults and unsupported effort fail before dispatch | PASS / PASS |
| h12 | C | C16 prepared config detached/frozen; mismatch does not consume valid dispatch, reuse does | PASS / PASS |
| h12 | C | C17 post-handle config drift is caught at lazy final dispatch | PASS / PASS |
| h12 | C | C18 prepare keeps old registration after route replacement; next call uses new adapter | PASS / PASS |
| h12 | C | C19 adapter override binds its own changing settings generation | PASS / PASS |
| h12 | C | C20 cancellation during exact-model lookup rejects preparation before dispatch | PASS / PASS |
| h12 | C | C21 adapter dispatch exception becomes terminal structured failure | PASS / PASS |
| h12 | C | C21 adapter iterator exception becomes terminal structured failure | PASS / PASS |
| h12 | C | C21 adapter iteration exception becomes terminal structured failure | PASS / PASS |
| h12 | C | C22 plain Error remains UNKNOWN while aborted signal changes terminal kind only | PASS / PASS |
| h12 | C | C23 middleware failures remain thrown, not adapter error finish | PASS / PASS |
| h12 | C | C24 waterfall short-circuit need not reach adapter lookup | PASS / PASS |
| h12 | C | C25 raw malformed adapter ordering is not automatically validated by Runtime | PASS / PASS |
| h12 | C | C26 replay passes only to adapter instance currently owning the historical route | PASS / PASS |
| h12 | C | C27 official DeepSeek translator maps native events to usage-before-finish and normalized index | PASS / PASS |
| h12 | C | C28 official DeepSeek translator rejects stream without terminal message_stop | PASS / PASS |
| h12 | C | C29 configure sees frozen proposal before defaults, keeps captured route, and failures reject preparation | PASS / PASS |
| h12 | D | D-success real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-failure real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-throw real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-cancel-empty real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-cancel-partial real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-cancel-reasoning real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-cancel-tools real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-max-tokens real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-write-failure real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-attempt-write-failure real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-assembly-failure real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-middleware-failure real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-retry real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-in-band-aborted real Loop/Session settlement and live framing | PASS / PASS |
| h12 | D | D-tool-chain real Loop/Session settlement and live framing | PASS / PASS |
