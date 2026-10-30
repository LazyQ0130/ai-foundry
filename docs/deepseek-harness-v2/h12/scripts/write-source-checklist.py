"""固定源码断言是控制流审读记录；哈希与AST另核，不凭关键字证明行为。"""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
C='f3803c96974ad4a94195fb97e5c637e9c2a3afe3';BASE=f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/'
I='packages/llm/llm/src/index.ts';T='packages/llm/llm/src/types.ts';M='packages/llm/llm/src/message.ts';A='packages/llm/llm/src/assembler.ts';S='packages/llm/llm/src/assistant-stream.ts';L='packages/core/agent-loop/src/agent.ts';F='packages/core/agent-loop/src/assistant-stream.ts'
ST='packages/llm/llm/tests/service.spec.ts';AT='packages/llm/llm/tests/assembler.spec.ts';CT='packages/llm/llm/tests/assistant-stream.spec.ts';LT='packages/core/agent-loop/tests/loop.spec.ts';KT='packages/core/agent-loop/tests/cancel.spec.ts'
# claim, path, first, last, symbol, official related test/range, author evidence, limitation
rows=[
 ('ctx.llm是LlmRuntime服务，Adapter承担wire翻译',I,202,302,'LlmAdapter',ST,193,202,'C13/AST','类型与继承责任不等于任意Provider已兼容'),
 ('同一路由重复注册原子失败，disposer移除当前持有路由',I,401,475,'registerAdapter/prepareRoutes/commitRoutes',ST,1638,1690,'C12','没有验证整个Loader HMR watcher'),
 ('listProviders返回分离目录且按注册顺序',I,478,485,'listProviders',ST,670,698,'C12/C13','目录是注册路由，不是未激活配置项'),
 ('模型目录仅建议，精确解析不要求目录成员',I,711,775,'listModels/resolveModelInfo',ST,775,793,'C13','具体Adapter与GUI仍可收紧'),
 ('精确模型身份/默认输出上限/能力模式被校验并分离',I,778,886,'normalizeModelInfo',ST,831,894,'C15 + SOURCE_READ','C15实测坏defaultMaxTokens；其他元数据分支静态，不声称所有输入采样值已校验'),
 ('GenerateOptions含messages/tools/控制项，可有单次调用system',T,530,597,'RequestUserInput/GenerateOptions',ST,1480,1502,'C13/AST + D-tool-chain','Loop不使用system不代表类型无此字段'),
 ('调用配置与完整请求分开；configure在默认值前运行','packages/llm/llm/src/call-config.ts',15,57,'LlmCallConfig/ConfigureCall',ST,1079,1144,'C29 + SOURCE_READ','同步纯回调约定；不是自动组合任意插件'),
 ('prepare捕获注册项并await Adapter代次，再查取消、规范化和默认',I,960,998,'LlmRuntime.prepareCall',ST,1002,1049,'C13/C16/C20/C29','prepare拒绝不必产生流finish'),
 ('reasoning按精确模型校验；maxTokens默认只补缺省',I,912,945,'resolveCallWithInfo',ST,831,916,'C13/C29','未验证所有提供方控制参数或远端上限'),
 ('prepared成功分发一次，配置不匹配在占用前失败',I,999,1017,'PreparedLlmCall.stream closure',ST,1002,1049,'C16','一次句柄取得即占用；并非只在消费完成后占用'),
 ('惰性最终分发再次核prepared配置，拒绝延后漂移',I,1089,1099,'adapterStream prepared config guard',ST,1035,1049,'C17','手工请求仍由调用方保持稳定'),
 ('旧prepared继续用捕获注册项，动态Adapter需自行捕获内部设置',I,960,1017,'prepareCall registration closure',ST,1239,1273,'C18/C19','本地动态代次夹具；不称真实HMR系统集成'),
 ('Replay私有状态按历史路由当前实例所有权过滤，原消息不变',I,1026,1041,'forAdapter',ST,1503,1586,'C26','未跑全部路由替换/跨模型兼容矩阵'),
 ('消息角色与内容块为不同维度；工具结果是一等tool消息',M,138,196,'MessageRoleMap/ToolResultMessage',LT,491,525,'C08/D-tool-chain','图片/文件完整生命周期仅定点静态核读'),
 ('消息构造分离并深冻结，生成新持久id',M,212,270,'freezeMessage/createMessage/createAssistantMessage',ST,267,286,'C08','不可变构造不替代Session合法性校验'),
 ('ToolCallBlock的arguments保持JSON字符串，id关联结果',T,111,119,'ToolCallBlock',AT,124,144,'C02/C08/D-tool-chain','Assembler不负责通用JSON或业务权限检查'),
 ('StreamChunk是七分支闭联合，index关联交错内容块',T,488,508,'StreamChunk',AT,229,253,'C02/AST','StreamChunk.index与live帧交付index不同'),
 ('FinishReason包含stop/tool-calls/max-tokens/error/aborted',T,159,172,'FinishReasonMap',LT,188,212,'AST/D各终态','原因联合可扩展；不是只数finish标签'),
 ('usage缓存字段不与input重复，reasoning已含在output',T,174,196,'TokenUsage',CT,23,65,'SOURCE_READ + C02','夹具用量不证明真实计费或性能'),
 ('按index保存PartialBlock，另记首次出现顺序',A,49,105,'BlockAssembler.push/ensure',AT,1,46,'C01/C02','不按数值排序，非单一字符串'),
 ('首个block-end权威，关闭后delta及重复close被忽略',A,62,83,'push closed guards',AT,216,227,'C03','容忍迟到不等于修复全部畸形流'),
 ('开放核心块可从delta组装，开放未知类型会抛错',A,108,119,'assemble',AT,64,71,'C06','类型扩展还需消费端支持'),
 ('max-tokens去掉所有tool-call，Replay逐块条目同步裁剪',A,130,159,'assembled/blocks',AT,124,186,'C04/C07/D-max-tokens','包括已关闭合法工具；不只过滤半截JSON'),
 ('取消安全前缀只留非空白text/reasoning，工具全部省略',A,162,179,'interruptedBlocks',AT,229,263,'C05/D-cancel-*','安全指协议保留规则，不担保内容正确或副作用回滚'),
 ('usage可缺失；缺finish getter默认stop',A,181,198,'usage/finish/replayState getters',AT,1,63,'C01/C02','默认不是已收到终态的证据'),
 ('紧凑记录分别容纳文本/推理/工具run与raw chunk',S,13,44,'TimedStreamChunk/AssistantStreamRecord',CT,23,65,'C09/AST','紧凑流不是另一套逐chunk Session事件'),
 ('Accumulator先无损JSON快照，再按兼容连续run压紧',S,108,177,'AssistantStreamAccumulator.push',CT,23,85,'C09/C10/D通用对照','不合并原分片成员；name身份变化会拆run'),
 ('snapshot返回分离不可变记录，后续push不改旧快照',S,179,193,'snapshot',CT,68,100,'C10','不声明CPU/内存实测收益'),
 ('expand逐成员还原时间；记录校验不等于终止顺序校正',S,196,232,'expandAssistantStream',CT,23,100,'C09/C11','时间间隔可负；raw记录只检查所列结构/JSON'),
 ('校验精确key、非空成员、索引、dt长度及安全整数',S,456,534,'validateRecord/validateRun',CT,147,220,'C11三个负例','不是所有协议坏状态的验证器'),
 ('记录级组装可按run喂Assembler，但信任已校验的类型',S,415,453,'assembleAssistantStream',CT,452,486,'C09','持久边界仍先expand校验'),
 ('start早于首片；attemptId与帧revision独立于块index',F,18,57,'AssistantStreamAttempt constructor/start',LT,79,124,'D全部框架检查','准备失败未start的分支本课仅静态'),
 ('每片先累积快照，再组装，再发实时chunk帧',F,59,71,'AssistantStreamAttempt.push',LT,79,124,'D全部紧凑流/帧逐项对照','不是逐片提交Session'),
 ('settle先append取seq再committed end；拒绝则abandon并重抛',F,73,108,'settle/abandon',LT,126,153,'D-write-failure/D-attempt-write-failure','使用夹具Session append拒绝，不冒称磁盘故障'),
 ('正常message先结算，之后提取调用并进入工具系统',L,566,597,'ReactLoopAgent.step success',LT,491,525,'D-tool-chain','不展开完整工具执行/权限生命周期'),
 ('规范化失败终态结算attempt，request-error决定是否continue',L,541,563,'step finish failure branch',LT,188,212,'D-failure/D-throw/D-retry','同Step重试两Attempt；不是Runtime自动重试'),
 ('本地signal中断按安全前缀决定message或attempt',L,499,539,'step catch interruption',KT,574,608,'D-cancel-empty/partial/reasoning/tools','前缀不是任务成功；不验证硬退出恢复'),
 ('仅提供方aborted而本地未取消进入失败终态支路',L,541,563,'step aborted finish branch',KT,701,779,'D-in-band-aborted','该夹具Turn error，不按字符串猜用户取消'),
 ('最终块组装失败且无成功结算时abandon',L,566,607,'step finalization catch',LT,155,185,'D-assembly-failure','不是把未知块或空内容静默改成文本'),
 ('Adapter查找/分发/iterator/next异常规范化；middleware等不在其catch内',I,1063,1195,'adapterStream/adapterFailureChunk',ST,407,656,'C14/C21/C22/C23/D-throw','不把所有基础设施异常都当Provider失败'),
 ('Runtime正常yield逐项转发，不补缺finish或删除finish后片段',I,1129,1156,'adapterStream iteration loop',ST,579,607,'C25 + CONTROL_FLOW_READ','坏Adapter反例；合规终止仍由Adapter履约'),
 ('LlmFailure结构化事实验证复制；普通Error码回退UNKNOWN','packages/llm/llm/src/adapter-failure.ts',16,107,'normalizeLlmFailure/failureSnapshot',ST,495,578,'C21/C22','signal可影响终态kind但不凭空把所有code改为ABORTED'),
 ('DeepSeek原生事件到公共块，usage在message_stop时先于finish','packages/llm/llm-deepseek/src/translate.ts',104,165,'translate','packages/llm/llm-deepseek/tests/stream.spec.ts',1,120,'C27/C28','官方translate真实执行；SSE/HTTP链仅源码核读'),
 ('DeepSeek准备捕获connection；流异常映射Transport/Timeout/Aborted','packages/llm/llm-deepseek/src/adapter.ts',50,88,'prepareCall/generate','packages/llm/llm-deepseek/tests/prepared-call.spec.ts',1,59,'SOURCE_READ + C19类比夹具','未执行完整官方Adapter；有文件修复分支，不能许诺只一HTTP请求'),
 ('pi-ai完成工具参数再序列化，done/error映为usage后finish','packages/llm/llm-pi-ai/src/stream.ts',144,244,'toStreamChunks','packages/llm/llm-pi-ai/tests/completed-tool-arguments.spec.ts',1,100,'SOURCE_READ','本轮未执行pi-ai或网络协议测试'),
 ('pi-ai禁库重试并捕获内部snapshot代次','packages/llm/llm-pi-ai/src/adapter.ts',127,143,'profileOptions maxRetries','packages/llm/llm-pi-ai/tests/sdk-options.spec.ts',1,75,'SOURCE_READ；snapshot另见344-369','不替代H20策略预算或H26多Provider工程'),
 ('Session事件接纳与deriveMessages分开；失败attempt不自动进正常历史','packages/core/session/src/index.ts',892,911,'Session.commit',LT,188,212,'D-failure/D-tool-chain；derive另见999-1029','官方真实内存Session；无storage backend/flush验证'),
]
items=[]
def link(p,a,b):return f'[{p}:{a}–{b}]({BASE}{p}#L{a}-L{b})'
lines=['# H12固定Commit源码核对清单','',f'固定Commit `{C}`。以下是作者控制流审读结论；位置/哈希/AST不独自证明语义。','',
 '作者行为证据互斥计A1/C33/D15，共49项。B未独立运行，真实Cordis包含于C/D；E未运行。官方测试列为相关定位，选读范围见preparation，未执行官方Vitest套件；测试相关不表示覆盖该行全部条件。','',
 '| ID | 预期行为 | 固定实现/符号 | 相关官方测试（定位/选读，非执行） | 作者证据及限制 |','| --- | --- | --- | --- | --- |']
for n,(claim,p,a,b,symbol,t,ta,tb,evidence,limit) in enumerate(rows,1):
 item={'id':f'H12-{n:02}','commit':C,'path':p,'symbol':symbol,'lines':[a,b],'expected':claim,'officialTest':{'path':t,'lines':[ta,tb],'status':'LOCATED; selected setup/action/assertions read, not executed'},'authorEvidence':evidence,'limits':limit};items.append(item)
 lines.append(f'| {item["id"]} | {claim} | {link(p,a,b)} · `{symbol}` | {link(t,ta,tb)} | {evidence}；{limit} |')
(R/'source-checklist.md').write_text('\n'.join(lines)+'\n',encoding='utf8',newline='\n')
(R/'evidence/source-assertions.json').write_text(json.dumps({'commit':C,'assertions':items},ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print('Source assertions:',len(items))
