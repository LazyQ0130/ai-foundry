from pathlib import Path
import json,hashlib,re
R=Path(__file__).resolve().parents[1];P=R.parents[2]
C='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
S=Path(json.loads((R/'evidence/source-lock.json').read_text(encoding='utf-8'))['sourceCache'])
SE='packages/core/session/src/';PE='packages/session/session-persistence/src/';JL='packages/session/session-persistence-jsonl/src/';AL='packages/core/agent-loop/src/'
rows=[
(PE+'index.ts',124,210,'SessionPersistence','独立服务契约；create/open/stat/list/flush，日志读写经Handle','C/D + STATIC','A/B/X实际调用；方法集合静态核读'),
(PE+'handle.ts',45,116,'SessionHandle / SessionAccess','同一接口，两种模式；append可见与flush耐久不同','C + STATIC','A/B/empty；通用后端最低保证为接口契约'),
(PE+'errors.ts',21,77,'访问与生命周期错误','AlreadyExists/AlreadyOwned/ReadOnly/Closed分开','C','A / lease / empty'),
(PE+'handle.ts',22,83,'SessionHandleReadResult / read','外层slice独立，eventState由生产者保持；单句柄不倒退','C + STATIC','B实测shared-frozen与新数组；全部并发新鲜度矩阵未运行'),
(JL+'index.ts',93,140,'Config / Config schema','root必填；compression默认zstd；listConcurrency不改变语义','C + STATIC','B_zstd省略compression；全配置拒绝矩阵静态'),
(JL+'index.ts',350,378,'JsonlSessionPersistence.create','pending本地可见；新建writer在实体化前才取内核锁','C','A / empty'),
(JL+'index.ts',388,465,'JsonlSessionPersistence.open','read不取写权，write先claim/lease；失败释放claim','C/D + STATIC','A/lease/resume；所有失败释放组合未逐项动态'),
(JL+'index.ts',483,565,'stat / list','轻量观察，不扫描所有正文来证明语义；pending缺location','C + STATIC','A/B/empty/format；全并发列举静态'),
(JL+'storage.ts',385,500,'JsonlBackendTracker','进程内单写者认领、pending与句柄释放','C','A/empty/lease'),
(JL+'lease.ts',54,135,'SessionWriteLease.acquire / release','已有产物write-open锁；新会话首次物化锁；内核而非超时抢占','C + STATIC','Windows lease新PID；POSIX为静态'),
(JL+'win32.ts',140,173,'acquireLockHandleWin32 / releaseLockHandleWin32','命名Local信号量，路径派生，无锁文件；限定登录会话','C + STATIC','Windows实际争用/退出后再开；跨登录会话未测'),
(PE+'errors.ts',51,64,'SessionOwnershipLostError','契约永久失权类；固定JSONL不使用过期抢占/续期','STATIC','核错误注释与lease实现；不冒称动态触发失权'),
(JL+'storage.ts',182,211,'JsonlSessionHandle.append / flush','append立即快照后串行；flush实体化但本身不drainLive','C','A/snapshot/cancellation；buffer经Store路由屏障'),
(JL+'storage.ts',267,315,'enqueueLive / drainBuffered','固定200ms窗口不重置；失败保留顺序并暂停自动排空','C + STATIC','buffer失败/重试动态；200ms计时规则源码读，未靠sleep测截止'),
(JL+'storage.ts',214,264,'JsonlSessionHandle.close','记忆关闭Promise，排空/等链/释放；空未物化记录可退出','C/D','A/empty/buffer/X'),
(JL+'storage.ts',525,569,'JsonlBackendTracker.install','按ID路由到活跃writer；session/flush先drain再flush','C/D','buffer无writer仍true磁盘不增；X两Session屏障'),
(JL+'storage.ts',502,523,'JsonlBackendTracker.flushAll','活跃writer排空/刷新；失败聚合，读句柄不参与','D + STATIC','X服务级flush动态；多writer失败聚合完整分支静态'),
(SE+'index.ts',806,927,'Session.append / commit','内存接纳、session/event与后端持久化独立','C/D','buffer内存3磁盘2；X checkpoint'),
(SE+'index.ts',1332,1371,'SessionStore.flush','等全部监听；无监听false；布尔值不保证有效writer','C','buffer真实安装监听但关writer后true'),
(JL+'index.ts',911,947,'persistBatch / persistHeader / truncateTornTail','首批物化、后续追加、空Header屏障与尾修复分开','C','A/B/empty/physical raw+zstd'),
(JL+'index.ts',1260,1370,'materialize / writeSyncedTempFile','首次同步暂存，再无覆盖发布；Windows write-through，POSIX link+目录同步','C + STATIC','Windows B实际；POSIX与故障分支静态'),
(JL+'index.ts',1408,1462,'appendLines / rollbackAppend / repair','每批write+sync；捕获失败尝试恢复原长度；回滚失败聚合','C + STATIC','真实B与tail走写/同步；未注入物理sync或断电故障'),
(JL+'format.ts',188,304,'encodeSegment / projectDir / logPath','ID单段转义；cwd项目分组；无cwd为_no-cwd','C + STATIC','B观察路径；全恶意字符串矩阵未测'),
(JL+'format.ts',79,155,'HeaderLine / toHeaderLine / fromHeaderLine','物理Header与逻辑元数据有编码差别，切点从marker读取','C','B/format historical与X seeded读回'),
(JL+'format.ts',50,76,'generationLogFilename / parseGenerationLogFilename','物理规范generation与返回逻辑格式应分别判断','C + STATIC','historical源v3→逻辑v4；最高未来拒绝源码/fixture'),
(JL+'format.ts',307,340,'eventLines','每事件逻辑行，sourceEventSeqs可无损区间编码','STATIC + D','实现与官方JSONL测试选读；X源引用逻辑读回'),
(JL+'zstd.ts',48,126,'scanZstdFrames / compressZstdFrame / decompressZstdFrame','带校验帧拼接，原始文本与默认压缩分开','C','B_zstd默认写/独立进程读；physical zstd'),
(JL+'format.ts',380,537,'SessionLogScanner / scanLog','半行不返给读者；有效前缀与已提交结构错误不同','C','physical raw / corrupt'),
(JL+'index.ts',801,887,'readStoredLog / decodeStoredLog','撕裂帧可恢复完整记录，写时截断重写；读不修文件','C','physical zstd缺1checksum字节、有效prefix byte对照'),
(PE+'storage-contract.ts',55,103,'validateStoredEvents','未知必需事件Unsupported，当前ignorable保留，结构错Corruption','C','format required/ignorable/corrupt'),
(PE+'errors.ts',92,137,'格式错误分类 / sessionFormatVersionRefusal','不支持不等于损坏，未来方向提示升级','C + STATIC','format future/corrupt；文本方向源码核读'),
(JL+'index.ts',388,445,'历史open的读写分支','只读返回准备值不发布；写持权后发布当前后继','C + STATIC','historical只读不改源动态；写迁移NOT_RUN'),
('packages/session/session-persistence-jsonl/README.zh.md',60,106,'历史格式与ignorable范围','当前可忽略规则不无限推广至v0/v1/v2未知词汇','STATIC','官方包文档与catalog/stage测试选读；旧格式未知矩阵未执行'),
(SE+'types.ts',1,32,'SESSION_FORMAT_VERSION','当前逻辑版本4；当前写目标通过该常量生成','C + STATIC','B物理header4；historical逻辑4'),
(PE+'index.ts',189,209,'SessionPersistence.stat revision','修订号仅同实例/同ID可比，不用于resume或授权','STATIC','读取接口与JSONL fileRevision分支；未另造安全结论'),
(SE+'index.ts',1158,1205,'SessionStore.prepare','未发布对象可接管合法restore seed/eventState','C/D','preparation测试 / resume/X'),
(SE+'preparation.ts',14,48,'SessionPreparation','确切Session及同步幂等释放，非磁盘事务','C','preparation测试'),
(AL+'index.ts',688,745,'createStoredSession / createAgent','Agent工厂创建writer并补seed；普通Store.create不自动持久','D + C','X / buffer无writer'),
(AL+'index.ts',754,831,'AgentLoop.resume / resumeWith','先write-open/read，普通批次补closer，prepare并发布新运行对象','D','resume / X实际JSONL'),
(AL+'index.ts',688,710,'appendUnstoredSuffix','构造后缀在正式发布前存入持有writer','D','resume修复+marker读回，X16→17'),
(SE+'repair.ts',43,210,'openTurnClosers / interruptedTurnClosers','工具结果→开放Step结束→Turn结束；保留原前缀','C/D','C四分支 / resume'),
(SE+'repair.ts',29,196,'ToolCallRecovery / CLOSER_TEXT','有无call分两码、引用与说明；闭Step不追修；Fork提醒父未来','C/D + STATIC','C/D/X/seed测试；其他畸形词汇不宣称可修'),
(SE+'fork.ts',10,29,'buildForkSeed','包含切点，marker先于forked closer，子closer不计继承','C/D','D / X / fork seed'),
(SE+'index.ts',1387,1469,'SessionStore.fork / _forkBoundary / _resolveForkSource','只接受live确切源/现有Seq；默认末事件；只复制cwd/isSeeded/cut，不加parentSession','C/D','D默认/显式/空/错/独立未来；X预览对照'),
(SE+'index.ts',636,701,'Session constructor seed marker','精确cut验证；tagged继承标记与普通resume标记分开','C/D','D/X/resume事件计数'),
(SE+'types.ts',92,162,'SessionHeader','Header在日志之外，持久谱系/来源与精确cut有别','C/D + STATIC','B/X；全部字段语义静态核读'),
('packages/core/agent/src/index.ts',484,535,'AgentRegistry.enter / owner','parentAgent为显式确切对象，不从持久parentSession推断','STATIC + 历史D','H09已验证；本课X不设parentAgent，完整Subagent未测'),
(AL+'index.ts',495,545,'initializeAgent teardown','停止/等待→Scope→writer.close→退出实时表，保留已存历史','D','X正常dispose/新后端resume；完整异常关闭矩阵未重跑'),
('docs/subsystems/session.zh.md',690,692,'Fork说明冲突','692拒绝开放Turn与实现/测试相反，采用开放尾forked合成闭合','STATIC + C/D','D/X实际；core/session/tests/fork.spec.ts开放尾选读'),
(JL+'index.ts',747,799,'publishStoredMigration','写迁移校验后排他发布current successor，保留源generation','STATIC','generation/v3-restart-migration测试选读；本课写迁移Worker未运行'),
]
out=[]
for i,(path,a,b,symbol,claim,level,evidence) in enumerate(rows,1):
 p=S/path;raw=p.read_bytes();assert 1<=a<=b<=len(raw.splitlines()),(path,a,b)
 out.append({'id':f'S{i:02}','commit':C,'path':path,'start':a,'end':b,'symbol':symbol,'claim':claim,'level':level,'behaviorEvidence':evidence,'sourceSha256':hashlib.sha256(raw).hexdigest(),'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{C}/{path}#L{a}-L{b}'})
