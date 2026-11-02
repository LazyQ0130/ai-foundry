# 源码断言逐项索引

机器检查仅证明固定字节/范围/片段；语义裁决见统一模型、安全审查与跨课一致性。

| 课/编号 | 原断言 | 固定源码 | 验证/边界 |
|---|---|---|---|
| h13/S01 | ToolsService 是 Cordis Service，ctx.tools 提供访问 | `packages/core/tools/src/index.ts:99–114` | STATIC； |
| h13/S02 | ToolDefinition 继承声明，但包含执行/输出/展示信息 | `packages/core/tools/src/contracts.ts:26–100` | STATIC； |
| h13/S03 | output 的 schema/render/presentationMeta 分工 | `packages/core/tools/src/contracts.ts:16–25` | STATIC； |
| h13/S04 | projectContent 是策略前内容投影，finalizeContent 是最后内容转换 | `packages/core/tools/src/contracts.ts:49–64` | STATIC； |
| h13/S05 | timeoutMs 只声明正有限合作预算，不会由登记自动计时 | `packages/core/tools/src/contracts.ts:63–69` | STATIC； |
| h13/S06 | 截止时间由专用策略包装提供 | `packages/guard/timeout-policy/src/index.ts:55–80` | STATIC； |
| h13/S07 | isConcurrencySafe 是分类器，不是全局安全证明 | `packages/core/tools/src/contracts.ts:83–85` | STATIC； |
| h13/S08 | Host presenters 是纯展示；入参软校验失败回退 | `packages/core/tools/src/schema.ts:614–637` | STATIC； |
| h13/S09 | 内置 Web Client 不直接消费 Host presenter | `docs/cookbook/adding-a-tool.zh.md:95–103` | STATIC； |
| h13/S10 | ValueSchemaSpec 的节点与 oneOf | `packages/core/tools/src/schema.ts:86–102` | STATIC； |
| h13/S11 | 隐式参数根开放，required 属于属性 | `packages/core/tools/src/schema.ts:450–463` | STATIC； |
| h13/S12 | 显式 object 必须声明 additionalProperties | `packages/core/tools/src/schema.ts:366–396` | STATIC； |
| h13/S13 | enum / const 必须是正确标量且相容 | `packages/core/tools/src/json-schema.ts:352–377` | STATIC； |
| h13/S14 | raw 支持关键字被显式限制，注解不强制业务约束 | `packages/core/tools/src/json-schema.ts:227–392` | STATIC； |
| h13/S15 | exact-one 判断命中次数，number 与 integer 会重叠 | `packages/core/tools/src/json-schema.ts:522–527` | STATIC； |
| h13/S16 | json 接受无损 JSON，不接受非 JSON 对象或非有限值 | `packages/core/tools/src/json-schema.ts:548–552` | STATIC； |
| h13/S17 | required 检查自有属性，closed 对象拒绝额外键 | `packages/core/tools/src/json-schema.ts:561–594` | STATIC； |
| h13/S18 | 精确类型推断有16层容器边界 | `packages/core/tools/src/schema.ts:155–173` | STATIC； |
| h13/S19 | validateArgs 接受作者参数映射，返回诊断列表 | `packages/core/tools/src/schema.ts:479–481` | STATIC； |
| h13/S20 | defineTool 编译一次；execute 包装校验输入后调用主体 | `packages/core/tools/src/schema.ts:555–612` | STATIC； |
| h13/S21 | 直接调 execute 不证明输出已验证 | `packages/core/tools/src/schema.ts:601–603` | STATIC； |
| h13/S22 | 投影只选 name/description/parameters/deferLoading | `packages/core/tools/src/schema.ts:641–646` | STATIC； |
| h13/S23 | 注册校验 output、timeout 和保留名，并走层 Effect | `packages/core/tools/src/index.ts:128–153` | STATIC； |
| h13/S24 | 同一层重复名称失败，精确 disposer 移除原登记 | `packages/core/scope/src/store.ts:30–90` | STATIC； |
| h13/S25 | Context 同时决定登记可见层和 Fiber 归属 | `packages/core/scope/src/store.ts:224–267` | STATIC； |
| h13/S26 | Scope 父链显式绑定且检查环 | `packages/core/scope/src/index.ts:72–82` | STATIC； |
| h13/S27 | createScope 建立带 tag 上下文与配对释放 | `packages/core/scope/src/index.ts:137–150` | STATIC； |
| h13/S28 | Scope 仅路由受信任同进程贡献，不是安全边界 | `packages/core/scope/README.zh.md:58–62` | STATIC； |
| h13/S29 | restriction 需要 scoped Context 与已知继承名 | `packages/core/tools/src/index.ts:162–189` | STATIC； |
| h13/S30 | view 合并祖先，过滤继承，再叠加自身登记 | `packages/core/tools/src/index.ts:199–234` | STATIC； |
| h13/S31 | 多个限制取交集，名称列表编译为独立集合 | `packages/core/tools/src/index.ts:79–88` | STATIC； |
| h13/S32 | get 是检查；executable 无 set 排除条件工具 | `packages/core/tools/src/index.ts:239–269` | STATIC； |
| h13/S33 | 条件上下文是 agent / 捕获模型 / signal | `packages/core/tools/src/contracts.ts:105–125` | STATIC； |
| h13/S34 | resolve 顺序等待，false 排除，throw 包装且不交部分集合 | `packages/core/tools/src/index.ts:264–284` | STATIC； |
| h13/S35 | set 读时检查 exact agent、当前注册记录及 definition 身份 | `packages/core/tools/src/index.ts:287–305` | STATIC； |
| h13/S36 | dispose 关闭 set，不注销定义 | `packages/core/tools/src/index.ts:283–288` | STATIC； |
| h13/S37 | definitions/schemas 的 set 可选，schemas 深复制参数 | `packages/core/tools/src/index.ts:305–326` | STATIC； |
| h13/S38 | Registry 委托最近作用域执行器处理原始批次 | `packages/core/tools/src/index.ts:375–381` | STATIC； |
| h13/S39 | ToolExecutor 有 describe 和 execute 两项核心入口 | `packages/core/tools/src/executor.ts:64–91` | STATIC； |
| h13/S40 | Native describe 逐个投影当前能力 | `packages/core/tool-executor-native/src/index.ts:15–18` | STATIC； |
| h13/S41 | PTC describe 只给 run_code，SDK 另使用当前定义 | `packages/core/tool-executor-ptc/src/index.ts:41–54` | STATIC； |
| h13/S42 | ToolsService 构造时贡献 SystemPrompt 工具 provider | `packages/core/tools/src/index.ts:113–117` | STATIC； |
| h13/S43 | SystemPrompt 独立收集复制排序工具，文本 waterfall 不拥有声明 | `packages/core/system-prompt/src/index.ts:619–697` | STATIC； |
| h13/S44 | Loop 捕获 selection，resolve 先于 assembly | `packages/core/agent-loop/src/agent.ts:292–317` | STATIC； |
| h13/S45 | 同 Step retry 复用 decision/assembly，只有明确 retry 决策才继续 | `packages/core/agent-loop/src/agent.ts:435–595` | STATIC； |
| h13/S46 | Step 结束释放 set，包括失败路径 | `packages/core/agent-loop/src/agent.ts:392–395` | STATIC； |
| h13/S47 | Loop 把 ToolCallBlock 与本步 set 交给真实执行器 | `packages/core/agent-loop/src/agent.ts:592–597` | STATIC； |
| h13/S48 | Runtime 对不支持 toolUpdate 的路线过滤 developer 消息 | `packages/llm/llm/src/content.ts:424–436` | STATIC； |
| h13/S49 | 输出验证、快照与渲染由真实共享流水线完成 | `packages/core/tools/src/pipeline.ts:537–570` | STATIC； |
| h13/S50 | 规范 value 仅执行期，不作为持久事件值全存 | `packages/core/tools/src/contracts.ts:322–334` | STATIC； |
| h13/S51 | ToolCallBlock 的 id/name 与 arguments 字符串 | `packages/llm/llm/src/types.ts:112–124` | STATIC； |
| h13/S52 | ToolResultMessage 用 toolCallId 关联并保留 content/isError | `packages/llm/llm/src/message.ts:173–184` | STATIC； |
| h13/S53 | ToolRuntime 是 ToolsService 的导出别名 | `packages/core/tools/src/index.ts:412–412` | STATIC； |
| h14/S01 | Loop提取已结算消息中的ToolCallBlock整批分派 | `packages/core/agent-loop/src/agent.ts:586–612` | D； |
| h14/S02 | ToolsService选择最近作用域执行器并委托批次 | `packages/core/tools/src/index.ts:357–384` | D； |
| h14/S03 | ToolBatchInput携带calls/signal/agent/toolSet/log/上限 | `packages/core/tools/src/executor.ts:19–62` | C/D； |
| h14/S04 | Native execute使用真实executeToolBatch | `packages/core/tool-executor-native/src/index.ts:19–22` | C/D； |
| h14/S05 | JSON坏文本保留，空串变对象 | `packages/core/tools/src/batch.ts:99–107` | C/STATIC； |
| h14/S06 | 注册表与单项流水线/主体层次不同 | `packages/core/tools/src/pipeline.ts:62–86` | C； |
| h14/S07 | 参数在pre前分离快照并深冻结 | `packages/core/tools/src/pipeline.ts:153–171` | C； |
| h14/S08 | token为每次执行铸造的Symbol身份 | `packages/core/tools/src/pipeline.ts:691–693` | C； |
| h14/S09 | 执行身份字段readonly是契约，整个exec最终才冻结 | `packages/core/tools/src/contracts.ts:174–248` | C； |
| h14/S10 | Schema验证在defineTool执行包装，不在prepare中完成 | `packages/core/tools/src/schema.ts:598–603` | C； |
| h14/S11 | prepare先查可见定义并捕获project/finalize回调 | `packages/core/tools/src/pipeline.ts:126–155` | C； |
| h14/S12 | prepare前置取消与普通pre取消走不同标签 | `packages/core/tools/src/pipeline.ts:190–233` | C； |
| h14/S13 | 前置决策allow/deny/cancel/ask | `packages/core/tools/src/contracts.ts:357–362` | C； |
| h14/S14 | ask解析只有allowed-once放行，其他拒绝 | `packages/core/tools/src/pipeline.ts:432–494` | C/STATIC； |
| h14/S15 | 守卫在最终前置allow之后检查 | `packages/core/tools/src/pipeline.ts:213–235` | C； |
| h14/S16 | guard只拒绝或不表态，首个reason停止 | `packages/core/tools/src/index.ts:393–404` | C； |
| h14/S17 | 普通Waterfall短路不跳过已进入外层 | `vendor/cordis/src/events.ts:235–243` | C； |
| h14/S18 | dispatch前重新核当前定义与本步准入 | `packages/core/tools/src/pipeline.ts:258–291` | C/STATIC； |
| h14/S19 | around默认next为dispatchToolBody，包住结果 | `packages/core/tools/src/pipeline.ts:295–337` | C； |
| h14/S20 | 原caller signal重新与wrapper信号融合 | `packages/core/tools/src/pipeline.ts:714–749` | C； |
| h14/S21 | 调用方取消不能抛弃已开始body Promise | `packages/core/tools/src/pipeline.ts:275–284` | C； |
| h14/S22 | timeoutMs不是自动强制截止 | `packages/guard/timeout-policy/src/index.ts:55–80` | STATIC； |
| h14/S23 | 输出先快照/校验/冻结，再render和meta | `packages/core/tools/src/pipeline.ts:537–570` | C； |
| h14/S24 | deferContext合入执行返回结果而非提前写Session | `packages/core/tools/src/pipeline.ts:304–324` | D； |
| h14/S25 | complete按final/post标签决定是否project/post | `packages/core/tools/src/pipeline.ts:336–371` | C； |
| h14/S26 | projectContent在post前，只替换内容 | `packages/core/tools/src/pipeline.ts:348–360` | C； |
| h14/S27 | post决策accept content/value互斥，block为失败 | `packages/core/tools/src/contracts.ts:367–371` | C/STATIC； |
| h14/S28 | 内容替换保留value/meta，不能当保密改值 | `packages/core/tools/src/pipeline.ts:486–536` | C； |
| h14/S29 | 换value须成功且定义仍存在，再校验render/meta | `packages/core/tools/src/pipeline.ts:508–524` | C； |
| h14/S30 | block丢原成功value/meta及原上下文 | `packages/core/tools/src/pipeline.ts:492–502` | C/D； |
| h14/S31 | finalize前后物化；finalizer失败不重跑 | `packages/core/tools/src/pipeline.ts:374–394` | C； |
| h14/S32 | 工具finalizer仅内容转换 | `packages/core/tools/src/pipeline.ts:392–397` | C； |
| h14/S33 | tools/result最终冻结exec并容纳观察失败 | `packages/core/tools/src/pipeline.ts:400–425` | C； |
| h14/S34 | 原始结果规范化与权威快照不等于持久保存value | `packages/core/tools/src/pipeline.ts:591–611` | C/D； |
| h14/S35 | 并发仅exact true；未知/无声明/分类错误为独占 | `packages/core/tools/src/pipeline.ts:105–117` | D； |
| h14/S36 | 上限覆盖必须正整数，在try之前RangeError | `packages/core/tools/src/batch.ts:56–59` | C； |
| h14/S37 | 调度失败partial只含已commit，abort停止补位 | `packages/core/tools/src/batch.ts:74–105` | C/D； |
| h14/S38 | commitReady只沿连续模型序列complete/提交 | `packages/core/tools/src/batch.ts:139–152` | D； |
| h14/S39 | 有界滚动池按在途数补位，不必等整组 | `packages/core/tools/src/batch.ts:186–203` | D； |
| h14/S40 | 后续项启动前重分类，遇独占留给下一组 | `packages/core/tools/src/batch.ts:191–195` | D； |
| h14/S41 | 调度失败先allSettled在途dispatch再拒绝 | `packages/core/tools/src/batch.ts:221–224` | C； |
| h14/S42 | 取消未启动项走skip合成，不调用pipeline观察 | `packages/core/tools/src/batch.ts:271–284` | C/D； |
| h14/S43 | log存在才在prepare前记录tool/call原始参数 | `packages/core/tools/src/batch.ts:243–253` | D； |
| h14/S44 | commit写tool角色消息、error.info/meta与源seq | `packages/core/tools/src/batch.ts:252–274` | D； |
| h14/S45 | 普通Error不一定有结构化code | `packages/core/tools/src/pipeline.ts:682–691` | C； |
| h14/S46 | ToolBatchExecutionError保留cause与partial | `packages/core/tools/src/executor.ts:89–95` | C； |
| h14/S47 | 两种取消代码按定义execute包装调用状态选 | `packages/core/tools/src/pipeline.ts:244–252` | C； |
| h14/S48 | 追加next-step上下文后按concluded设置step结束原因 | `packages/core/agent-loop/src/agent.ts:592–608` | D； |
| h14/S49 | Loop有nextStep材料时可继续，concluded不跳剩余批次 | `packages/core/agent-loop/src/agent.ts:395–405` | D； |
| h14/S50 | Loop内部失败在关闭Step前修复未结算调用 | `packages/core/agent-loop/src/agent.ts:376–396` | D； |
| h14/S51 | 修复依记录的callSeq区分未知与未启动 | `packages/core/session/src/repair.ts:167–202` | D； |
| h14/S52 | 运行时工具事件与会话事实不是同一个通知 | `packages/core/tools/src/events.ts:49–58` | C/D； |
| h14/S53 | 完整Loop输入与Adapter能力投影须分开 | `packages/llm/llm/src/content.ts:424–436` | D； |
| h15/S01 | 实验软件尚未安全审计；本课不升级其保证 | `SAFETY.zh.md:5–13` | STATIC；static |
| h15/S02 | minimal Profile不意味着最小文件权限 | `packages/bundle/sdk-minimal/cordis.patch.yml:71–79` | STATIC；static |
| h15/S03 | Pipeline最终ask才调审批，缺服务/Agent拒绝 | `packages/core/tools/src/pipeline.ts:434–455` | D；B_ask-missing / B_ask-allow |
| h15/S04 | 闭合policy；取消先于never，应答者不能绕过never | `packages/interaction/user-approval/src/index.ts:66–307` | C；A_never / A_pre-abort / C deployment never |
| h15/S05 | 应答Waterfall路由、缺失、同步异步异常和非法结果失败关闭 | `packages/interaction/user-approval/src/index.ts:306–320` | C；A_missing / A_throw-sync / A_throw-async / A_invalid / A_delegate |
| h15/S06 | Turn前提与正常审计配对；提交前故障不返回grant | `packages/interaction/user-approval/src/index.ts:242–265` | C；A_idle / A_closed / A_audit-fail |
| h15/S07 | 审批ID服务生成；callId关联调用，不传req.id | `packages/interaction/user-approval/src/index.ts:126–261` | C；A_allow / repeated-approval-audit |
| h15/S08 | 取消先结算，迟到答案为settled Promise no-op | `packages/interaction/user-approval/src/index.ts:321–336` | C；A_late；提交后观察失败仅静态 |
| h15/S09 | 会话override优先配置；effectivePolicy在实现中private | `packages/interaction/user-approval/src/index.ts:268–277` | C；A_policy / C deployment never；私有诊断 |
| h15/S10 | 运行时policy上下文与setPolicy切换说明分工 | `packages/interaction/user-approval/src/index.ts:189–221` | C；A_policy；setPolicy仅静态 |
| h15/S11 | pre决策、ask解析后仅allow检查guard | `packages/core/tools/src/pipeline.ts:197–219` | D；B_override-deny / B_override-guard / B_approved-guard |
| h15/S12 | 最终观察与Session提交是两种事件，日志需单独接线 | `packages/core/tools/src/pipeline.ts:407–415` | D；B_*；Session tool/result沿H14，非本轮集成 |
| h15/S13 | 三种mode只定义文件效果；danger绕过 | `packages/sandbox/sandbox/src/index.ts:25–36` | STATIC；static + C policy（不执行danger） |
| h15/S14 | 逐调用覆盖 > Session > default | `packages/sandbox/sandbox-policy/src/index.ts:198–206` | D；C_policy |
| h15/S15 | 会话cwd胜过回退root，保留执行世界路径 | `packages/sandbox/sandbox-policy/src/index.ts:158–207` | D；C_policy |
| h15/S16 | sandbox/mode持久事件；单次不写事件 | `packages/sandbox/sandbox-policy/src/session-mode.ts:52–55` | D；C_policy aEvents / bEvents / replay |
| h15/S17 | 额外根严格物理目录校验，workspace仅canonicalPath | `packages/sandbox/sandbox/src/roots.ts:33–90` | D；C_policy invalidRoot；链接/非目录未实测 |
| h15/S18 | workspace-write含临时区域；Windows不支持extra roots | `packages/sandbox/sandbox/src/roots.ts:97–100` | D；C_policy allWritable；Windows拒绝额外根静态 |
| h15/S19 | Provider返回argv/完整度/诊断，consumer spawn | `packages/sandbox/sandbox/src/index.ts:101–197` | D；C_policy reports（模拟探测） |
| h15/S20 | 平台链、单候选免仲裁、不可用拒绝 | `packages/sandbox/sandbox-local/src/index.ts:158–524` | D；C_policy reports；原生未运行 |
| h15/S21 | Windows partial边界与两种授权生命周期 | `packages/sandbox/sandbox-local/src/index.ts:186–282` | STATIC；静态；C_policy windows-partial仅模拟argv |
| h15/S22 | bash消费者区分runner失败和策略拒绝，不静默裸跑 | `packages/shell/bash-sandbox/src/index.ts:119–128` | STATIC；仅静态，不执行Shell |
| h15/S23 | 观察插件无IO，按owner/target存状态 | `packages/fs/fs-observation-policy/src/index.ts:26–46` | D；D_files |
| h15/S24 | 未见/缺失write防护创建；edit分别拒绝 | `packages/fs/fs-observation-policy/src/index.ts:67–91` | D；D_files create-unseen / missing-edit / same-create-cannot-overwrite |
| h15/S25 | fs意图单槽且默认无guard，不是单调交集 | `packages/fs/fs/src/index.ts:50–73` | D；D_files plugin-unloaded；错误抢槽仅静态 |
| h15/S26 | 观察内存按对象身份，卸载清空并移除监听 | `packages/fs/fs-observation-policy/src/index.ts:56–130` | D；D_files restored-same-id / remount-lost-state |
| h15/S27 | bare可省略expected；受限fs替换local | `packages/fs/fs-sandbox/src/index.ts:53–62` | D；D_files |
| h15/S28 | targetKey不透明；展示与process坐标分开 | `packages/fs/fs/src/types.ts:58–73` | STATIC；静态；D使用真实resolve不解析key |
| h15/S29 | mutation围栏按模式重新resolve并检查包含 | `packages/fs/fs-sandbox/src/index.ts:123–141` | D；D_files read-only-denied；越界/别名攻击未运行 |
| h15/S30 | 可信路径围栏，接受剩余祖先链接TOCTOU | `packages/fs/fs-sandbox/src/index.ts:9–22` | STATIC；静态威胁模型，未攻击验证 |
| h15/S31 | local变更锁、版本检查、原子发布 | `packages/fs/fs-local/src/index.ts:207–243` | D；D_files normal/stale/refresh + native Windows publication |
| h15/S32 | 相同mode无询问，严格扩大才需approver与agent | `packages/sandbox/sandbox/src/escalation.ts:172–190` | D；C_policy once / narrower / missingApprover |
| h15/S33 | 工具消费者逐次解析，显式参数才发起升权 | `packages/shell/tool-bash/src/index.ts:480–489` | STATIC；静态，不运行Shell或完整工具消费者 |
| h15/S34 | 文件consumer取得意图后传后端；非通用Pipeline阶段 | `packages/fs/tool-fs/src/edit.ts:131–140` | STATIC；静态；D_files夹具consumer不同于tool-fs |
| h15/S35 | 确切四种ApprovalOutcome | `packages/interaction/user-approval/src/types.ts:30–38` | C；A_allow/reject/cancel-answer/unavailable |
| h15/S36 | policy helper先验证再append | `packages/interaction/user-approval/src/index.ts:116–127` | STATIC；静态；合法覆盖C已测 |
| h15/S37 | 审批state投影跟踪turn边界 | `packages/interaction/user-approval/src/index.ts:99–109` | C；A_idle/closed |
| h15/S38 | mode只在workspace-write推导写根 | `packages/sandbox/sandbox/src/roots.ts:81–89` | D；C_policy roots |
| h15/S39 | canonical失败保留原写法，非扩大fallback | `packages/sandbox/sandbox/src/roots.ts:61–72` | STATIC；静态；不伪装成extra验证 |
| h15/S40 | full/partial只针对文件效果 | `packages/sandbox/sandbox/src/index.ts:65–73` | D；C_policy reports只测报告 |
| h15/S41 | bwrap与Landlock探测分别返回完整度 | `packages/sandbox/sandbox-local/src/index.ts:533–547` | D；C_policy simulated full/partial |
| h15/S42 | Windows额外根被明确拒绝 | `packages/sandbox/sandbox-local/src/index.ts:369–377` | STATIC；静态，原生未测 |
| h15/S43 | pwsh危险模式绕过provider | `packages/shell/pwsh-sandbox/src/index.ts:97–107` | STATIC；静态，不执行危险模式 |
| h15/S44 | 失效版本先于literal匹配拒绝 | `packages/fs/fs-local/src/index.ts:267–285` | D；D_files stale-edit |
| h15/S45 | 同provider target锁仅进程内串行 | `packages/fs/fs-local/src/index.ts:117–125` | STATIC；D_files顺序路径；并发证明未测 |
| h15/S46 | 本地版本源自stat身份和纳秒元数据 | `packages/fs/fs-local/src/fsio.ts:75–83` | D；D_files opaque版本变化 |
| h15/S47 | createIfAbsent用不替换发布 | `packages/fs/fs-local/src/fsio.ts:647–655` | D；D_files guarded-create |
| h15/S48 | Windows发布使用实际DACL与ReplaceFileW | `packages/fs/fs-local/src/win32.ts:106–128` | D；D_files nativeFilePublication；无原语替身 |
| h15/S49 | 默认清理递归；本实验只替换清理钩子 | `packages/fs/fs-local/src/fsio.ts:623–631` | D；D_files retainedDirectories；逐个明确文件 |
| h15/S50 | 包含判断考虑Windows别名身份 | `packages/fs/fs-sandbox/src/containment.ts:61–76` | STATIC；静态；未做别名或符号链接攻击 |
| h15/S51 | 扩大参数与理由配对，空理由拒绝 | `packages/sandbox/sandbox/src/escalation.ts:51–65` | D；C_policy malformed（缺理由），其余静态 |
| h15/S52 | 严格更宽表不保留持久会话设置 | `packages/sandbox/sandbox/src/escalation.ts:28–206` | D；C_policy once / after / bEvents；不运行danger |
| h16/S01 | 能力三角色；MCP没有通用ctx.mcp | `docs/subsystems/mcp.zh.md:39–47` | STATIC；X组合服务图，三角色属静态架构 |
| h16/S02 | File依赖、开关与附件条件注册 | `packages/fs/tool-fs/src/index.ts:21–92` | D；A_file schemas/readOnlySchemas/image registration |
| h16/S03 | 受限fs继承local，非裸local内置围栏 | `packages/fs/fs-sandbox/src/index.ts:53–62` | D；A真实后端；围栏机制沿H15 |
| h16/S04 | File以当前会话目录解析，相对目录不改变原始workspace | `packages/fs/tool-fs/src/session-cwd.ts:21–25` | D；A/X真实workingDirectory；目录切换仅静态 |
| h16/S05 | read参数/单次stat/流式阈值/观察 | `packages/fs/tool-fs/src/read.ts:57–169` | D；C参数3项；A_file窗口与stream |
| h16/S06 | 窗口源行截断提示与准确总行数 | `packages/fs/tool-fs/src/read-render.ts:68–117` | D；A_file window/verify/length-cap |
| h16/S07 | write整文件与edit字面操作，意图事件交给后端 | `packages/fs/tool-fs/src/edit.ts:131–140` | D；A_file ambiguous/edit/withoutObservation |
| h16/S08 | 图片路线在execute内检查，先于文件IO | `packages/fs/tool-fs/src/read-image.ts:118–280` | D；A_file imageRouteRefusal；解码/存储未运行 |
| h16/S09 | Shell工具与执行器、环境服务分离 | `packages/shell/tool-pwsh/src/index.ts:48–557` | D；B_shell missingExecutor/requests |
| h16/S10 | PowerShell命令argv与每次新进程 | `packages/shell/pwsh-local/src/index.ts:1–9` | STATIC；静态；B为Mock执行器，无原生命令 |
| h16/S11 | shell-env逐调用收集可信DSH变量 | `packages/shell/shell-env/src/index.ts:154–163` | D；B_shell requests；真实父环境清理未测 |
| h16/S12 | 非零退出是描述性结果，基础设施错误可reject | `packages/shell/shell/src/index.ts:49–96` | D；B_shell normal/nonzero/cancelled |
| h16/S13 | Jobs存在时切换后台Schema，缺Jobs运行时仍拒绝 | `packages/shell/tool-pwsh/src/index.ts:524–612` | D；B_shell schemas/withJobsSchemas/withoutJobs/background/jobOutput |
| h16/S14 | 前台可能依Jobs等待，提升和拒绝回退有条件 | `packages/shell/tool-pwsh/src/index.ts:537–553` | STATIC；B仅后台/取消；真实提升/截止仅静态 |
| h16/S15 | Search与Fetch不同请求/结果 | `packages/web/web/src/types.ts:14–83` | D；C_* + X真实服务，内容为内存Fixture |
| h16/S16 | Web Provider注册能力而非模型工具 | `packages/web/web/src/index.ts:103–122` | D；C_unique/explicit + X |
| h16/S17 | 显式ID/唯一可用选择与四错误 | `packages/web/web/src/index.ts:226–248` | D；C_none/ambiguous/configured-missing/configured-unavailable |
| h16/S18 | selectedProviderReady选择失败返回true，缺ready视true | `packages/web/web/src/index.ts:216–225` | D；C_none vs C_not-ready |
| h16/S19 | search配置注册且when影响步骤准入 | `packages/web/tool-web/src/search.ts:361–415` | D；C_not-ready admitted empty；Registry仍有工具 |
| h16/S20 | Search多查询合并/摘要限长与Fetch完整渲染上限 | `packages/web/tool-web/src/fetch.ts:263–338` | D；C_* Fetch500字符、meta.truncated；查询合并仅静态 |
| h16/S21 | 非2xxFetch为结果；工具预算交给可选timeout policy | `packages/web/tool-web/src/index.ts:27–89` | D；C_*404结果；本轮未测真实网络/截止策略 |
| h16/S22 | HTTP(S)传输和同源重定向，无自动浏览器 | `packages/web/web-fetch-http/src/provider.ts:78–115` | STATIC；仅静态，无请求 |
| h16/S23 | 官方文档明确HTTP不限制目的地址 | `docs/subsystems/web.zh.md:134–142` | C；C_* offlineUrlPolicy纯校验接受loopback；无真实访问 |
| h16/S24 | stdio与Streamable HTTP传输分支 | `packages/mcp/mcp-client/src/transport.ts:31–46` | D；D/X真实stdio；HTTP仅静态 |
| h16/S25 | 每服务器异步插件；可选资源与Prompt发布 | `packages/mcp/mcp-client/src/index.ts:32–188` | D；D_mcp + X；无通用ctx.mcp |
| h16/S26 | 公开命名规范化与原始名称线上调用 | `packages/mcp/mcp-client/src/tools.ts:79–145` | D；C命名2项；D alpha/beta rawTool=metadata |
| h16/S27 | 同步先构建再切换，发现失败保留，冲突回滚新代 | `packages/mcp/mcp-client/src/tools.ts:118–162` | D；D refreshed/afterFailedRefresh；phase2冲突仅静态 |
| h16/S28 | 断线关闭重连时保留工具，耗尽才注销 | `packages/mcp/mcp-client/src/connection.ts:211–239` | D；D_mcp断线保留/调用失败；耗尽仅静态 |
| h16/S29 | dispose停止重连并等待同步再注销 | `packages/mcp/mcp-client/src/connection.ts:393–416` | D；D_mcp/X卸载实际关闭stdio |
| h16/S30 | 共享三项资源工具及server/uri/cursor | `packages/mcp/mcp-resources/src/tools.ts:32–58` | D；D_mcp实际list/read；模板分页仅静态 |
| h16/S31 | 资源请求按调用Agent的Scope解析server | `packages/mcp/mcp-resources/src/index.ts:121–129` | D；D hiddenResource/visibleResource（内存scope-only提供方） |
| h16/S32 | 资源blob只在模型文本中替换描述 | `packages/mcp/mcp-resources/src/render.ts:16–24` | STATIC；静态；本轮实际文本资源 |
| h16/S33 | Tool批次日志与运行观察不同 | `packages/core/tools/src/batch.ts:124–262` | D；X真实Session事实 + prefixes + loopRequests/requests |
| h16/S34 | 运行错误机器码在error.info，非error.code | `packages/core/tools/src/pipeline.ts:680–707` | D；A_file与C错误实际断言 |
| h16/S35 | MCP isError转throw，规范value保留content/structuredContent | `packages/mcp/mcp-client/src/tools.ts:295–307` | D；D_mcp remoteError |
| h16/S36 | serverName在注册Scope中保留 | `packages/mcp/mcp-client/src/index.ts:161–175` | STATIC；D使用两个不同namespace；同名Scope复用仅静态 |
| h16/S37 | 初始严格失败可拒绝激活，普通失败可进重连 | `packages/mcp/mcp-client/src/index.ts:198–203` | STATIC；静态；D成功激活，无初始失败注入 |
| h16/S38 | MCP SDK调用携signal和每调用timeout | `packages/mcp/mcp-client/src/tools.ts:138–146` | STATIC；D/X实际调用；超时/取消未测 |
| h16/S39 | 资源请求对断线先拒绝；无resource capability的列表为空 | `packages/mcp/mcp-client/src/connection.ts:367–379` | D；D实际断线resource失败；无能力分支仅静态 |
| h16/S40 | 不支持MCP Prompt模板、资源订阅、任务型桥接 | `docs/subsystems/mcp.zh.md:99–107` | STATIC；静态合同范围，不作关键词执行证明 |
| h16/S41 | tool-web开关和正整数配置验证 | `packages/web/tool-web/src/index.ts:71–103` | STATIC；C_*真实挂载；禁用/非法配置仅静态 |
| h16/S42 | Exa注册Search与稳定ID | `packages/web/web-search-exa/src/provider.ts:17–25` | STATIC；静态，未调用外网API |
| h16/S43 | Perplexity提供方ID与可选content | `packages/web/web-search-perplexity/src/provider.ts:17–25` | STATIC；静态，未运行真实提供方 |
| h16/S44 | DeepSeek辅助Messages搜索提供方 | `packages/web/web-search-deepseek/src/provider.ts:3–33` | STATIC；静态；不混入聊天SDK或最新分支 |
| h16/S45 | DeepSeek API分别注册Search与Fetch | `packages/web/web-deepseek-api/src/index.ts:88–96` | STATIC；静态，认证路线未测 |
| h16/S46 | HTTP稳定ID/不携浏览器cookies | `packages/web/web-fetch-http/src/provider.ts:2–36` | STATIC；静态，无HTTP访问 |
| h16/S47 | stdio环境先scrub再覆盖显式env | `packages/mcp/mcp-client/src/transport.ts:20–28` | STATIC；D/X传隔离入口；未放真实秘密作测试 |
| h16/S48 | Bash本地经subprocess执行，不内置sandbox | `packages/shell/bash-local/src/index.ts:5–23` | STATIC；静态；原生Bash未运行 |
| h16/S49 | 沙箱Shell需要provider/policy，danger直接绕过 | `packages/shell/pwsh-sandbox/src/index.ts:51–105` | STATIC；静态沿H15，未用danger执行 |
| h16/S50 | 观察策略为可选；WeakMap按Session对象 | `packages/fs/fs-observation-policy/src/index.ts:26–34` | D；A unseen/withoutObservation；生命周期细节沿H15 |
| h16/S51 | fs-sandbox可信路径围栏非kernel边界 | `packages/fs/fs-sandbox/src/index.ts:9–22` | STATIC；静态，未测恶意竞态 |
| h16/S52 | WorkingDirectory当前状态与原始header分开 | `packages/session/working-directory/src/index.ts:85–153` | STATIC；A/B/X实际ensure；目录变更/恢复未测 |
| h16/S53 | fetch也以ready作为when | `packages/web/tool-web/src/fetch.ts:514–517` | D；C_not-ready admitted为空 |
| h16/S54 | WebRuntime对Search over-return强制cap | `packages/web/web/src/index.ts:246–253` | D；C_unique sources=2 truncated=true |
| h16/S55 | 外部Web内容显式不可信提示 | `packages/web/tool-web/src/trust.ts:5–7` | D；C/X当前限额下content含提示，非防注入保证 |
| h16/S56 | MCP资源工具由首个provider启用，最后一个撤销 | `packages/mcp/mcp-resources/src/index.ts:86–105` | D；D afterAlpha/afterDispose，scope-only卸载 |
| h16/S57 | 有损公开名追加12位identity hash | `packages/mcp/mcp-client/src/tools.ts:52–91` | C；C命名2项；非任意输入无碰撞证明 |
| h16/S58 | 服务器instructions按Scope归属且不插值 | `packages/mcp/mcp-client/src/server-context.ts:32–40` | STATIC；静态；本地Server未提供instructions |
| h16/S59 | 实际SDK分包版本固定2.2.0 | `packages/mcp/mcp-client/package.json:42–67` | D；D/X实际SDK，lock/integrity核验 |
| h16/S60 | 共享read先确认目标类型并记录缺失 | `packages/fs/tool-fs/src/read-target.ts:24–34` | STATIC；静态；A正常目标实际读取，缺失分支沿H15 |
