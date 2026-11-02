# 模块级测试证据与语义去重

四份实际测试文件逐项核对并复验：[139项完整索引](test-case-index.md)、[机器矩阵](evidence/test-matrix.json)。机器矩阵每项含完整名称、课程、等级、真实组件、替身、平台、原始命令所在记录、测试文件、通过/失败、断言主题和限制；原始记录含全部args/env/程序SHA256/stdout/stderr/exit/临时目录。平台为Windows / Node24.16.0，不推为Linux/macOS结果。

| 课程 | C执行项 | D执行项 | 通过/失败 | 实际测试文件 |
|---|---:|---:|---:|---|
| H13 | 31 | 6 | 37/0 | registry.test.ts |
| H14 | 32 | 13 | 45/0 | pipeline.test.ts |
| H15 | 18 | 13 | 31/0 | safety.test.ts |
| H16 | 9 | 14 | 23/0 | ecosystem.test.ts |
| 新增跨课 | 0 | 3 | 3/0 | 本目录lab/cross.test.ts |
| 执行项合计 | 90 | 49 | 139/0 | 136原项+3新项；不是独立场景数量 |

分级A=教学Mock，B=独立真实Cordis，C=单项真实组件，D=多组件局部组合，E=完整Harness应用集成。本轮没有单列新增A/B测试；它们是C/D内部依赖与替身，不再累加。D中的真实协议与原生平台证据另设维度，不能按字母一个方向混成“更安全”。E为NOT_RUN。

去重方法分三层：先按测试文件/展开TAP名核136项，不把demo或负例算入；再读test setup/action/assertion，合并重复技术机制为20个语义主题；最后把一个组合同时依赖的主题交叉标注。**20不是20个独立真实场景，139也不是139个独立安全场景；不存在据此可辩护的唯一独立场景总数。** 参数化变体的输入前提/失败阶段保留，不因共享机制删掉有效反例。

| 去重主题 | 主要执行项/真实组件 | 重叠与未覆盖 |
|---|---|---|
| schema-input | H13必填/根开放/嵌套/oneOf/无损/default/渐进例；H16 File参数 | H14坏参数也依赖包装，不能当新Schema系统；业务/权限另判 |
| canonical-output | H13 C01/C07/C27，定义与共享Pipeline | H14结果处理继续使用同一规范机制；非持久value全量验证 |
| registry-scope | H13 C08–12/20/21/30，真实Scope/Effect | H16 remote allowlist再组合；不证明OS权限 |
| step-admission | H13 C13–19/28/29真实set和门闩 | Web ready及MCP注册资格共享它；不测所有条件恶意挂起 |
| loop-feedback | H13六D、H14八LoopD、H16两综合D | 请求/Session/后续输入重复技术链；业务与失败前提不同，不升级E |
| pipeline-result | H14 15种flow输入/策略/投影/观察 | 同一flow函数参数变体；不是15种独立执行后端 |
| pipeline-failure | H14 14种failure | body/around/取消/内部故障相邻阶段；无真实OS强杀 |
| pipeline-policy | H14 C-policy，H15 11种Pipeline，新增A | H15加真实Approval但结构Agent无工具日志；新A补全Loop与后续请求 |
| identity-snapshot | H14分离参数/token/最终冻结 | H13注册身份是另一身份维度；readonly不是早期全对象freeze |
| batch-scheduling | H14五种调度+上限非法 | 确定门闩和真实Session commit；性能/真实多线程未测 |
| approval-outcome | H15四结果/none/throw/invalid/next/never/取消变体 | 一个服务的参数化前提；没有真实审批UI |
| approval-audit | H15有效Turn/提交故障/策略/重复callId | 内存Session与私有effectivePolicy诊断；真实磁盘故障未测 |
| sandbox-policy | H15真实Policy/Approval/Provider选择 | probe/launcher替身；三平台runner未启动 |
| fs-freshness | H15真实local/fence/observations；新增B真实File/Loop | H15是夹具消费者，B补tool-fs；外改为预先Node write，非恶意并发竞态 |
| http-url | H16四个纯语法拒绝 | 接受loopback不是发请求；无地址隔离/SSRF攻防实测 |
| mcp-naming | H16两个名称helper检查 | 有限碰撞样例/长度，SDK原名实调另在stdio组 |
| file-consumer | H16一个综合File fixture | 一个test同时核窗口、编辑、可选观察、图片注册/拒绝和退出；不算多项独立图像测试 |
| shell-consumer | H16一个consumer/env/Jobs综合 | 真实消费者+FixtureShell；无原生Shell/进程环境清理/沙箱 |
| web-provider | H16八变体+新C四请求 | 内存提供方，真实Runtime/admission/选择/结果；联网0 |
| mcp-stdio | H16两个实际SDK stdio变体 | 可信假业务；实际协商/发现/工具调用/资源/刷新/断连/一次重连/释放；HTTP等未测 |