(R/'evidence/source-assertions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
text='# H18 固定源码断言与证据\n\n固定Commit `'+C+'`。C/D只对应实际列出的自定义局部测试，STATIC与历史证据不计本轮动态通过。50项不是50个独立行为场景。官方测试选读，不声称运行完整Vitest。\n\n| ID | 真实文件与符号 | 教学结论 | 证据等级与验证 |\n|---|---|---|---|\n'
for x in out:text+=f"| {x['id']} | [{x['path']}:{x['start']} · {x['symbol']}]({x['url']}) | {x['claim']} | {x['level']}：{x['behaviorEvidence']} |\n"
text+='\n## 差异与采用规则\n\nD01：子系统文档690描述闭合开放尾，692却说“API拒绝结束于开放轮次内的前缀”。SessionStore.fork1387–1419、buildForkSeed21–29与官方fork.spec.ts284–367明确合成forked闭合，本课D/X动态相符；采用实现，不改上游。\n\nD02：蓝图H18标题为“会话恢复、历史回放与Fork”、估110～150分钟；本次正式任务指定新标题并扩展真实磁盘/进程/压缩/尾部证据，教材估260～350，未实测，不回填蓝图。\n\nD03：seam单实例保证与JSONL跨实例/进程内核约束是分层，不是相互矛盾；append最低保证与JSONL更强同步同理。SessionOwnershipLostError注释说明该类当前不被随产品路径抛出，不能据类名编造可配置过期/续期协议。\n\nD04：当前逻辑V4与当前物理v4对应；历史v3只读open可得到V4逻辑值，不能说所有物理generation号永远与handle.header.version相等。写迁移未运行，单列STATIC。\n\nD05：普通Fork当前不自动写parentSession/origin；文档说历史数据可能保留来源，不作为当前API自动谱系行为。H09运行时owner与持久谱系继续区分。\n\n## 阅读与测试范围\n\n核心5文件：JSONL storage.ts（句柄/路由）→JSONL index.ts（打开/物理存储选段）→Session repair.ts（缺结果/边界）→fork.ts（精确seed）→AgentLoop index.ts（恢复/发布）。handle契约、SessionStore、格式与压缩、catalog、Header与官方文档为辅助，不要求学员通读全包。\n\n选读官方测试setup/action/assertion：session-persistence的contract/live-write-contract，JSONL的jsonl/lease/lease.two-process.e2e/zstd/generation/v3-restart-migration/current-event-admission，core/session的fork/repair与agent-loop/resume。原测试含递归清理，不原封执行；自定义实验采用真实官方组件与新Fixture。\n\n源码hash/行界限与AST仅防漂移；真实磁盘、进程、C/D、格式迁移和平台维度另列。没有动态覆盖的分支不因路径存在而升级PASS。\n'
(R/'source-checklist.md').write_text(text,encoding='utf-8')
lesson=P/'course-content/internal/deepseek-harness/h18/lesson.md';s=lesson.read_text(encoding='utf-8')
for x in out:
 s=s.replace('{{'+x['id']+'}}',f"[{x['symbol']}]({x['url']})")
 for label in [x['symbol'],x['id']]:
  pattern=r'\['+re.escape(label)+r'\]\(https://github.com/deepseek-ai/deepseek-harness/blob/'+C+'/'+re.escape(x['path'])+r'#L\d+-L\d+\)'
  s=re.sub(pattern,lambda m:f"[{label}]({x['url']})",s)

if '## 十四道思考与迁移' in s:
 a,b=s.split('## 十四道思考与迁移',1)
 for x in out:b=re.sub(r'(?<![\w\[{])'+x['id']+r'(?![}\w])',lambda m:f"[{x['id']}]({x['url']})",b)
 s=a+'## 十四道思考与迁移'+b
assert '{{S' not in s
lesson.write_text(s,encoding='utf-8');print('50 assertions and lesson links generated')
