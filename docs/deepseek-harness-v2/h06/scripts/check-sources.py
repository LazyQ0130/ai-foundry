"""固定 Git 字节、正文行范围与关键断言索引。定位检查不能代替语义审查。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
lock=json.loads((ROOT/'evidence/source-lock.json').read_text(encoding='utf8'))
COMMIT=lock['commit'];CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',lock['gitCache']))
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
lesson=(REPO/'course-content/internal/deepseek-harness/h06/lesson.md').read_text(encoding='utf8')
refs=[]
for url in sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',lesson))):
 m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url);assert m,url
 commit,p,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT
 assert 1<=a<=b<=check(p)['lineCount'],url
 refs.append({'path':p,'start':a,'end':b,'url':url,'status':'FIXED_BLOB_AND_RANGE_VERIFIED'})
# 每行是人工审读的输入、行为、结果/失败边界；needle 仅用于定位防漂移。
raw=[
 ('E01','isBailed只让null、false、undefined继续；0/空字符串/NaN停止','vendor/cordis/src/events.ts',7,15,'value !== null','真实serial/bail十种值及返回/调用数'),
 ('E02','事件声明给类型信息，不注册回调、不强制运行模式','vendor/cordis/src/events.ts',34,106,'Parameters<Events[K]>','TS2769反例、发射擦除、故意emit一个bail契约事件'),
 ('E03','on登记并绑定当前上下文；回收细节不在本课展开','vendor/cordis/src/events.ts',288,301,'this.ctx.reflect.bind','练习B真实插件挂载；生命周期资源回收未专项验证'),
 ('E04','dispatch先按适用条件筛选并绑定this，生成回调列表','vendor/cordis/src/events.ts',165,175,'.filter(hook','静态分支审读；未专项运行Harness的Scoped筛选'),
 ('E05','prepend会改变入列位置，默认顺序不能无条件推广','vendor/cordis/src/events.ts',250,259,'prepend','真实prepend顺序测试'),
 ('E06','emit同步调用，忽略返回值与Promise，不自动等待','vendor/cordis/src/events.ts',189,196,'.map(cb => cb(...args))','门闩前后轨迹；同步throw中断；异步拒绝子进程退出1'),
 ('E07','parallel并发等待全部settled，失败合成AggregateError','vendor/cordis/src/events.ts',177,187,'Promise.allSettled','双门闩B先结束、混合同步/异步错误仍等其余完成'),
 ('E08','本版parallel给internal/dispatch的诊断标签为emit','vendor/cordis/src/events.ts',183,186,"this.dispatch('emit'",'真实诊断监听器核对；不更改上游，不影响allSettled结论'),
 ('E09','serial逐一await后按isBailed返回；错误停止后续','vendor/cordis/src/events.ts',198,209,'await cb(...args)','false继续0停止；门闩证明顺序；同步/异步错误'),
 ('E10','bail当场判断；Promise对象本身会停止','vendor/cordis/src/events.ts',211,222,'const result = cb(...args)','Promise身份/兑现false但后续零次；同步throw及拒绝子进程'),
 ('E11','waterfall取末尾默认回调，返回最外层结果，不自动await','vendor/cordis/src/events.ts',224,243,'return next()','两层21/三层51；异步Promise与AsyncIterable实际消费'),
 ('E12','next共享剩余回调队列，不是把上层返回值作为新参数','vendor/cordis/src/events.ts',234,242,'cbs.shift() ?? inner','每层input仍2；回程2→5→50→51及完整轨迹'),
 ('E13','无next即不进入下游，false/undefined也不自动继续','vendor/cordis/src/events.ts',237,242,'return cb(...args)','返回false短路；B拒绝回到A；漏next主体零次'),
 ('E14','重复next没有一次性保护，队列耗尽会重复默认主体','vendor/cordis/src/events.ts',237,242,'cbs.shift() ?? inner','同步主体两次、B短路后A再进C、异步共享游标'),
 ('E15','异常遵循实际调用/Promise返回，外层await才能catch异步拒绝','vendor/cordis/src/events.ts',234,243,'return cb(...args)','同步catch、return await next恢复、return next拒绝向外'),
 ('E16','官方短路示例仍经过已进入外层的结果包装','docs/cordis-tutorial/04-events.zh.md',109,138,'toUpperCase','文档静态对照；课程B真实执行拒绝后外层包装'),
 ('E17','tools/pre-execute声明Promise决策，next默认allow','packages/core/tools/src/events.ts',8,18,'Promise<PreToolDecision>','声明静态审读，与pipeline/官方拒绝测试交叉'),
 ('E18','prepare分发pre-execute，ask/deny等分支影响是否继续','packages/core/tools/src/pipeline.ts',190,232,"'tools/pre-execute'",'静态读调用/默认值/分支/catch；未运行完整工具管线'),
 ('E19','tools/execute围绕主体，返回执行结果而非allow决策','packages/core/tools/src/pipeline.ts',295,324,'this.dispatchToolBody(mutableExec)','静态与事件声明19–29交叉，未运行完整工具管线'),
 ('E20','tools/post-execute默认accept，处理结果不自动回滚副作用','packages/core/tools/src/pipeline.ts',486,499,"kind: 'accept'",'静态边界审读，不作事务或回滚保证'),
 ('E21','tools/result的错误隔离是该业务观察契约，不是所有emit保证','packages/core/tools/src/events.ts',42,49,'Listener failures are contained','只说明声明契约，未实测完整工具观察隔离'),
 ('E22','agent/pre-step声明候选输入与Promise决策','packages/core/agent/src/runtime-types.ts',338,350,'Promise<PreStepDecision>','静态声明；不是已开始模型请求'),
 ('E23','默认preStep以enter消息作内层，reject在模型请求前处理','packages/core/agent-loop/src/agent.ts',283,317,"'agent/pre-step'",'静态分支及官方拒绝断言253–274交叉'),
 ('E24','llm/stream返回AsyncIterable，Loop请求有深冻结边界','packages/llm/llm/src/index.ts',64,75,'AsyncIterable<StreamChunk>','声明/实现静态；课程流惰性消费真实实验不代表模型网络'),
 ('E25','LlmRuntime.streamWithRegistration用waterfall围住适配器流','packages/llm/llm/src/index.ts',1174,1183,"'llm/stream'",'AST归属+静态默认回调；未执行真实适配器'),
 ('E26','tool-jobs前置记录输出上限并return next','packages/jobs/tool-jobs/src/index.ts',285,290,'return next()','静态读消费者；与练习C定位参照交叉'),
 ('E27','检查点插件可在前置边界等待/包装，流在迭代时检查点','packages/session/session-checkpoint-policy/src/index.ts',29,82,'yield* next()','静态读辅助函数和三个监听器；未运行持久化'),
 ('E28','官方工具拒绝例断言错误原因；不是作者已跑官方套件','packages/core/tools/tests/tools.spec.ts',788,817,"tools/pre-execute",'只选读setup/action/assertions，setup另见33–39'),
 ('E29','官方pre-step拒绝例模型零次且Turn以blocked结束','packages/core/agent-loop/tests/interception.spec.ts',253,274,'blocked','只选读mock模型/setup/action/assertions；未执行官方Vitest'),
 ('E30','Session.commit先更新内存日志后通知，不单独证明磁盘flush','packages/core/session/src/index.ts',892,911,'this.log.push(event)','沿用H03边界，静态审读，不运行磁盘恢复'),
 ('E31','agent/inbox/spliced是会话事实，不能只按agent前缀分类','packages/core/agent-loop/src/inbox.ts',215,230,"this.session.append('agent/inbox/spliced'",'静态append与相邻emit区分'),
 ('E32','项目为尚未接受安全审计的实验性开发者预览','SAFETY.zh.md',5,15,'尚未接受安全审计','保留官方限制；27项事件实验不是安全认证'),
]
claims=[]
for cid,claim,p,a,b,needle,validation in raw:
 assert 1<=a<=b<=check(p)['lineCount'],cid
 lines=(CACHE/p).read_text(encoding='utf8').splitlines();assert needle in '\n'.join(lines[a-1:b]),(cid,needle)
 claims.append({'id':cid,'claim':claim,'path':p,'start':a,'end':b,'validation':validation,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{p}#L{a}-L{b}','status':'AUTHOR_SEMANTIC_REVIEW_WITH_SCOPED_EVIDENCE'})
for f in lock['vendorFiles']:
 fact=check(f['path']);assert fact['sha256']==f['sha256'] and fact['gitBlob']==f['gitBlob']
for p in ['LICENSE','docs/cordis-primer.zh.md','docs/cordis-api/events.zh.md','docs/architecture.zh.md','packages/core/agent-loop/tests/serial-listener-review.spec.ts']:
 check(p)
reference=json.loads((REPO/'course-content/internal/deepseek-harness/h06/lab/locate-reference.json').read_text(encoding='utf8'))
assert reference['event']=='tools/pre-execute' and reference['mode']=='waterfall'
for key,needle in [('declaration','Promise<PreToolDecision>'),('publisher',"'tools/pre-execute'"),('consumer','return next()'),('test',"'tools/pre-execute'")]:
 r=reference[key];check(r['path']);a,b=r['start'],r['end']
 assert needle in '\n'.join((CACHE/r['path']).read_text(encoding='utf8').splitlines()[a-1:b]),key
for p,a,b,needles in [
 ('packages/core/tools/src/pipeline.ts',197,215,["kind: 'allow'", "gate.kind === 'ask'", "decision.kind === 'deny'"]),
 ('packages/core/tools/tests/tools.spec.ts',788,817,["kind: 'deny'",'expect(result.isError).toBe(true)',"text: 'Error: denied by policy'",'expect(result.error).toEqual']),
 ('packages/core/agent-loop/tests/interception.spec.ts',253,274,['toHaveLength(0)',"'step/start'",'blocked']),
]:
 text='\n'.join((CACHE/p).read_text(encoding='utf8').splitlines()[a-1:b])
 for needle in needles:assert needle in text,(p,needle)
differences=[
 'parallel实现为allSettled；不是遇到首个拒绝就立即结束的Promise.all表述。',
 'parallel在internal/dispatch报告emit标签，此为固定版本实测事实；不能从该标签推导等待行为。',
 'primer的替换结果措辞必须结合真实next调用解释：本版参数不自动接收前一层返回值。',
 '事件类型和@mode约定不在运行时强制分发模式；调用方仍须遵守具体事件契约。',
 'waterfall没有next一次性保护；不得套用其他中间件框架的重复调用报错规则。',
 'serial/bail不是任意返回或truthy判定；waterfall也不采用isBailed继续规则。',
]
report={'status':'PASS','commit':COMMIT,'method':'each file Git blob SHA1 matched fixed commit ls-tree; SHA256 retained; manual semantics plus scoped execution','references':refs,'claims':claims,'files':list(checked.values()),'exerciseCReference':'fixed source/ranges and relevant statements verified; free explanations are not keyword-graded','officialTests':'SELECTED_READING_NOT_RUN','runtimeEvidence':'27 course-authored tests use actual vendor Cordis, plus mutation and two isolated rejection processes; not full Harness','differences':differences}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
md=f'# H06 固定 Commit 源码核对清单\n\n基线 `{COMMIT}`；Cordis `4.0.6-alpha.1`。关键语义由作者按输入、调用、等待、返回及失败分支审读。字节、行号与AST只防漂移，不能独自证明结论。\n\n|断言|固定依据|条件与证据范围|\n|---|---|---|\n'
for c in claims:md+=f"|{c['id']} · {c['claim']}|[{c['path']}:{c['start']}–{c['end']}]({c['url']})|{c['validation']}|\n"
md+=f'\n正文共{len(refs)}个固定引用范围、{len(claims)}条断言、{len(checked)}个逐字节核对文件。核心精读4文件：Cordis事件实现、tools事件声明、工具管线精选片段、tool-jobs消费者；文档、其他生产点和官方测试是辅助依据，不要求全部逐行精读。每文件Git blob/SHA256见 [机器清单](evidence/source-check.json)。\n\n## 文档/实现精度记录\n\n'
for d in differences:md+='- '+d+'\n'
md+='\n## 执行边界\n\n真实执行的是固定 vendor Cordis/Cosmokit 与课程事件/插件夹具。Harness表中五事件的声明、发布和消费者按固定代码审读；没有运行完整工具管线、Agent Loop、Scope策略、检查点持久化或模型适配器。官方测试只选读setup/action/assertions，未跑其Vitest套件；serial-listener-review也只读，未执行其文件清理。\n\n练习C参照只自动核固定位置和语句；其他正确路线及设计解释需人工判断。运行时扩展事件不自动写SessionEvent；Session.commit与flush边界另列，不以通知冒充落盘。\n'
(ROOT/'source-checklist.md').write_text(md,encoding='utf8')
print(json.dumps({'status':'PASS','references':len(refs),'claims':len(claims),'files':len(checked)}))
