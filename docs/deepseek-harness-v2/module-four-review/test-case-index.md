# 全部测试执行项与去重主题

136项原测试+3项新增D。20项是语义主题，不是20个互不重叠的真实场景。相同TAP名/文件没有重复；H13的A/B/C先运行一次，再由多个test消费同一结果，不能把37视作37次独立运行。H16的一个File综合例也包含多个断言。多家族Loop项同时覆盖准入、结果与Scope，不与各组件项相加声称E。

| ID/等级 | 测试完整名称 | 语义主题 | 测试文件 | 原始结果 |
|---|---|---|---|---|
| h13-01 / C | C01 valid canonical JSON and model rendering are distinct | canonical-output | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:13` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-02 / C | C02 missing required input never reaches body | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:14` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-03 / C | C03 wrong nested array element rejected with runtime error | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:15` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-04 / C | C04 nested closed object rejects unknown properties | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:16` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-05 / C | C05 parameter root remains open | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:17` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-06 / C | C06 business constraint is not supplied by array schema | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:18` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-07 / C | C07 actual shared pipeline rejects invalid canonical output | canonical-output | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:19` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-08 / C | C08 schemas whitelist model fields and disposer unregisters | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:20` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-09 / C | C09 isolated scopes share globals and keep own tools | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:21` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-10 / C | C10 intersected restrictions exempt own shadow definitions | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:22` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-11 / C | C11 descendant can filter inherited ancestor registration | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:23` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-12 / C | C12 plugin and scope disposal unwind real registry effects | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-13 / C | C13 registered conditional inspection differs from executable without set | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:25` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-14 / C | C14 resolve captures condition once and next set evaluates again | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:26` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-15 / C | C15 live restriction can mask and restore an admitted registration | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:27` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-16 / C | C16 unregister and same-object replacement invalidate old admission | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:28` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-17 / C | C17 disposed set stays empty and does not unregister definition | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:29` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-18 / C | C18 false and throwing activation are distinct | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:30` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-19 / C | C19 abort does not race an uncooperative when promise | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:31` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-20 / C | C20 duplicate name, reserved name, and invalid timeout fail registration | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:32` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-21 / C | C21 restrict requires scope and known inherited names | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:38` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-22 / C | C22 scalar DSL enforces integer enum const boolean null | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:44` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-23 / C | C23 oneOf demands exactly one matching branch | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:52` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-24 / C | C24 json accepts lossless JSON but not undefined, nonfinite or exotic | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:57` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-25 / C | C25 DSL rejects unsupported keywords, missing object openness and required false | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:62` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-26 / C | C26 annotations default do not fill missing required input | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:66` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-27 / C | C31 progressive two-number definition produces each advertised stage | schema-input | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:71` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-28 / C | C27 raw defineTool.execute validates input, not its own output | canonical-output | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:77` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-29 / C | C28 admission is tied to exact agent object and release keeps registrations | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:81` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-30 / C | C29 unregister during pending when cannot resurrect tool | step-admission | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:88` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-31 / C | C30 scoped shadow is exact definition, root schema projection detached | registry-scope | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:96` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-32 / D | D01 real loop success: request schemas, calls, results and live eligibility | loop-feedback | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-33 / D | D02 real loop false: request schemas, calls, results and live eligibility | loop-feedback | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-34 / D | D03 real loop retry: request schemas, calls, results and live eligibility | loop-feedback | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-35 / D | D04 real loop remove: request schemas, calls, results and live eligibility | loop-feedback | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-36 / D | D05 real loop replace: request schemas, calls, results and live eligibility | loop-feedback | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h13-37 / D | D06 real loop restrict: request schemas, calls, results and live eligibility | loop-feedback | `course-content/internal/deepseek-harness/h13/lab/registry.test.ts:24` | [1/0](evidence/run-1793617626209-h13.json) |
| h14-01 / C | C-flow-normal | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-02 / C | C-flow-deny | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-03 / C | C-flow-guard | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-04 / C | C-flow-ask | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-05 / C | C-flow-cancel | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-06 / C | C-flow-content | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-07 / C | C-flow-value | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-08 / C | C-flow-block | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-09 / C | C-flow-pre-throw | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-10 / C | C-flow-around-throw | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-11 / C | C-flow-project-throw | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-12 / C | C-flow-post-throw | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-13 / C | C-flow-final-throw | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-14 / C | C-flow-output-bad | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-15 / C | C-flow-observer-throw | pipeline-result | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-16 / C | C-failure-unknown | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-17 / C | C-failure-parse | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-18 / C | C-failure-args | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-19 / C | C-failure-deny | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-20 / C | C-failure-pre-abort | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-21 / C | C-failure-body-throw | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-22 / C | C-failure-output | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-23 / C | C-failure-post-throw | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-24 / C | C-failure-post-abort | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-25 / C | C-failure-pending-abort | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-26 / C | C-failure-pre-pending-abort | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-27 / C | C-failure-scheduler | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-28 / C | C-failure-signal-replace | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-29 / C | C-failure-snapshot | pipeline-failure | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-30 / C | C-policy outer waterfall may override deny; guard still denies | pipeline-policy | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:39` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-31 / C | C-snapshot detaches nested caller values and mints distinct tokens | identity-snapshot | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:51` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-32 / C | C-batch rejects invalid parallel override before wrapping scheduler error | batch-scheduling | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:62` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-33 / D | D-scheduling-parallel | batch-scheduling | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-34 / D | D-scheduling-limit-one | batch-scheduling | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-35 / D | D-scheduling-body-error | batch-scheduling | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-36 / D | D-scheduling-rolling | batch-scheduling | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-37 / D | D-scheduling-reclassify | batch-scheduling | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-38 / D | D-loop-success | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-39 / D | D-loop-deny | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-40 / D | D-loop-body-error | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-41 / D | D-loop-cancel | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-42 / D | D-loop-conclude | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-43 / D | D-loop-conclude-context | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-44 / D | D-loop-block-conclude | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h14-45 / D | D-loop-internal | loop-feedback | `course-content/internal/deepseek-harness/h14/lab/pipeline.test.ts:9` | [1/0](evidence/run-1793617627078-h14.json) |
| h15-01 / C | C approval allow | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-02 / C | C approval reject | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:21` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-03 / C | C approval cancel-answer | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-04 / C | C approval unavailable | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-05 / C | C approval missing | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-06 / C | C approval throw-sync | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-07 / C | C approval throw-async | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-08 / C | C approval invalid | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-09 / C | C approval delegate | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-10 / C | C approval never | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-11 / C | C approval pre-abort | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-12 / C | C approval late | approval-outcome | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-13 / C | C approval rejects idle | approval-audit | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-14 / C | C approval rejects closed | approval-audit | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-15 / C | C approval audit commit failure cannot return grant | approval-audit | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:24` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-16 / C | C approval per-session policy and runtime context are not transcript | approval-audit | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:27` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-17 / C | C allowed-once is not a cached grant for a repeated callId | approval-audit | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:31` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-18 / C | C deployment never, cancelled signal, and session ask precedence | approval-audit | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:41` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-19 / D | D pipeline allow | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-20 / D | D pipeline deny | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-21 / D | D pipeline ask-allow | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-22 / D | D pipeline ask-reject | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-23 / D | D pipeline ask-missing | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-24 / D | D pipeline guard | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-25 / D | D pipeline override-deny | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-26 / D | D pipeline override-guard | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-27 / D | D pipeline approved-guard | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-28 / D | D pipeline cancel-approval | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-29 / D | D pipeline pre-abort | pipeline-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:10` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-30 / D | D SandboxPolicy + Session + Approval + simulated local provider | sandbox-policy | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:59` | [1/0](evidence/run-1793617627910-h15.json) |
| h15-31 / D | D real local filesystem + fence + observations across lifecycle | fs-freshness | `course-content/internal/deepseek-harness/h15/lab/safety.test.ts:68` | [1/0](evidence/run-1793617627910-h15.json) |
| h16-01 / C | C File argument offset-zero | schema-input | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-02 / C | C File argument limit-over-cap | schema-input | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-03 / C | C File argument blank-path | schema-input | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-04 / C | C HTTP URL hygiene file:///fixture | http-url | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-05 / C | C HTTP URL hygiene ftp://fixture.invalid | http-url | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-06 / C | C HTTP URL hygiene https://name:pass@fixture.invalid | http-url | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-07 / C | C HTTP URL hygiene https://fixture.invalid/xxxxxxxxxxx | http-url | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-08 / C | C MCP normalized names preserve identity and budget | mcp-naming | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:16` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-09 / C | C MCP long raw names are stable and bounded | mcp-naming | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:17` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-10 / D | D A real File tools, streaming window, edits, optional policy and lifecycle | file-consumer | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:18` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-11 / D | D B real Shell consumer/env/Jobs over explicit Mock Executor | shell-consumer | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:27` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-12 / D | D C Web unique | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-13 / D | D C Web explicit | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-14 / D | D C Web none | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-15 / D | D C Web ambiguous | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-16 / D | D C Web configured-missing | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-17 / D | D C Web configured-unavailable | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-18 / D | D C Web not-ready | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-19 / D | D C Web cancel | web-provider | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-20 / D | D D actual MCP SDK stdio disconnect retained | mcp-stdio | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-21 / D | D D actual MCP SDK stdio one reconnect | mcp-stdio | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-22 / D | D integrated AgentLoop four families | loop-feedback | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| h16-23 / D | D integrated AgentLoop remote discovery cannot expand allowlist | loop-feedback | `course-content/internal/deepseek-harness/h16/lab/ecosystem.test.ts:14` | [1/0](evidence/run-1793617631706-h16.json) |
| cross-01 / D | D cross A: schema-visible, approved once, guard denies body, Session result reaches next request | pipeline-policy | `docs/deepseek-harness-v2/module-four-review/lab/cross.test.ts:45` | [1/0](evidence/run-1793617632408-cross.json) |
| cross-02 / D | D cross B: actual File tools reject unseen/stale edits, reread recovers, complete Session pairing | fs-freshness | `docs/deepseek-harness-v2/module-four-review/lab/cross.test.ts:59` | [1/0](evidence/run-1793617632408-cross.json) |
| cross-03 / D | D cross C: real Web Step admission changes with ready; unavailable stays registered and fails on call | web-provider | `docs/deepseek-harness-v2/module-four-review/lab/cross.test.ts:73` | [1/0](evidence/run-1793617632408-cross.json) |
