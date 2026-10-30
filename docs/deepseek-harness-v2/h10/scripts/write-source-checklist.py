"""人工控制流结论的固定行号索引；生成器只核位置，行为另由C/D执行证据支持。"""
from pathlib import Path
import os,json
R=Path(__file__).resolve().parents[1];C='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
S=Path(os.environ.get('HARNESS_SOURCE_CACHE',r'C:\Users\QYF\.codex\research\harness-v2-source\deepseek-harness-'+C))
A='packages/core/agent-loop/src/agent.ts';I='packages/core/agent-loop/src/inbox.ts';AS='packages/core/agent-loop/src/assistant-stream.ts'
L='packages/core/agent-loop/tests/loop.spec.ts';IT='packages/core/agent-loop/tests/inbox.spec.ts';RE='packages/core/agent-loop/tests/request-error.spec.ts'
# claim, file, lines, symbol, related upstream test (selected, not run), author test, limitation.
rows=[
 ('Phase为idle/maintenance/running，携带不同工作字段',A,53,61,'Phase',L,333,350,'D04','读取私有phase只用于夹具；不是Fiber状态'),
 ('公开status仅idle/running，maintenance也显示idle',A,156,168,'status / setPhase',L,404,426,'D04','公开idle不能判断维护占用'),
 ('idle唤醒先占running再kick，活动中不另开Driver',A,230,251,'wakeDriver',L,1046,1069,'D05/D07','本轮未验证所有重入竞态'),
 ('维护唤醒锁存；结束时复查待办/原因再放行',A,199,220,'runMaintenance',L,404,426,'D04','移除唤醒/维护自身取消组合只选读'),
 ('followup next-turn唤醒；steer next-step唤醒；inject不唤醒',A,170,189,'send / followup / steer / inject',L,1099,1126,'D04/D05/D07','表格按正常未取消活动；运行中用流门定位'),
 ('已abort活动上的唤醒输入转投next-turn并申请尾部唤醒',A,170,177,'send',L,352,381,'STATIC_ONLY','上游相关为维护取消；该精确abort后发送竞态本轮未执行'),
 ('Inbox状态来自Session spliced事实的投影',I,21,64,'inboxProjectionDefinition',IT,85,117,'C01/C02/C03','未执行fork/存储恢复；非作者数组替身'),
 ('领取全next-step后，一个next-turn；先splice后claimed',I,104,112,'claim',IT,174,193,'C01/D04','官方相关是投影观察时机；精确合并顺序由C01实测'),
 ('领取移除不等于user/message接纳，拒绝不自动退回',A,283,317,'preStep',L,1353,1369,'C01/D08','C01无完整Agent；D08使用真实Loop'),
 ('跨列表重复身份拒绝，不新增splice事实',I,186,230,'mutate',IT,234,256,'C02','本课仅选定重复场景；坐标归一化未全面执行'),
 ('clear先next-step再next-turn，以canceled记录',I,97,100,'clear',IT,258,280,'C03/D06-drop-inbox','不同于claim的无canceled移除'),
 ('cancel默认清Inbox/唤醒，keepInbox保留；只abort活动',A,191,197,'cancel',L,352,381,'D06','keep保留尚未领取，不重新入队已领取输入'),
 ('whenIdle跟随活动收敛，不是消息成功回执',A,253,280,'whenIdle / kick',L,1071,1097,'D08/D10','错误报告后仍可回idle；不表示尾部队列耗尽'),
 ('Turn先检查abort，再append turn/start并增加编号',A,327,342,'turn prologue',L,455,489,'D01/D06','pre-start已aborted的零Turn分支仅静态核'),
 ('候选先claim再model.current，选择快照用于本Step',A,283,309,'preStep selection',L,608,620,'D12','模型切换在首次agent/request发生，下一Step生效'),
 ('工具resolve在Prompt assemble之前，两者在pre-step之前',A,287,317,'preStep preparation',L,1325,1351,'D09 + CONTROL_FLOW_READ','D09计次数；严格先后由await控制流核，未独立插入双门'),
 ('pre-step接纳判断早于step/start',A,343,362,'turn admission',L,1353,1369,'D01-reject/D06-pre-step','拒绝与取消用真实Loop观察0边界'),
 ('首次reject保留Turn但零Step，reason blocked并早退',A,347,350,'turn reject',L,1371,1401,'D01-reject/D08','上游相邻是throw非reject，不能混称同一测试'),
 ('首次enter空消息零Step且completed',A,353,359,'turn empty',L,1325,1369,'D01-empty','上游相邻测试不专测empty；作者改写messages验证'),
 ('step/start在prepareRequest之前；准备取消可1Step0请求',A,361,370,'turn step entry',L,846,865,'D06-request','官方相关为上下文取消；作者在agent/request门验证'),
 ('prepareRequest先经中间件，再prepareCall绑定并检查取消',A,613,652,'prepareRequest',RE,35,52,'D06-request/D10 + CONTROL_FLOW_READ','NO_ADAPTER兼容返回proposed只静态审读'),
 ('请求准备/refresh取消检查后，才提交系统提示与接纳消息',A,441,478,'step admission',L,846,865,'D06-request/D06-stream','本课prepare门在agent/request；metadata内部取消未执行'),
 ('firstAttempt使重试不重复接纳用户，候选不重跑',A,441,478,'step attempt loop',L,867,909,'D03/D09','刷新运行上下文仍可有新事实；不是所有状态冻结'),
 ('请求历史从Session derive，冻结本次边界视图',A,656,744,'buildRequest',L,491,525,'D02/D05','断言旧请求未增长、后续1/2工具结果；并非每次有新header'),
 ('实时块先于Assistant结算；settle先append再committed end',AS,49,104,'AssistantStreamAttempt',L,79,124,'C04/D02','C04直接组件；正常完整流另由D02覆盖'),
 ('流取消非空内容记interrupted消息，空内容可记attempt',A,489,539,'step stream catch',L,1403,1427,'D06-stream','实测非空partial；空内容与结算双重失败仅选读'),
 ('error/aborted finish先结算attempt，再问request-error；retry才continue',A,541,564,'step request recovery',RE,54,105,'D01-retry/D01-terminal/D03/D09','LLM Runtime规范化LlmError；不代表任意throw'),
 ('request中间件失败不经过流finish恢复监听器',A,441,445,'step prepare outside stream recovery',RE,35,52,'D10','恢复监听器失败与取消胜过retry未本轮执行'),
 ('正常Assistant结算在工具批次执行之前',A,566,597,'step success',L,491,525,'D02','只读固定文本工具；非文件或Shell'),
 ('max-tokens先返回，不执行截断输出中的工具请求',A,574,587,'step finish guard',L,1520,1571,'D01-max-tokens + STATIC_ONLY','本轮只实测无工具max-tokens；含工具抑制分支仅选读'),
 ('工具执行等待结果，附加上下文入next-step；concluded或null返回',A,586,603,'step tool batch',L,1247,1323,'D01-multi/D02 + STATIC_ONLY','普通反馈实测；concluded/附加上下文/并发调度仅选读'),
 ('Step失败先尝试补缺tool/result，再step/end并释放候选工具集',A,363,392,'turn recovery/finally',L,491,525,'D01/D06 + STATIC_ONLY','边界配对实测；缺结果修复与写失败未执行'),
 ('有停止候选且next-step空才turn-stopping，await后复查',A,394,400,'turn stopping',L,1224,1245,'D05/D11','null普通反馈不逐Step发停止通知；复查由D11 steering证明'),
 ('max-tokens结束候选不会被后来completed降级',A,368,373,'sticky turn ending',L,1449,1500,'D11','D11同Turn两Step；跨Turn不泄漏仅官方选读'),
 ('Turn捕获取消或结构错误，finally记录turn/end reason',A,402,425,'turn catch/finally',L,1851,1876,'D01-terminal/D06/D10','边界append本身失败组合未执行'),
 ('正常尾部有待办则重置信号/Step，下一Turn再开',A,427,432,'turn continuation',L,1774,1794,'D04/D05-followup','reject/empty早退不能套用此尾部耗队列规则'),
 ('真实工具主体异常可规范成错误结果并继续下一Step','packages/core/tools/src/pipeline.ts',258,285,'dispatchToolBody',L,491,525,'D01-tool-error','结果追加见batch.ts 252–265；不等于批次基础设施错误'),
 ('TOOL_NOT_STARTED与TOOL_OUTCOME_UNKNOWN按已记录call区分','packages/core/session/src/repair.ts',105,193,'ToolCallRecovery','packages/core/session/tests/repair.spec.ts',53,82,'STATIC_ONLY','不是副作用证明，不自动决定重跑；进程崩溃恢复未运行'),
 ('Session提交把事实入log并通知观察者；历史另从surface派生','packages/core/session/src/index.ts',892,911,'Session.commit',L,491,525,'C04/D02','append组装事件后调用commit；deriveMessages见999–1029；内存无flush承诺'),
 ('Prompt投影只产生候选操作，本身不拥有提交','packages/core/agent-loop/src/runtime-context.ts',68,115,'SystemPromptProjection.project / replace',L,846,865,'D06-request + CONTROL_FLOW_READ','返回提交候选，由step显式append；H10不展开H11构造算法'),
]
def link(p,a,b):return f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/{p}#L{a}-L{b}'
out=['# H10 固定Commit源码断言清单',f'\n官方Commit `{C}`。文件字节/Git blob与引用范围见evidence/source-lock.json和source-check.json。',
'\n每行包含实现文件/符号/准确范围、教学结论、相关官方测试、作者运行及限制。CONTROL_FLOW_READ表示已读真实调用/await路径；STATIC_ONLY未升级为执行。官方测试均只选读对应实现/断言，未运行官方Vitest套件；“相关”不是每条均有同名场景。',
'\n本轮31项互斥分级：C4（真实Inbox/Stream组件）、D27（真实Loop+Session+LLM+Tools，模型/工具受控），E未执行。各行复用同一用例，不逐行累加测试数量。',
'\n| ID | 教学断言 | 固定实现 / 符号 | 官方相关测试（选读，未执行） | 作者证据与范围 |\n| --- | --- | --- | --- | --- |'];data=[]
for n,(claim,p,a,b,sym,tp,ta,tb,run,limit) in enumerate(rows,1):
 for f,lo,hi in [(p,a,b),(tp,ta,tb)]:assert 1<=lo<=hi<=len((S/f).read_text(encoding='utf8').splitlines()),(f,lo,hi)
 out.append(f'| H10-{n:02} | {claim} | [{p}:{a}–{b}]({link(p,a,b)}) · `{sym}` | [{tp}:{ta}–{tb}]({link(tp,ta,tb)}) | {run}；{limit} |')
 data.append(dict(id=f'H10-{n:02}',assertion=claim,source=p,start=a,end=b,symbol=sym,officialTest=dict(path=tp,start=ta,end=tb,status='SELECTED_READ_NOT_RUN'),authorTest=run,conditions=limit,method='Fixed source control-flow reading + named behavior tests where listed; byte/range validation separately'))
