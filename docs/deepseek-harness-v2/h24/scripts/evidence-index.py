from pathlib import Path
import json,re,hashlib,platform
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inputs=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md']
for module in ['one','two','three','four','five']:
 d=P/f'docs/deepseek-harness-v2/module-{module}-review'
 for pattern in ['production-standard*.md','README.md','review-report.md','*handoff.md']:
  inputs += [p.relative_to(P).as_posix() for p in sorted(d.glob(pattern))]
for n in [3,4,8,9,10,13,14,15,16,17,18,19,20,21,22,23]:inputs.append(f'course-content/internal/deepseek-harness/h{n:02}/lesson.md')
for n in [21,22,23]:
 inputs.append(f'docs/deepseek-harness-v2/h{n}/quality-review.md')
 inputs += [p.relative_to(P).as_posix() for p in sorted((P/f'course-content/internal/deepseek-harness/h{n}/lab').rglob('*')) if p.is_file()]
inputs += ['docs/deepseek-harness-v2/h23/h24-handoff.md','docs/deepseek-harness-v2/labs/acceptance.test.mjs','docs/deepseek-harness-v2/labs/reference.mjs']
inputs=[f for f in dict.fromkeys(inputs) if (P/f).is_file()]
bp=(P/inputs[0]).read_text(encoding='utf-8');planning=[]
for m in re.finditer(r'\n## (H\d\d)\n(.*?)(?=\n## H\d\d\n|\Z)',bp,re.S):
 body=m[2];title=re.search(r'### 2\. 课程名称\s+(.*?)(?=\n###)',body,re.S)[1].strip();goal=re.search(r'### 7\. 本节唯一核心目标\s+(.*?)(?=\n###)',body,re.S)[1].strip();planning.append(dict(id=m[1],title=title,goal=goal))
