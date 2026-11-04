from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parents[1];P=R.parents[2];C='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
# path, exact implementation anchor, span, actual symbol/branch, conclusion, evidence, level
ROWS=[
('llm/llm/src/types.ts','export interface LlmFailure {',19,'LlmFailure','code是开放string；status、重试延迟、requestId是不同事实','A/X；真实HTTP未验','D'),
('llm/llm/src/index.ts','export class LlmError extends HarnessError',48,'LlmError','校验并冻结结构化failure；不是解析message决定策略','A:rate-limit/auth/adapter-aborted','D'),
('llm/llm-deepseek/src/transport.ts','export function providerError(',31,'providerError','HTTP分类有优先级；Retry-After秒或日期转有效正毫秒','源码/官方测试选读；HTTP网络未执行','STATIC'),
('llm/llm/src/adapter-failure.ts','export function normalizeLlmFailure(',17,'normalizeLlmFailure','只信验证过且code一致的自有failure数据，普通Error回UNKNOWN','A:partial/raw-stream；恶意对象矩阵静态','D'),
('llm/llm/src/index.ts','private async * adapterStream(',90,'adapterStream','最终Adapter边界选择/调用/迭代错误转终止分片，退出清理仍可抛','A:raw-stream/partial','D'),
('llm/llm/src/index.ts','private streamWithRegistration(',10,'streamWithRegistration','llm/stream middleware在Adapter规范化边界外','A:middleware','D'),
('llm/llm/src/index.ts','const retryPolicy = adapter.providerRetryPolicy(provider)',8,'prepareRoutes policy branch','默认normal在路由登记时捕获，不等于自动安装执行插件','A:budget/no-plugin','D'),
('llm/llm/src/index.ts','async prepareCall(\n    config:',58,'LlmRuntime.prepareCall','准备句柄绑定适配器/策略，一次dispatch；每次重试重新准备','A计数与源码；重复dispatch拒绝静态','D'),
('llm/llm/src/retry-policy.ts','const DEFAULT_MAX_RETRIES =',13,'default constants','5次重试/500/10000/.1与五类默认错误','policyBoundary；A:budget','C/D'),
('llm/llm/src/retry-policy.ts','export interface NormalRetryPolicyConfig',47,'RetryPolicyConfig / ResolvedRetryPolicy','normal有预算与合格码，always无这两个限制','policyBoundary；A:always','C/D'),
('llm/llm/src/retry-policy.ts','function resolveBackoff(',28,'resolveBackoff','正且有限延迟、初始不大于上限、抖动0..1','policyBoundary部分；完整输入矩阵静态','C'),
('llm/llm/src/retry-policy.ts','export function resolveRetryPolicy(',67,'resolveRetryPolicy','normal拒绝坏预算/重复码，always忽略遗留normal字段','policyBoundary','C'),
('llm/llm-retry/src/index.ts','function validateConfig(',10,'validateConfig','执行插件无配置，retryPolicy属于Provider','源码静态；未单列安装拒绝测试','STATIC'),
('llm/llm-retry/src/index.ts','export interface RetryInternals',5,'RetryInternals','random是官方非序列化测试钩子，不是产品配置字段','A:jitter；support','D'),
('llm/llm-retry/src/index.ts','function localDelay(',7,'localDelay','先指数封顶，再对称抖动，再封顶；零下界合法','A:jitter/budget；零下界官方测试静态','D'),
('llm/llm-retry/src/index.ts','function retryPolicyKey(',13,'retryPolicyKey','完整行为字段入key；normal错误码排序按集合成员语义','A预算实际；完整key变更矩阵静态','D'),
('llm/llm-retry/src/index.ts','function retryStateKey(',3,'retryStateKey','状态键是provider与policyKey，不是全局固定预算','C保存事实；多Provider组合本轮静态','STATIC'),
('llm/llm-retry/src/index.ts','function cancellableDelay(',16,'cancellableDelay','取消移除timer；已取消信号不安排timer','B:backoff/handle-dispose/plugin-dispose','D'),
('llm/llm-retry/src/index.ts','const projectionReady = ctx.sessionProjections.register(',16,'llmRetry projection','step/start或turn/end清状态；相同retryId/retry重复fold不变','A/C；重复fold官方测试静态','D'),
('llm/llm-retry/src/index.ts','function track(',6,'track','登记活动恢复Promise，最终移出以供释放排空','B:delegated/plugin-dispose','D'),
('llm/llm-retry/src/index.ts',"agent.session.append('llm/retry', eventData)",4,'backoff commit/wait','先Session提交计划再等待；此处没有flush屏障','A:rate-limit；C真实flush另验','D'),
('llm/llm-retry/src/types.ts','export type LlmRetryEventData',30,'LlmRetryEventData / LlmRetryStartedEventData','RetryId关联计划与等待完成；两者仅日志','A/C/X','D'),
('llm/llm-retry/src/index.ts',"if (policy === undefined) return next()",6,'recover policy/activation guard','无捕获策略委派；投影就绪与取消/生命周期检查在写事件前','无最终Adapter与激活矩阵静态','STATIC'),
('llm/llm-retry/src/index.ts',"if (policy.mode === 'always') {",21,'recover always branch','先结算下游；retry决策优先，错误可告警后回退；取消胜出','A:downstream/downstream-error；B:delegated','D'),
('llm/llm-retry/src/index.ts',"} else if (!policy.retryableCodes.includes(failure.code))",10,'recover normal admission','不合格码/耗尽委派，不是强制全链失败','A:auth/quota/budget；下游组合','D'),
('llm/llm-retry/src/index.ts','if (failure.providerRetryAfterMs !== undefined',17,'recover provider delay branch','范围内原样接受；超上限normal委派、always本地退避','A:retry-after/over-cap/always-over-cap','D'),
('llm/llm-retry/src/index.ts','const disposeListener = ctx.on(',17,'apply disposal effect','先注销再abort和allSettled活动恢复，陈旧回调也拒绝','B:plugin-dispose/delegated；陈旧回调静态','D'),
('core/agent-loop/src/agent.ts','private async preStep(',34,'ReactLoopAgent.preStep','领取、模型选择、工具准入、assemble在Step之前','A计数；B:before-request','D'),
('core/agent-loop/src/agent.ts','private async step(',45,'ReactLoopAgent.step attempt loop','保留assembly与toolSet，不重pre-step；刷新运行时上下文','A:rate-limit/partial计数；刷新完整矩阵静态','D'),
('core/agent-loop/src/agent.ts','if (firstAttempt) {',16,'step firstAttempt admission','已接纳用户批次只在首次Attempt提交一次','A全部Loop分支','D'),
('core/agent-loop/src/agent.ts',"if (finish.kind === 'error' || finish.kind === 'aborted')",24,'step request-error branch','失败Attempt先提交，再Waterfall；retry在同Step循环内','A:rate-limit/budget；X','D'),
('core/agent-loop/src/agent.ts','} catch (error: unknown) {\n        if (!started)',42,'step thrown stream settlement','真正取消才保留安全块；普通抛错只留Attempt不走终止恢复分支','A:middleware；B:stream-prefix/stream-empty','D'),
('core/agent-loop/src/assistant-stream.ts','settle(',28,'AssistantStreamAttempt.settle','先append成功才发committed end；失败发abandoned','B:stream-prefix；提交失败完整矩阵静态','D'),
('llm/llm/src/assembler.ts','interruptedBlocks():',12,'BlockAssembler.interruptedBlocks','仅非空text/reasoning，不保留tool-call或未知块','B:stream-prefix/stream-empty；reasoning静态','D'),
('core/agent-loop/src/agent.ts','cancel(cause:',8,'ReactLoopAgent.cancel','默认清Inbox；keepInbox保留；当前活动abort','B:inbox-clear/inbox-keep','D'),
('core/agent/src/runtime-types.ts','export interface CancelOptions',8,'CancelOptions','保留待处理输入不表示自动恢复当前已取消活动','B:inbox-keep','D'),
('core/agent-loop/src/agent.ts','async whenIdle():',6,'ReactLoopAgent.whenIdle','追踪替换后的activityDone，等真正活动停稳；不代表成功','B:tool-after/parallel/delegated','D'),
('core/agent-loop/src/agent.ts','private async kick():',14,'ReactLoopAgent.kick','容纳已报告错误/取消，驱动器回idle，实例仍可接后续任务','B:inbox-keep；C新任务','D'),
('core/agent-loop/src/agent.ts','const cause = abortedCancelCause(signal)',24,'turn ending classification','signal取消决定aborted；Adapter ABORTED码本身可最终error','A:adapter-aborted；B取消','D'),
('core/agent-loop/src/index.ts','// Disposal IS a disposed-cause cancel',35,'initializeAgent teardown','Handle释放先disposed取消并等idle，再scope与writer关闭','B:handle-dispose；C关闭后重读','D'),
('core/tools/src/pipeline.ts','async prepare(input:',43,'ToolExecutionPipeline.prepare','取消在主体前被拒；pre/审批/guard后再次检查取消','B:tool-before/tool-policy','D'),
('core/tools/src/pipeline.ts','private async dispatchToolBody(',28,'dispatchToolBody','原caller与wrapper信号融合；主体Promise排空后才结算','B:tool-after；wrapper替换信号分支静态','D'),
('core/tools/src/pipeline.ts','async complete(exec:',29,'complete','取消可替换成功，但已有工具错误保留；观察与日志提交不同','B:tool-business/tool-policy/parallel','D'),
('core/tools/src/batch.ts','async function runGroup(',120,'runGroup','停止补位，排空已启动，按模型顺序提交；调度失败先排空','B:parallel；调度器故障组合静态','D'),
('core/tools/src/batch.ts','skip(block:',13,'BatchSettlement.skip','未启动项也记录合成call与BEFORE_DISPATCH结果对','B:parallel；X原任务','D'),
('core/session/src/repair.ts','observe(event:',43,'ToolCallRecovery.observe','只追当前Step待答提议，已提交结果移除，关闭Step清待答','D:result/closed-step','C'),
('core/session/src/repair.ts','results():',49,'ToolCallRecovery.results','开始有无决定UNKNOWN/NOT_STARTED，保持提议顺序与来源','D:not-started/unknown；X','C/D'),
('core/session/src/repair.ts','export function openTurnClosers(',55,'openTurnClosers','仅开放尾Turn补工具结果再Step/Turn结束，原前缀不改','D全部；X真实Resume','C/D'),
('core/session/src/repair.ts','export function interruptedTurnClosers(',3,'interruptedTurnClosers','崩溃修复不是执行工具，返回普通合成事件批次','D；X effects仍1','C/D'),
('core/agent-loop/src/index.ts','private resumeWith(',85,'AgentLoop.resumeWith','取得writer、读有效日志、追加语义修复、重建后发布','C与X真实JSONL；新进程未验','D'),
('compaction/compaction-basic/src/index.ts',"ctx.on('agent/request-error'",53,'Basic request-error listener','规范Overflow与replaceGeneration进展及独立上限决定retry','A:compaction-normal/compaction-always','D'),
('core/agent/src/runtime-types.ts',"'agent/request-error'",24,'Events agent/request-error','失败请求载荷带精确位置/Provider/策略/signal，Waterfall返回动作','A/B；非Adaptermiddleware不进入','D'),
('core/session/src/types.ts',"'turn/end':",8,'SessionEventMap turn/end','whenIdle/Turn结束不自带统一flush；检查点由参与后端与策略承担','C/X显式flush；源码约定','D'),
('core/session/src/types.ts',"export type AgentCancelCause",14,'AgentCancelCause','user/parent/hook/disposed为运行取消原因；不是任意HTTP错误码','B；parent传播完整树留H21','D'),
('core/agent-loop/src/agent.ts','for (const event of toolRecovery.results())',17,'turn live-step repair/finally','活Step失败先保守补结果再step/end，不重执行未完成工具','D组件；Loop分支源码，X恢复路径独立','C/STATIC'),
('core/tools/src/pipeline.ts','executionMode(exec:',12,'executionMode','抛错/非true并发分类失败关闭为exclusive，不能冒称调度器必抛','源码与H14历史证据；本轮未注入该类故障','STATIC'),
]
lock=json.loads((R/'evidence/source-lock.json').read_text(encoding='utf-8'));src=Path(lock['sourceCache']);data=[]
for n,(suffix,needle,span,symbol,claim,test,level) in enumerate(ROWS,1):
 path='packages/'+suffix;p=src/path;s=p.read_text(encoding='utf-8');assert needle in s,(path,needle)
 start=s[:s.index(needle)].count('\n')+1;end=min(start+span-1,len(s.splitlines()));url=f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/{path}#L{start}-L{end}'
 data.append(dict(id=f'S{n:02}',commit=C,path=path,start=start,end=end,symbol=symbol,claim=claim,test=test,level=level,url=url,sourceSha256=hashlib.sha256(p.read_bytes()).hexdigest()))
(R/'evidence/source-assertions.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
text='# H20 固定源码断言\n\n固定Commit '+C+'。动态等级只覆盖列明用例；STATIC不是A–E执行等级。混合行明确区分静态分支与实际组件行为，字节/行号正确不代替语义审阅。\n\n|ID|固定源码与实际符号/分支|教学结论|本轮证据/边界|等级|\n|---|---|---|---|---|\n'
for d in data:text+=f"|{d['id']}|[{d['path']}:{d['start']}]({d['url']}) · {d['symbol']}|{d['claim']}|{d['test']}|{d['level']}|\n"
(R/'source-checklist.md').write_text(text,encoding='utf-8')
p=P/'course-content/internal/deepseek-harness/h20/lesson.md'
if p.exists():
 s=p.read_text(encoding='utf-8')
 for d in data:s=s.replace('{{'+d['id']+'}}',f"[{d['id']} · {d['symbol']}]({d['url']})")
 p.write_text(s,encoding='utf-8')
print(len(data),'semantic source assertions written')
