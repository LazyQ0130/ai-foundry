"""固定 Git 对象核对、行范围与断言索引。语义审查记录独立于自动定位。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
lock=json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf8'))
COMMIT=lock['commit'];CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',str(CACHE.parents[1]/'deepseek-harness-f3803c9')))
tree={}
for row in subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r','-z',COMMIT]).split(b'\0'):
 if row:
  meta,p=row.split(b'\t',1);tree[p.decode()]=meta.split()[2].decode()
checked={}
def check(p):
 if p in checked:return checked[p]
 data=(CACHE/p).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 assert tree[p]==blob,p
 checked[p]={'path':p,'gitBlob':blob,'sha256':hashlib.sha256(data).hexdigest(),'lineCount':len(data.decode('utf8').splitlines())}
 return checked[p]
lesson=(REPO/'course-content/internal/deepseek-harness/h05/lesson.md').read_text(encoding='utf8')
refs=[]
for url in sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',lesson))):
 m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url);assert m,url
 commit,p,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT
 assert 1<=a<=b<=check(p)['lineCount'],url
 refs.append({'path':p,'start':a,'end':b,'url':url,'status':'FIXED_BLOB_AND_RANGE_VERIFIED'})
raw=[
 ('S01','插件三形态；插件不必继承 Service','vendor/cordis/src/registry.ts',91,133,'Plugin.Object','B 两种模块挂载顺序；官方教程01函数示例选读'),
 ('S02','原生执行器 apply 是模块函数，类 implements ToolExecutor','packages/core/tool-executor-native/src/index.ts',8,35,'implements ToolExecutor','官方 tools setup 选读，未运行'),
 ('S03','Service 构造器通过 reflect.provide 登记实例','vendor/cordis/src/service.ts',42,58,'self.ctx.reflect.provide','B 正常/缺失依赖实际执行'),
 ('S04','provide 有作用域与归属，同域重复名字失败','vendor/cordis/src/reflect.ts',277,305,'has been registered','B 重复注册实际失败'),
 ('S05','Context 根构造代理与内建服务，不自动挂所有业务能力','vendor/cordis/src/context.ts',70,84,'new Proxy','B 缺失服务实际为 undefined'),
 ('S06','插件取得扩展的子 Context','vendor/cordis/src/fiber.ts',234,245,'parent.extend','源码分支审读；非完整作用域测试'),
 ('S07','普通属性读取分根与插件；插件检查依赖与作用域','vendor/cordis/src/reflect.ts',144,166,'without inject','B 遗漏 inject 实际失败，根探测另测'),
 ('S08','registry 归一化模块 inject 后创建挂载记录','vendor/cordis/src/registry.ts',316,335,'Inject.resolve(plugin.inject)','B 模块对象正常；删除元数据变异非零'),
 ('S09','查当前可用实现及 check，所有必需服务满足才激活','vendor/cordis/src/fiber.ts',597,638,'impl.check','B 异步提供方尚未 ACTIVE 时调用0'),
 ('S10','默认 get 要求提供方 ACTIVE','vendor/cordis/src/reflect.ts',233,243,'FiberState.ACTIVE','B 异步门闩前 get undefined'),
 ('S11','缺失服务 PENDING，孤立进程可退出0且无业务输出','docs/cordis-tutorial/03-services.zh.md',59,72,'PENDING','demo --missing 子进程实际执行'),
 ('S12','await 等待当前转换稳定，不保证状态 ACTIVE','vendor/cordis/src/fiber.ts',725,737,'while (this.inertia)','B await消费者后仍 PENDING 实测'),
 ('S13','函数与类入口分支按 ctx/config 执行','vendor/cordis/src/fiber.ts',247,260,'new runtime.callback','B 模块与 Service 类均实际挂载'),
 ('S14','声明合并只提供编译期信息','docs/cordis-tutorial/index.zh.md',54,58,'不会生成任何运行时接线','TS2345 反例、发射代码擦除、无提供方运行三重核对'),
 ('S15','ToolsService 需要 systemPrompt 并提供 tools','packages/core/tools/src/index.ts',99,118,"super(ctx, 'tools')",'tools.spec.ts:33–39 setup 静态选读'),
 ('S16','工具服务类型声明与运行时登记分离','packages/core/tools/src/index.ts',32,36,'tools: ToolsService','与 S15 交叉审读'),
 ('S17','模型服务实际类 LlmRuntime，提供 llm','packages/llm/llm/src/index.ts',354,364,'class LlmRuntime','成员归属静态核对；未启动模型'),
 ('S18','SessionStore 是内存存储，持久化不在本类实现','packages/core/session/src/index.ts',1057,1064,'Persistence is intentionally not implemented','静态核对，不声称落盘'),
 ('S19','AgentLoop 同时消费多服务并提供 agentLoop','packages/core/agent-loop/src/index.ts',290,318,"super(ctx, 'agentLoop')",'tool-executors.spec.ts:66–83 setup 静态选读'),
 ('S20','H03循环消费 tools，服务再选执行器','packages/core/agent-loop/src/agent.ts',586,597,'this.loopCtx.tools.execute','消费与委托交叉；不是新跑完整 Agent'),
 ('S21','工具分派通过所选执行器 execute','packages/core/tools/src/index.ts',369,377,'selectExecutor(input.agent).execute(input)','tool-executors.spec.ts:103–128 断言静态选读'),
 ('S22','按键服务解析有作用域，非全局对象等价','vendor/cordis/src/context.ts',109,125,'isolate(name: string','静态审读；作用域算法留 H08'),
 ('S23','完整 Harness 的启动审查与裸 Cordis 不同','packages/boot/app-boot/src/index.ts',1156,1200,'required','沿用 H04 已审事实，未在 H05 跑完整 boot'),
 ('S24','未审计实验性预览，插件化不证明安全','SAFETY.zh.md',5,15,'尚未接受安全审计','保留官方限制；无安全认证测试'),
]
claims=[]
for cid,claim,p,a,b,needle,validation in raw:
 check(p);lines=(CACHE/p).read_text(encoding='utf8').splitlines();assert needle in '\n'.join(lines[a-1:b]),cid
 claims.append({'id':cid,'claim':claim,'path':p,'start':a,'end':b,'validation':validation,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{p}#L{a}-L{b}','status':'AUTHOR_SEMANTIC_REVIEW_WITH_SCOPED_EVIDENCE'})
# 运行时真正加载的两个 vendor 包全体 TS 字节均核 Git；并非只核正文几个链接。
for folder in ['vendor/cordis/src','vendor/cosmokit/src']:
 for p in (CACHE/folder).glob('*.ts'):check(p.relative_to(CACHE).as_posix())
for p in ['vendor/cordis/package.json','vendor/cordis/tsconfig.json','vendor/cosmokit/tsconfig.json','LICENSE','docs/cordis-primer.zh.md','docs/cordis-api/context.zh.md','docs/cordis-api/registry.zh.md','docs/cordis-api/service.zh.md','packages/core/tools/tests/tools.spec.ts','packages/core/agent-loop/tests/tool-executors.spec.ts']:
 check(p)
report={'status':'PASS','commit':COMMIT,'method':'each file Git blob SHA1 matched against fixed commit ls-tree; SHA256 also retained','references':refs,'claims':claims,'files':list(checked.values()),'officialTests':'SELECTED_READING_NOT_RUN','runtimeEvidence':'lab-results.json; 9 course-authored tests use actual Cordis, not upstream full suite','differences':['primer wording plugin implements Service is looser than Plugin union/tutorial function; do not teach all plugins as Service subclasses','Service immediate registration is not equivalent to consumer-visible ACTIVE readiness','await resolves stable PENDING too; doc shorthand awaiting loading is not a guarantee ACTIVE','tutorial any plugin access requires inject/scope qualification from reflect implementation']}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
md='# H05 固定 Commit 源码核对清单\n\n基线 `'+COMMIT+'`；运行包 `@deepseek-ai/cordis@4.0.6-alpha.1`。所有关键断言按输入、处理、输出及失败条件审读；链接/字节检查只防漂移，不自动证明语义。\n\n|断言|固定依据|条件与验证范围|\n|---|---|---|\n'
for c in claims:md+=f"|{c['id']} · {c['claim']}|[{c['path']}:{c['start']}–{c['end']}]({c['url']})|{c['validation']}|\n"
md+='\n核心精读为正文列出的五个文件；reflect、教程、Harness 各服务与测试是辅助依据。全部正文引用 '+str(len(refs))+' 个范围、核对文件 '+str(len(checked))+' 个，不能说成必读文件数。每文件 Git blob/SHA256 与全部范围见 [source-check.json](evidence/source-check.json)。\n\n文档精度差异：\n\n'
for d in report['differences']:md+='- '+d+'\n'
md+='\n测试层级：9项为作者编写、执行真实 vendor Cordis 的库级实验；官方 tools/agent-loop 测试只读 setup/action/assertion。未跑完整 Vitest、Loader、Profile、模型网络或整个 Agent。声明发射与类型负例独立保留，不能拿类型通过替代行为。\n'
(ROOT/'source-checklist.md').write_text(md,encoding='utf8')
print(json.dumps({'status':'PASS','references':len(refs),'claims':len(claims),'files':len(checked)}))