assert len(planning)==30
assert next(x['title'] for x in planning if x['id']=='H24')=='大型 Agent 系统测试与综合架构分析'
(E/'preparation-inputs.json').write_text(json.dumps(dict(inputs=[dict(path=f,sha256=h(P/f)) for f in inputs],planning=planning,blueprintRead='本轮先完整通读3280行30讲蓝图，再实施H24；按顺序分段读取，重复GitHub URL仅在工具显示时压缩。H24/H25及模块边界再次核对。',readingScope='第一至五标准/报告、H21–23正文答案与质量、衔接全文；实验在连续研发上下文阅读并复核具体代码。H03–20按依赖关键段落补读。不是独立外审或对旧课全量再验收。',meaning='Hashes identify inputs; do not independently prove semantic review.'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
results=json.loads((E/'lab-results.json').read_text());raw=json.loads((E/results['rawRun']).read_text());names=re.findall(r'^# Subtest: (.+)$',raw['stdout'],re.M);assert len(names)==23
definitions={
 'A1':('YAML Profile / Loader Smoke','AppBoot+Loader+Loop+Tools+Session+JSONL','scripted official MockAdapter and constant safe tool','ACTIVE; safe external file; unchanged bytes; real tool/result'),
 'A2':('negative Profile process','real module/config/activation checks','missing provider / invalid config / bad author export','exit1; no ready; no config file; three parameterized cases'),
 'A3':('actual unwrap contract','Cordis Loader','author good/bad module','good named inject survives, bad default hides inject; guard rejects regression'),
 'A4':('mode contract and missing built process','official mode/launch + ordinary Node','no LLM; deliberately absent lib','invalid mode refuses; no tsx in lib; missing lib fails, positive built NOT_RUN'),
 'B1':('real Replay and Snapshot pure helpers','full author YAML core, replay, normalizer, identity, workspace','reviewed immutable v4 response fixture','Session equality; complete workspace; full prompt/schema sidecars; consumed'),
 'B2':('two fresh Profile worlds','real Loader/Loop/Tools/Session/JSONL','identical input and scripted model','same normalized output and unchanged baseline bytes; repeats not new cases'),
 'B3':('intentional expected mismatch','same real replay chain','wrong expectation only in memory','red detected; correct baseline unchanged, correct comparison green'),
 'B4':('manifest contract','official parser and mode predicate','author manifest','replay false / record true; unknown field rejects; not full suite'),
 'C1':('real SDK stdio subprocess','Client/Server/Protocol + YAML core + JSONL','MockAdapter; official test exit hook','accepted/run/events, actual file and child exit0'),
 'C2':('new SDK PID resume','new process, persistent JSONL/Loop','MockAdapter; test exit hook','no prompt on resume, old byte prefix retained, next request sees history'),
 'C3':('controlled startup failure','real SDK process owner','author child deliberately exit7 before boot','start rejects; actual child reaped exit7'),
 'D7':('real loopback Messages failure','DeepSeekAdapter+Retry+Loop+Session','official rate_limit HTTP server','wire1000ms > ceiling1ms; requests1/retry0/Turn error'),
 'D1':('real loopback HTTP via SDK','Loader+SDK+Adapter+Retry+Tools+JSONL','429/tool/success server; safe tool; test exit hook','requests3; retry/retry-started1; writes1; next request tool; child exit0; port rebind'),
 'D2':('partial disconnect','real Adapter+Retry+Loop+JSONL','official partial_disconnect then success','requests2/retry1/Turn completed/tools0; port released'),
 'D3':('terminal auth failure','real Adapter+Loop+JSONL','official auth_error','requests1/retry0/Turn error/tools0, process0 not task success'),
 'D4':('external-world false success gate','real Tools/Native/Loop+JSONL','tool throw or guard deny; misleading final model text','body1/0, writes0, isError, target absent, unchanged KEEP; two cases'),
 'D5':('in-flight close/cancel','SDK+Loop+Session+JSONL','official MockAdapter hang; test exit hook','gate reached; same close promise; actual child0; abort Turn; tools/writes0'),
 'D6':('two isolated repeats','same D1 real chain','same HTTP script and test exit hook','different root/PID, writer closed, port rebind; not extra semantic scenarios'),
 'P1':('seeded property samples','official Tools/Native/testkit dependencies','constant tool body, boolean input generator','seed24, 40 samples, reject/invalid => body0; one C test'),
 'P2':('Client Runtime subset','official TestRemote class','event double, no UI/Host','unsubscribe, mount rejection, shadow guard; not jsdom or browser'),
}
grades=[]
for i,name in enumerate(names,1):
 level,key=name.split(' ',2)[:2];entry,real,mock,assertions=definitions[key]
 grades.append(dict(index=i,name=name,grade=level,entry=entry,real=real,mock=mock,assertions=assertions,platform=results['platform'],node=results['node'],result='PASS',rawRun=results['rawRun'],command='node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs',scope='named local branch only; not complete shipped application'))
(E/'test-grades.json').write_text(json.dumps(dict(count=23,levels=results['levels'],tests=grades,reuse='X reuses D1; D6 repeats; P1 samples not cases; historical M1–M6 24 A separate'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
failures=[]
for p in sorted(E.glob('traces-*.json')):
 for name,t in json.loads(p.read_text(encoding='utf-8')).items():
  if name=='trace-C1-failure.json' and t.get('wire',{}).get('exit')==3221226505:
   w=t['wire'];failures.append(dict(trace=p.name,key=name,pid=w['pid'],exit=w['exit'],stderr=w['stderr'],world=t['world']))
assert len(failures)>=2
(E/'default-exit-failure.json').write_text(json.dumps(dict(status='OPEN_P1_NO_GO',failures=failures,environment=dict(node=results['node'],platform=results['platform'],release=results['release']),expected='SDK+official HTTP Mock work then shutdown, actual exit0',actual='shutdown response received but default process.exit path ends with Windows native libuv assertion, exit0xC0000409',scope='author source YAML composition; not proof that every shipped build or OS fails',attempts='connection close header and owned undici dispatcher close did not fix default exit; original failures retained',currentFixture='official runtime-only SDK exit hook => process.exitCode plus stdin.pause, natural process exit, all23 pass; does not clear default branch',requiredClosure='independent minimal reproduction, default exit ownership/Node compatibility diagnosis and zero-exit regression on relevant product entry; no upstream fixed-source edit in this lesson'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
matrix='# H24 覆盖与等级矩阵\n\n23项=C9/D14。每行对应TAP身份；A2有3行，D4有2行；X和重跑不另加，40属性样本只算1。环境Windows/Node24.16.0，命令及所有程序hash见lab-results。\n\n| # / 级别 | 入口与真实组件 | Mock/受控部分 | 实际断言 |\n| --- | --- | --- | --- |\n'
for r in grades:matrix+=f"| {r['index']} / {r['grade']} {r['name'][2:]} | {r['entry']}；{r['real']} | {r['mock']} | {r['assertions']} |\n"
matrix+='\n## 环境能力独立标记\n\n| 能力 | 状态/边界 |\n| --- | --- |\n| Keyless Mock Provider | 已执行：官方MockAdapter/Replay；真实Adapter到官方回环HTTP Mock |\n| 真实Provider / 互联网 | NOT_RUN；无付费请求，不从dummy key推认证安全 |\n| 真实SDK子进程 | 已执行；当前通过使用runtime-only exit钩子，默认分支P1见报告 |\n| 真JSONL / 跨进程恢复 | 已执行：正常关闭后新PIDResume；非崩溃/断电认证 |\n| 真实网络 | 回环HTTP/SSE已执行；WebSocket/真实互联网未执行 |\n| 完整作者核心Profile | 源码YAML核心成功；不是完整发行Profile或E |\n| lib正向入口 / E keyless | NOT_RUN；A4仅证缺产物响亮失败 |\n| Client Runtime / Remote Mock | TestRemote子集C；完整SlotRuntime/jsdom及RemoteMock均NOT_RUN |\n| 产品Web真实浏览器 | NOT_RUN；缺产品built/Host依赖；Chrome教材QA单列 |\n| Trajectory / OTel / feedback | 静态固定分支研究，未执行上报或产品视图；无用户数据外发 |\n| 合成性能 / Provider性能和成本 | NOT_RUN，测试duration不是基准 |\n| 学员/实测学习时间/外审 | PENDING |\n\n## 原始证据\n\n[lab-results](evidence/lab-results.json)、[23项身份](evidence/test-grades.json)、[当前TAP](evidence/lab-tests.txt)、[实际组件/协议/文件trace](evidence/behavior-traces.json)、[X trace](evidence/trace-X.json)、[默认退出失败](evidence/default-exit-failure.json)。原始run和历史失败保留。测试PASS不等故障场景任务成功，不等产品GO。\n'
matrix+='\n额外故障边界：模型超时、SDK任务中途失联、tool/call已记录但缺tool/result的完整注入均NOT_RUN。主动取消不替超时，启动前exit7不替中途断连，正常JSONL恢复不替缺结果修复；未知外部效果先查独立事实/幂等状态，不自动重做。本轮不截断真实存储。\n'
(R/'coverage-matrix.md').write_text(matrix,encoding='utf-8')
traces=sorted(E.glob('traces-*.json'))
for key in ['trace-X.json']:
 candidates=[(p,json.loads(p.read_text(encoding='utf-8'))[key]) for p in traces if key in json.loads(p.read_text(encoding='utf-8'))]
 assert candidates
 p,t=candidates[-1];(E/key).write_text(json.dumps(dict(origin=p.name,**t),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
figures=[]
for n in [21,22,23,24]:
 for f in json.loads((R.parent/f'h{n}/evidence/figures.json').read_text(encoding='utf-8')):
  figures.append(dict(lesson=f'H{n}',id=f['id'],source=f'docs/deepseek-harness-v2/h{n}/'+f['source'],image=f'docs/deepseek-harness-v2/h{n}/'+f['image'],sourceSha256=h(R.parent/f'h{n}'/f['source']),imageSha256=h(R.parent/f'h{n}'/f['image']),caption=f['caption']))
assert len(figures)==16
(E/'module-six-figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Inputs, 23 test identities, open native-exit P1, X trace and sixteen-figure index generated')
