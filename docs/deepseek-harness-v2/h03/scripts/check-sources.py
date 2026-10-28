"""固定 Git blob、行范围、语义锚、真实 AST 证据与官方测试交叉索引。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock=json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf-8-sig'))
CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',str(CACHE.parents[1]/'deepseek-harness-f3803c9')))
tree={}
for row in subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r','-z',COMMIT]).split(b'\0'):
 if row:
  meta,path=row.split(b'\t',1);tree[path.decode()]=meta.split()[2].decode()
checked={}
def check(f):
 if f in checked:return checked[f]
 data=(CACHE/f).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 assert tree[f]==blob,f
 checked[f]={'path':f,'gitBlob':blob,'sha256':hashlib.sha256(data).hexdigest(),'lines':data.decode('utf8').splitlines()};return checked[f]
lesson=REPO/'course-content/internal/deepseek-harness/h03/lesson.md'
text=lesson.read_text(encoding='utf8');assert '__H03' not in text and 'LOCKED/' not in text
urls=sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',text)))
refs=[]
for url in urls:
 m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url);assert m,url
 commit,f,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT
 c=check(f);assert 1<=a<=b<=len(c['lines']),(url,len(c['lines']))
 refs.append({'url':url,'path':f,'start':a,'end':b,'sha256':c['sha256'],'gitBlob':c['gitBlob'],'excerpt':c['lines'][a-1:b],'status':'STATIC_VERIFIED'})
P='packages/core/agent-loop/'
# 表中每项均经分支阅读；needle 仅检查引用没有漂移，不作为调用链成立的理由。
raw=[
 ('S01','Agent/Session 共用身份；创建前准备世界','packages/core/agent/src/index.ts',59,68,'sessionId',None),
 ('S02','setup 后登记 Agent，创建与一次 Turn 不同',P+'src/index.ts',621,640,'runMaintenance',None),
 ('S03','followup 入 next-turn 并请求唤醒',P+'src/agent.ts',170,189,"'next-turn'",None),
 ('S04','Inbox 变更是 Session 事实，claim 不等于 user/message',P+'src/inbox.ts',215,230,"session.append('agent/inbox/spliced'",'inbox.spec.ts:174-193'),
 ('S05','Turn 打开先于 preStep；reject 零 Step',P+'src/agent.ts',327,361,"turnEnds = { kind: 'blocked' }",'interception.spec.ts:253-274'),
 ('S06','领取、选择、工具解析、组装，再进入接纳扩展点',P+'src/agent.ts',283,317,"'agent/pre-step'",'loop.spec.ts:1325-1369'),
 ('S07','准备模型调用先于首次用户消息提交',P+'src/agent.ts',443,479,'await this.prepareRequest','loop.spec.ts:846-865'),
 ('S08','绑定适配器与有效调用配置','packages/llm/llm/src/index.ts',960,1017,'registration.adapter.prepareCall','request-reconstruction.spec.ts:342-393'),
 ('S09','请求头/容量按需记录，派生并冻结消息',P+'src/agent.ts',656,744,'deriveMessages','request-reconstruction.spec.ts:88-112'),
 ('S10','先结算会话，再发 committed end',P+'src/assistant-stream.ts',78,108,'seq = append()','loop.spec.ts:79-123'),
 ('S11','取消有安全前缀时可留 interrupted 消息，错误可留 attempt',P+'src/agent.ts',499,539,'interrupted: true','loop.spec.ts:1403-1427'),
 ('S12','失败流可在同一 Step 再尝试',P+'src/agent.ts',541,563,"'agent/request-error'",'loop.spec.ts:188-212'),
 ('S13','助手响应先结算，再提取调用并交 Tools',P+'src/agent.ts',566,597,'this.loopCtx.tools.execute','loop.spec.ts:491-525'),
 ('S14','选中原生执行器时通过共享批次','packages/core/tool-executor-native/src/index.ts',15,35,'executeToolBatch',None),
 ('S15','tool/call 先于检查与主体分派','packages/core/tools/src/batch.ts',154,170,'settlement.start',None),
 ('S16','策略、可能审批、守卫及取消后才 dispatch','packages/core/tools/src/pipeline.ts',190,231,'this.tools.checkGuards',None),
 ('S17','tool/result 关联调用身份及源序号，进入消息表面','packages/core/tools/src/batch.ts',243,265,'sourceEventSeqs', 'loop.spec.ts:491-525'),
 ('S18','错误工具结果可回读；不等于 Turn error',P+'src/agent.ts',586,609,'result.concluded','coverage-edges.spec.ts:227-253'),
 ('S19','没有工具只是自然结束候选，停止前仍查新输入',P+'src/agent.ts',395,400,"'agent/turn-stopping'",'loop.spec.ts:1224-1267'),
 ('S20','Step finally 关闭；Turn catch 区分 aborted/error，finally 记结束',P+'src/agent.ts',370,425,"'turn/end'",'loop.spec.ts:1851-1875'),
 ('S21','Session commit 是内存日志接受，不等于 flush','packages/core/session/src/index.ts',892,911,'this.log.push(event)',None),
 ('S22','SessionStore 本身不实现持久化','packages/core/session/src/index.ts',1057,1063,'Persistence is intentionally not implemented',None),
 ('S23','消息历史由有效表面派生，不是全部日志','packages/core/session/src/index.ts',999,1029,'deriveEventMessage','request-reconstruction.spec.ts:850-896'),
 ('S24','max-tokens 不分派被截断步骤的工具',P+'src/agent.ts',584,587,"'max-tokens'",'loop.spec.ts:1520-1549'),
 ('S25','Agent 状态 idle/running 不等于任务成败',P+'src/agent.ts',156,168,"'running'",'loop.spec.ts:1851-1875'),
 ('S26','实例拥有者释放负责停止与清理，不是每轮销毁','packages/core/agent/src/index.ts',150,162,'dispose()',None),
 ('S27','官方运行单位：Turn 零或多 Step','docs/architecture.zh.md',81,87,'步骤',None),
 ('S28','实验性且未经安全审计','SAFETY.zh.md',5,15,'尚未接受安全审计',None),
]
claims=[]
for cid,claim,f,a,b,needle,test in raw:
 c=check(f);assert needle in '\n'.join(c['lines'][a-1:b]),(cid,needle)
 item={'id':cid,'claim':claim,'commit':COMMIT,'path':f,'start':a,'end':b,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{f}#L{a}-L{b}','status':'STATIC_SEMANTIC_REVIEWED','test':None}
 if test:
  name,span=test.split(':');aa,bb=map(int,span.split('-'));t=check(P+'tests/'+name)
  assert aa<=bb<=len(t['lines']);item['test']={'path':t['path'],'start':aa,'end':bb,'excerpt':t['lines'][aa-1:bb],'execution':'NOT_RUN; read setup/action/assertions'}
 claims.append(item)
flow=json.loads((ROOT/'evidence/control-flow.json').read_text(encoding='utf8'))
assert len(flow['orders'])==6 and flow['commit']==COMMIT
for f in flow['files']:assert f['sha256']==check(f['path'])['sha256']
probes=json.loads((ROOT/'evidence/actual-probes.json').read_text(encoding='utf8'))
assert probes['commit']==COMMIT and len(probes['checks'])==4 and probes['status']=='PASS'
for f in probes['files']:assert f['sha256']==check(f['path'])['sha256']
# 两个短摘录逐行核对；注释明确是教学删节，不冒充连续原文。
for line in ['const decision = await this.preStep(target, { turn, step })',"this.session.append('step/start', { turn, step })","const toolCalls = message.content.filter(block => block.type === 'tool-call')"]:
 assert line in text and line in '\n'.join(check(P+'src/agent.ts')['lines'])
report={'commit':COMMIT,'status':'STATIC_VERIFIED_WITH_BRANCH_REVIEW','lessonSha256':hashlib.sha256(lesson.read_bytes()).hexdigest(),'references':refs,'claims':claims,'files':[{k:v for k,v in c.items() if k!='lines'} for c in checked.values()],'astOrderChecks':6,'semanticReview':'See source-checklist.md and manual-review.json; neither anchors nor lexical order alone proves execution','upstreamTests':'READ_SELECTED_NOT_EXECUTED','docDifferences':['architecture agent/* generalization has durable inbox splice exception','cancellation can retain interrupted assistant prefix; not uniformly attempt'],'safety':'UNAUDITED_PREVIEW'}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'status':report['status'],'references':len(refs),'claims':len(claims),'files':len(checked),'astOrderChecks':6},ensure_ascii=False))
