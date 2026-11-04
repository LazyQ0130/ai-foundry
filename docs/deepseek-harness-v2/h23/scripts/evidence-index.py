from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence'
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inputs=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md']
for module in ['one','two','three','four','five']:
 d=P/f'docs/deepseek-harness-v2/module-{module}-review'
 inputs += [p.relative_to(P).as_posix() for p in sorted(d.glob('production-standard*.md'))]
 inputs += [p.relative_to(P).as_posix() for p in sorted(d.glob('README.md'))]
 inputs += [p.relative_to(P).as_posix() for p in sorted(d.glob('review-report.md'))]
 inputs += [p.relative_to(P).as_posix() for p in sorted(d.glob('*handoff.md'))]
for n in ['h03','h04','h08','h09','h10','h12','h17','h18','h21','h22']:
 inputs.append(f'course-content/internal/deepseek-harness/{n}/lesson.md')
for n in ['h21','h22']:
 inputs.append(f'docs/deepseek-harness-v2/{n}/quality-review.md')
 inputs += [p.relative_to(P).as_posix() for p in sorted((P/f'course-content/internal/deepseek-harness/{n}/lab').glob('*')) if p.is_file()]
inputs+=['docs/deepseek-harness-v2/h22/h23-handoff.md']
inputs=list(dict.fromkeys(inputs));bp=(P/inputs[0]).read_text(encoding='utf-8');planning=[]
for m in re.finditer(r'\n## (H\d\d)\n(.*?)(?=\n## H\d\d\n|\Z)',bp,re.S):
 body=m[2];title=re.search(r'### 2\. 课程名称\s+(.*?)(?=\n###)',body,re.S)[1].strip();goal=re.search(r'### 7\. 本节唯一核心目标\s+(.*?)(?=\n###)',body,re.S)[1].strip();planning.append(dict(id=m[1],title=title,goal=goal))