H13开头先运行definitionsPractice/scopesPractice/admissionPractice一次，多个C测试消费同一结果；尤其不能把这些共享fixture断言当31次隔离实验。H14每参数变体真实调用一个练习函数，但同一机制仍重叠。H15一个FS测试覆盖生命周期多断言，H16一个File/Shell测试也如此。精确展开项和20主题映射全部保留，不隐藏这些关系。

新增局部集成：

| 场景 | 真实观察与记录 | 结论/缺口 |
|---|---|---|
| A可见但拒绝 | Schema包含audit_sum；模型提议visible-denied；pre ask→allowed-once→guard deny，body0；1call/1result；下一请求读错误 | [cross-A.json](evidence/cross-A.json)、[主体/审批](evidence/cross-A-body.json)；真实审批服务，受控答案而非UI |
| B受控文件修改 | 未见edit拒绝→read→edit成功→read→外改→STALE拒绝→重读→恢复edit→verify，共8call/8result，9请求 | [cross-B.json](evidence/cross-B.json)、[fixture结果](evidence/cross-B-file.json)；只操作新fixture，未跑原生Shell |
| C Web步骤变化 | 同Agent先ready可搜，下一Step ready=false只剩checkpoint，再available=false，searchSchema返回但调用UNAVAILABLE；注册保持，Provider实际调用1次 | [cross-C.json](evidence/cross-C.json)、[状态](evidence/cross-C-state.json)；4请求3call，网络0 |
| D MCP统一链 | 本轮重跑H16实际stdio两项及两个5/7call真实Loop组合；Scope禁止write且server写计数0；远端错误/断连/释放 | 直接复用本轮h16-tests.tap与H16 demo raw，不再新增同义测试计数 |

所有新Loop每请求从当时前缀用第二真实Session重建messages/config/tools/toolHistory，同时保留Loop与Adapter两侧输入；不能拿最终日志替代当时请求。运行时观察和Session事实独立保存，资源关闭在finally配对。关闭stdio Client与Server是实际生命周期；没有宣称独立OS进程审计已证明绝无遗留进程。

MCP逐项覆盖：连接/握手✅；两Server发现✅；普通raw名称实际wire✅、规范化名字仅helper✅；工具成功/远端isError✅；Resource按需读与Scope✅（额外scope资源为内存替身）；列表新增与phase1失败留旧✅；禁重连断开注册保留/调用失败✅；一次新PID重连✅；卸载工具/最后资源provider清理✅。phase2注册冲突、完整退避/耗尽、关闭失败/迟到代际、HTTP认证、资源blob和真实图片均静态或NOT_RUN。

历史50份run JSON保留并建立[哈希/命令索引](evidence/historical-runs-index.json)：H13曾36项中3失败，H14曾43中12失败，H15存在初始化失败与29中3失败，H16存在装载失败及23中7/1失败。mutation非零另列，不把历史失败覆盖成绿。当前4个错误答案均确认以AssertionError退出1，原受控失败有效；辅助runner首次bootstrap参数错误导致的非零不记反证，见QA03。

本轮依赖缺口R01：原H15缓存readdirp5.1.1不在固定上游，严格检查应失败；新独立树锁5.0.0后所有包integrity匹配。两分课runner已加整棵文件依赖核验，旧缓存/原报告不改；本轮结果为新依赖证据，不追认旧结果使用过5.0.0。

复现主命令（仓库根）：`node docs/deepseek-harness-v2/module-four-review/scripts/run-labs.mjs`。准备文件依赖可运行`python docs/deepseek-harness-v2/module-four-review/scripts/prepare-dependencies.py`后在打印出的**隔离目录**执行npm固定安装；既有H04/H09/H16锚点见各课README和dependencies.json。`run-aux.mjs`复核4负例、H15/H16 demo及旧依赖拒绝。原命令、cwd和env以raw JSON为准，不在项目业务依赖中安装Harness。