out+=['\n## 阅读冲突与边界',
'1. 架构概览将agent/*概称实时，实际agent/inbox/spliced为Session事实；本课按事件定义和Inbox.append路径分类。',
'2. “Step是一次模型调用”的概括需加边界：同Step可重试多次，也可在准备期间取消而零次派发。step/start、消息接纳与adapter.stream不可合并成一个时刻。',
'3. completed是控制流结果，tool-error夹具仍completed不代表读文件成功；工具主体错误结果与基础设施异常分开。',
'4. 某些文档以“持久事件”描述Session事实；本实验无磁盘后端，append成功没有被写成flush成功。',
'5. assistant/attempt不是所有Attempt的枚举；成功尝试通常结算assistant/message。实时attempt计数在Agent对象内递增，不当成跨重建的持久唯一编号。',
'6. 上游取消流测试用30ms等待；作者以实际text-delta门定位，避免时间猜测。官方MockAdapter逐字节复用；作者门、注册装配及固定文本工具是夹具，不是官方应用环境。',
'\n## 明确保留未验证',
'完整应用E、真实模型/网络、磁盘恢复与flush、进程崩溃、未知外部副作用、批次基础设施故障修复、concluded工具、含工具max-tokens、metadata绑定内部取消、abort后发送竞态、结算失败/恢复监听器失败/取消胜过retry等未由本课运行。静态已读只支持限定解释，不是通过证明。']
(R/'source-checklist.md').write_text('\n'.join(out)+'\n',encoding='utf8')
(R/'evidence/source-assertions.json').write_text(json.dumps(dict(commit=C,assertions=data),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(f'{len(data)} source assertions written')
