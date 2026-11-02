from pathlib import Path
import json,hashlib,re
R=Path(__file__).resolve().parents[1];P=R.parents[2];lock=json.loads((R/'evidence/source-lock.json').read_text());S=Path(lock['sourceCache']);C=lock['commit']
rows=[
('01','packages/core/session/src/index.ts',521,699,'Session / Session.create','Session拥有日志与读模型，独立实例不调用模型','C','A/B/X创建与派生'),
('02','packages/core/session/src/index.ts',1126,1205,'SessionStore.create / prepare','create登记并公告；prepare对象未发布、禁止写','C','membership + A'),
('03','packages/core/session/src/types.ts',92,162,'SessionHeader','元数据与会话日志分离，格式4；创建不占seq','C + STATIC','A / membership；具体字段静态核读'),
('04','packages/core/session/src/types.ts',287,532,'SessionEventMap','边界、消息、工具、请求和attempt是不同事实；SessionEvent信封含Seq/time/data','C/D','B / D / X与各test'),
('05','docs/persistence-catalog.zh.md',1,18,'持久化事件目录','目录区分surface与log-only，不等于只有核心Map事件','STATIC + D','D实际inbox事件；完整目录仅定位/选读'),
('06','packages/core/session/src/types.ts',33,78,'SessionSeq / SessionLogOffset / Cursor','已有位置与间隙/前缀长度有别；构造不验证具体日志存在性','C + STATIC','brands / X前缀；类型联合静态核读'),
('07','packages/core/session/src/index.ts',806,838,'Session.append','归属检查→无损快照→再查→冻结/校验→commit','C','A / snapshot getter / membership'),
('08','packages/core/session/src/index.ts',869,915,'publicationEntry / commit','验证Surface计划与监听者快照先于push；监听在提交后；重入拒绝','C','publication / observer / B；顺序配合分支审读'),
('09','packages/util/values/src/index.ts',172,280,'snapshotJsonValue','一次读取/校验/复制，拒绝非无损JSON域','C','A 11种反例 / snapshot getter'),
('10','packages/core/session/src/types.ts',445,489,'SurfaceEventType / SurfaceOp / SurfaceIntent','五类Surface；替换两端包含；assistant不带源引用','C + STATIC','B / surface eligibility；assistant类型限制源码核读'),
('11','packages/core/session/src/surface.ts',50,75,'isSurfaceEligibleType / isSurfaceEvent','只有受支持消息事件可带Surface操作','C','surface eligibility / B'),
('12','packages/core/session/src/surface.ts',415,436,'replacementRange','端点定位当前Surface位置，非Seq数值区间','C','B的start6/end4成功及反向失败'),
('13','packages/core/session/src/surface.ts',330,369,'assertSourceEventReferences','引用唯一更早事实，覆盖全部被遮蔽节点','C','B漏源/陈旧端点反例；唯一性/更早检查静态核读'),
('14','packages/core/session/src/surface.ts',493,510,'assertSystemHeadRewrite','system头只能由system/message单节点替换','C','B错误头替换 + restricted rewrites正确头替换'),
('15','packages/core/session/src/surface.ts',456,485,'assertToolResultRewrite','工具结果替换仅一当前tool/result，且只变content','C','restricted rewrites：错误callId拒绝，原身份改content成功'),
('16','packages/core/session/src/index.ts',999,1029,'Session.deriveMessages / deriveEventMessage','按Surface节点顺序派生，缓存随内容代次重建，新数组、共享冻结消息','C','B缓存/数组/顺序/冻结'),
('17','packages/core/session/src/surface.ts',120,155,'deriveEventMessage','user直接投影；空system/developer/assistant为null；tool结果一等消息','C/D','empty content / B / D_failure'),
('18','packages/core/session/src/surface.ts',78,105,'isAppendSurfaceEvent / isReplacementSurfaceEvent','人类展示append-origin与模型replacement用途有别','STATIC + C','B保留原事实；展示UI未实现/未测'),
('19','packages/core/agent-loop/src/agent.ts',492,585,'ReactLoopAgent.step / live.settle','成功message、失败attempt；取消安全前缀有条件；结算拒绝不能补造事实','D + 历史D','H17 D三分支；取消前缀选读H12 lab/settlement.ts及旧evidence，不冒称本轮新测'),
('20','packages/core/session/src/request-header.ts',20,29,'canonicalHeader','空工具/adapterDefaults规范为缺省字段','C','canonical header'),
('21','packages/core/session/src/request-header.ts',63,69,'foldRequestHeader','取最新完整规范快照，不深合并旧字段','C/D','canonical header / D每次请求前缀重建'),
('22','packages/core/agent-loop/src/agent.ts',666,695,'ReactLoopAgent.buildRequest','initial/resume/change/series选择；相同头可被后请求继承','D + STATIC','D两请求一header；resume/series分支本轮仅静态'),
('23','packages/core/agent-loop/src/agent.ts',710,731,'ReactLoopAgent.buildRequest requestContext','路由元数据不生成消息；当前准入不用旧context替代绑定能力','C/D + STATIC','D前缀与X logOnly；复杂能力切换未在H17重测'),
('24','packages/core/session/src/tool-history.ts',9,75,'ToolHistoryProjection','从历史header/developer解析声明；不查当前Registry','C/D','historical tools / D toolHistory前缀核对'),
('25','packages/session/session-projection/src/index.ts',81,131,'ProjectionDefinition','init/apply同步纯折叠；无关事件原引用；stateSchema和版本各司其职','C + STATIC','C状态/引用；同步为接口契约，异步行为未宣称已自动禁止'),
('26','packages/session/session-projection/src/index.ts',294,420,'SessionProjectionRegistry.register / acquire','await得到handle，同key版本不兼容拒绝共享','C','C Promise.resolve(register)版本冲突'),
('27','packages/session/session-projection/src/index.ts',449,483,'onChanged / snapshot','变更订阅与一致切面全量视图；asOfSeq最后已覆盖位置','C','C两通知、asOfSeq3'),
('28','packages/session/session-projection/src/index.ts',51,77,'ProjectionHandle','dispose退出全局；保留reader继续按原单元折叠','C','C dispose后空values、旧handle读turn2'),
('29','packages/session/session-projection/src/index.ts',599,623,'viewCheckpoint','内存行版本不符/坏Schema不出key；非live每步完整校验','C + STATIC','C内存行兼容；真实持久缓存NOT_RUN'),
('30','packages/core/session/src/index.ts',1342,1363,'SessionStore.flush','等待全部监听者settle；首个注册失败；无监听false','C','A计数器 / flush all settled'),
('31','packages/core/session/src/index.ts',68,85,'session/event / session/flush','提交通知与等待耐久检查点是两类事件协议','C/D','A / observer / D；物理耐久NOT_RUN'),
('32','packages/core/session/src/index.ts',710,761,'eventAt / snapshotEvents / ownEvents / seq','三同步读取API已弃用；seq为长度Offset','STATIC + C','新lab无这三种调用；A/X验证长度'),
('33','packages/core/session/src/surface.ts',634,693,'SurfaceManager.validateNext / _processDelta','先验证计划；提交后读时推进，不假定所有派生缓存立即完成','C + STATIC','A/B拒绝保持状态；惰性处理内部时序源码审读'),
('34','packages/core/session/src/surface.ts',374,397,'assertDeveloperHeader','工具新增引用更早header，按记录解析完整Schema','C','historical tools；非法引用细分本轮未展开'),
('35','packages/core/session/src/surface.ts',166,220,'validateSessionEventData','无损JSON和局部字段约束不等于每类型全嵌套Schema验证','C + STATIC','canonical header / surface eligibility；校验范围逐分支核读'),
('36','packages/core/session/src/types.ts',246,272,'EpochHeader / RequestContext','system不属于header字段；容量/更新模式为独立路由事实','C/D + STATIC','D system消息与header/context；类型静态核读'),
('37','packages/core/session/src/index.ts',636,703,'Session seed constructor','已有事件可重建；构造附加end-seed标记不应计原轨迹','C/D','X原16/重建17；D两请求重建'),
('38','packages/session/session-projection/src/index.ts',809,865,'SessionProjectionRegistry.drive / viewCell','state引用与raw view引用门控，wireSchema验证输出','C + STATIC','C原状态无关不通知；双门控完整实现静态核读'),
]
out=[]
for ident,path,a,b,symbol,claim,level,test in rows:
 p=S/path;lines=p.read_text(encoding='utf-8').splitlines();assert 1<=a<=b<=len(lines),(path,a,b,len(lines))
 url=f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/{path}#L{a}-L{b}'
 out.append({'id':'S'+ident,'commit':C,'path':path,'start':a,'end':b,'symbol':symbol,'claim':claim,'level':level,'behaviorEvidence':test,'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'url':url})
lesson=P/'course-content/internal/deepseek-harness/h17/lesson.md';s=lesson.read_text(encoding='utf-8')
for x in out:
 s=s.replace('@@'+x['id'][1:]+'@@',f"[{x['symbol']}]({x['url']})")
 s=re.sub(r'\['+re.escape(x['symbol'])+r'\]\(https://github.com/deepseek-ai/deepseek-harness/blob/'+C+r'/[^)]+\)',lambda _:f"[{x['symbol']}]({x['url']})",s)
assert '@@' not in s;lesson.write_text(s,encoding='utf-8')
text='# H17 固定源码断言与行为证据\n\n基线 `'+C+'`。每行包含真实位置、符号、结论与行为对应。C/D仅指列明实验；STATIC不冒充行为通过，历史D不冒充本轮执行。官方测试仅选读，未运行完整Vitest。\n\n| ID | 文件/符号 | 教学结论 | 证据等级及行为核对 |\n|---|---|---|---|\n'
for x in out:text+=f"| {x['id']} | [{x['path']}:{x['start']} · {x['symbol']}]({x['url']}) | {x['claim']} | {x['level']}：{x['behaviorEvidence']} |\n"
text+='''\n## 精读路线与差异记录\n\n核心5文件：types.ts（词汇与位置）→index.ts（append/派生）→surface.ts（位置与消息）→request-header.ts（请求完整快照）→session-projection/src/index.ts（领域折叠）。每站先看输入，再看状态变化、输出与拒绝边界。tool-history、AgentLoop、util-values、官方README及测试作为辅助，不把所有链接当必读。\n\n蓝图“append→surface apply→session/event”是概括。固定实现先validateNext，push后发布；Surface在访问时推进验证计划，header/toolHistory/messages也增量读取；Registry通过提交通知驱动。正文、图均按这一精度，不回写蓝图。SessionEventLog是概念称呼，源码没有把它当一个可new的导出类。\n\n官方类型文档的SessionEvent注释仍有列举未写developer/message的旧措辞，实际SurfaceEventType、Set和deriveEventMessage包含它；正文以实际类型与分支为准，不删developer。\n\n选读官方测试setup/action/assertions：core/session/tests的session、surface、json、sequence-types、store-membership、request-header、tool-history、derived-cache、developer-header；session-projection/tests的registry、registration-reader；agent-loop的stream相关测试与H12历史lab。当前自定义用例运行真实实现，不称官方套件已通过。\n\n物理持久性、跨进程锁、Fork修复、任意插件解释器、Provider投影全矩阵均非本轮动态覆盖。静态命中与行界限/字节检查只防漂移，不能独自证明语义。\n'''
(R/'source-checklist.md').write_text(text,encoding='utf-8');(R/'evidence/source-assertions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(len(out),'source assertions')