assert len(planning)==30
old=json.loads((R.parent/'h22/evidence/preparation-inputs.json').read_text(encoding='utf-8'))
assert next(x['sha256'] for x in old['inputs'] if x['path']==inputs[0])==h(P/inputs[0])
(E/'preparation-inputs.json').write_text(json.dumps(dict(inputs=[dict(path=f,sha256=h(P/f)) for f in inputs],planning=planning,blueprintRead='Complete 30-lesson reading reused from preceding H22 in this continuous session; identical SHA256 verified before H23 implementation; H23/H24 and module boundary reread.',meaning='Input identity, not proof that every line was semantically reviewed; scope in preparation/bridge.'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
results=json.loads((E/'lab-results.json').read_text());raw=json.loads((E/results['rawRun']).read_text());names=re.findall(r'^# Subtest: (.+)$',raw['stdout'],re.M);assert len(names)==25
definitions={
 'A1':('real CLI parser in subprocess','five Profile choices / first unknown token app boundary','no model'),
 'A2':('real CLI parser with process.exit','help/version exit0; invalid/missing/conflicting args exit1','no model'),
 'A3':('loadProfileDirectory + composeEntries','new Home profile; insert then whole-config replace; unsafe profile refusal','empty author bundle and patch'),
 'A4':('runCli + Profile reader','actual dump exit0 and startup missing-profile exit1','empty author Profile; no model'),
 'B1':('Client RPC + Gateway + SessionController + Loop + JSONL','standard envelope, accepted receipt, follow snapshot/events, flush/readback','controlled fetch/stream/authenticated owner Peer; Mock model'),
 'B2':('Gateway + RemoteAccess + SessionController','missing named arg / business field conflict / guest denied before model','controlled guest Peer/policy; no real browser authentication'),
 'B3':('Gateway + SessionController + Loop','cancel accepted then actual idle and aborted Turn','controlled stream and cooperative Mock gate'),
 'B4':('installConnection + ConnectionController','old aborted source drains before new source; stale ready ignored; peak1','controlled GenerationSource/cleanup gate; no socket'),
 'B5':('Gateway + Session history + JSONL backend in new Context','passive page repull, zero Agent and zero model requests','controlled carrier; no page reload/crash'),
 'B6':('SessionEventStream + RemoteStream','revision0→1→3 gap; replace/assistant-stream/replace; no fabricated frame','controlled decoded remote stream, not WebSocket'),
 'C1':('SDK Client/Server/Protocol + AppBoot/Loader + Loop + JSONL','real stdio child; run notifications/result; shutdown exit0','isolated author Profile / prepare-mounted Mock core; not shipped sdk-minimal'),
 'C2':('low SDK Client + Server + Loop','prompt messageId before wait gate; notifications and result after release','cooperative Mock adapter with explicit file gate'),
 'C3':('DeepSeekHarness/HarnessSession + low Client + Loop','two prompts before next idle; final response from second task','same real SDK pipe; controlled Mock queue/gate'),
 'D1':('two independent SDK child PIDs + JSONL + Loop','close then resume no auto prompt; history prefix retained/grows; next request sees old fact','normal close only, same isolated storage/workspace'),
 'D2':('SDK Server + real writer ownership','missing / already open / second-PID writer-held refusal without replacement','two local SDK children, no cross-host lock certification'),
 'D3':('SDK resume + JSONL format reader','new fixture header version999 rejects; zero model work','deliberately modified new fixture only; not full corruption matrix'),
 'D4':('SDK JSON-RPC transport + method dispatcher','typed errors, unknown method, bad JSON ignored, params[] normalized, later valid prompt runs actual Loop','direct author write to private child stdin for negative frames'),
 'D5':('SDK close/shutdown + Loop + writer release + new JSONL reader','close Promise memo; processing abort; exit0; user and aborted Turn read from disk','cooperative Mock; no forced kill/crash/rollback'),
 'D6':('SDK bidirectional approval + ApprovalService + real Tool/Loop','only allowed-once effect1; missing unavailable / rejected / cancelled effect0','constant tool increments memory counter; no real external effect'),
 'D7':('high SDK initialize + Server + child cleanup','bad provider rejects; old child exit0 before new-PID successful Mock run','retry uses newly configured high client; AggregateError cleanup-failure branch static'),
 'D8':('SDK user-question bridge + client callback + Tool/Loop','real server→client request and explicit JSON answer over stdio','single controlled question; not all malformed answers'),
 'D9':('SDK question cancellation + close/shutdown','AbortSignal and exit0 before late answer; no request resurrection','callback deliberately waits on author gate; own external resources out of scope'),
}
cases=[]
for name in names:
 key=re.match(r'[CD] ([A-D]\d+)',name)[1];real,boundary,fake=definitions[key]
 cases.append(dict(name=name,grade=name[0],status='PASS',real=real,collaborators=fake,assertedBoundary=boundary,platform='Windows',source='clients.test.ts imports A/B/C/D',rawRun=results['rawRun']))
assert sum(x['grade']=='C' for x in cases)==7 and sum(x['grade']=='D' for x in cases)==18
(E/'test-grades.json').write_text(json.dumps(dict(status='PASS',count=25,levels=results['levels'],cases=cases,notCounted=['X repeats B1/C1','demo commands','historical reruns','upstream reference tests not executed','Cordis as dependency']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md='# H23 逐项证据与覆盖矩阵\n\n25 有效 TAP 执行=C7/D18。四个 D6 审批分支分别计执行项，但不是四套独立系统。A/B/E 无单列项，Cordis 不重复计 B；X 复用 B1/C1，历史重跑不加总。\n\n最终命令 `node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs`；原始记录 `'+results['rawRun']+'`，包含参数、exit、stdout/stderr、scratch 和实际程序哈希。\n\n| 执行身份 | 真实组件 | 明确断言 | 协作者/限制 |\n| --- | --- | --- | --- |\n'
for x in cases:md+=f"| {x['name']} | {x['real']} | {x['assertedBoundary']} | {x['collaborators']} |\n"
md+='''
## 证据维度分别判断

| 维度 | 实际状态 | 未证明的范围 |
| --- | --- | --- |
| 进程 | CLI 解析/dump 独立进程；SDK 持有真实 Node stdio 子进程，trace 含 PID/exit0 | 没有打包发行 CLI、第三方 ACP/Python 进程或异常强杀专项 |
| 服务 | SDK 作者 Profile 经真实 AppBoot/Loader；prepare 直接挂核心；SDK 在 boot settled 后挂载 | 不是发行版 sdk-minimal 的完整 Patch/服务树，也非生产 Profile |
| Web 载体 | Client RPC/Gateway/Remote/Controller/Session 真实；fetch/stream/Peer 受控 | 无真实 HTTP 服务器浏览器握手、WebSocket/cookie/Origin、完整 Web UI |
| SDK 载体 | 正式 Client/Server/Protocol 双向换行 stdio，请求/通知/审批/问答闭环 | 未测任意 stdout 污染、全部协议非法输入、所有超时/断线竞态 |
| 持久化 | 真 JSONL；B1 flush/readback、B5 新 Context 被动读取、D1 新 PID Resume、D5 处理中关闭后新 reader 读回 | 非断电/崩溃认证、全磁盘错误/截断/语义修复矩阵 |
| 取消 | Web cancel 回执后等实际 idle；SDK 无 session/cancel，D5 用 close；D9 问答晚答 | 不承诺外部效果撤回；受管后代 wait 与所有者拒绝全矩阵仅静态 |
| 权限 | B2 明确 guest 经 RemoteAccess 被拒，零模型；D6 明确回答与效果计数 | 不把构造 owner Peer 算认证；没有完整浏览器安全审计/OS sandbox |
| 浏览器 | 本地课程阅读器以实际 React/CSS 三宽度运行、复制/折叠/原图/横滚 | 这是教材 QA，不是 Harness 产品 Web UI 或授权测试 |
| 其他协议 | ACP/Python 文档及边界静态审读 | 未运行 ACP 第三方客户端或 Python SDK |
| E 与教学 | C/D 局部通过、作者自审 | 完整 E、真实 Provider、学员试读、实测时间与独立外审未验证 |

来源行号、Git/SHA256 和完整依赖锁只证明身份；不能据其存在给未经过的分支打动态 PASS。官方参考测试已定位/按相关性选读，没有执行其递归清理，原始失败与修复都保留。
'''
(R/'coverage-matrix.md').write_text(md,encoding='utf-8')
print('25 graded cases and 30-lesson input map written')
