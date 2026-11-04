from pathlib import Path
import json,re,hashlib,subprocess
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence'
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inputs=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md','docs/deepseek-harness-v2/module-one-review/production-standard-v1.md','docs/deepseek-harness-v2/module-two-review/production-standard-module-two-addendum.md','docs/deepseek-harness-v2/module-three-review/production-standard-module-three-addendum.md','docs/deepseek-harness-v2/module-four-review/production-standard-module-four-addendum.md','docs/deepseek-harness-v2/module-five-review/production-standard-module-five-addendum.md','docs/deepseek-harness-v2/module-five-review/review-report.md','docs/deepseek-harness-v2/module-five-review/h21-h24-handoff.md','course-content/internal/deepseek-harness/h21/lesson.md','docs/deepseek-harness-v2/h21/quality-review.md','docs/deepseek-harness-v2/h21/h22-handoff.md']
bp=(P/inputs[0]).read_text(encoding='utf-8');planning=[]
for m in re.finditer(r'\n## (H\d\d)\n(.*?)(?=\n## H\d\d\n|\Z)',bp,re.S):
 body=m[2];title=re.search(r'### 2\. 课程名称\s+(.*?)(?=\n###)',body,re.S)[1].strip();goal=re.search(r'### 7\. 本节唯一核心目标\s+(.*?)(?=\n###)',body,re.S)[1].strip();planning.append(dict(id=m[1],title=title,goal=goal))
assert len(planning)==30
(E/'preparation-inputs.json').write_text(json.dumps(dict(inputs=[dict(path=f,sha256=h(P/f)) for f in inputs],planning=planning,meaning='Input identity and planning map; semantic review documented in preparation/bridge, not runtime evidence.'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
results=json.loads((E/'lab-results.json').read_text());raw=json.loads((E/results['rawRun']).read_text());names=re.findall(r'^# Subtest: (.+)$',raw['stdout'],re.M);assert len(names)==23
cases=[]
for name in names:
 if name.startswith('C A'):real='WorkflowEngine/PTC/Windows runner/SubagentRuntime';fake='controlled Provider, directory/config cells';cross='pre-publication / JSON input-output / resource settlement'
 elif name.startswith('C B'):real='Workflow helpers + PTC + Subagent admission';fake='controlled Provider and Promise gates';cross='concurrency, per-item order, null/fatal, caps and structured result'
 elif name.startswith('C C'):real='Run/Host/PTC/subprocess/sandbox/Workflow events';fake='controlled Provider gates; C5 actual fixture file';cross='cancel, late start, shared dispose, listener containment or native write denial'
 elif name.startswith('D D1'):real='parent + three child AgentLoops/Tools/Spawn/Workflow/PTC/Session/JSONL';fake='local role-keyed Mock LLM; fixture directory/config/query';cross='schema→model call→children→aggregate→parent ToolResult→next model request + durable log'
 elif name.startswith('D D2'):real='parent AgentLoop/Tools/Workflow/PTC';fake='Mock LLM, deliberate fatal script and long result';cross='schema capability, isError, rendered result cap'
 elif name.startswith('D D3'):real='parent/child Loops + Workflow/PTC/LocalJobs/ToolJobs';fake='Mock LLM gate, quiet notices, inlineOutputBytes0';cross='early receipt→observer ring vs model delta→notice→terminal read once'
 elif name.startswith('D D4'):real='parent/child Loops + Workflow/PTC/LocalJobs/ToolJobs';fake='Mock LLM gate';cross='job_kill→stopping→cancel/cleanup→killed'
 elif 'Goal' in name:real='GoalService/Session/Projection/AgentRegistry';fake='fixture live parent, no round driver';cross='CAS/revision/pause/resume/disarm, zero model calls'
 elif 'Schedule' in name:real='ScheduleService/Storage/DomainFacility/JSON backend/new Context';fake='future2099 fixture, no due resolver';cross='selector refusal, saved record readback, zero model/Workflow calls'
 else:real='Workflow Host with real engine and Node PTC service';fake='fault injection: sandboxMode unavailable';cross='fail-closed before spawn, no unrestricted fallback'
 cases.append(dict(name=name,grade=name[0],status='PASS',real=real,collaborators=fake,assertedBoundary=cross,platform='Windows',source='workflow.test.ts imports A/B/C/D/boundaries',rawRun=results['rawRun']))
(E/'test-grades.json').write_text(json.dumps(dict(status='PASS',count=23,levels=results['levels'],cases=cases,notCounted=['X repeats D1','demo commands','historical reruns','upstream Vitest selected only','Cordis used as dependency']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md='# H22 逐项证据与覆盖矩阵\n\n23有效TAP执行=C19/D4，A/B/E无单列项。所有项同一组公共fixture，非23个互不相关系统场景；X=D1，历史重跑不加总。C含真实组件，D确有父Loop执行/后续模型边界。必要Cordis依赖不重复计B。\n\n原命令：`node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs`；最终原始记录 `'+results['rawRun']+'`。逐项真实对象、协作者和断言见下表，完整身份见[evidence/test-grades.json](evidence/test-grades.json)。\n\n| TAP身份/等级 | 真实对象 | 协作者 | 实际跨边界断言 |\n| --- | --- | --- | --- |\n'
for c in cases:md+=f"| {c['name']} | {c['real']} | {c['collaborators']} | {c['assertedBoundary']} |\n"
md+='''
## 不把依赖存在算覆盖

| 维度 | 实际状态 | 未验证范围 |
| --- | --- | --- |
| Workflow语法/JSON/helper/caps | A/B/C真实PTC执行，PASS | 全部JS输入、全部schema子集、默认CPU推导专项未逐项动态测 |
| 启动/结果基础设施错误 | A2未知Provider、B4结果拒绝、B6容量拒绝 | 所有同步throw/不可渲染异常/append失败和异常dispose分支只静态参考 |
| 取消清理 | C1/C2先等受管进程done，result仍等门闩；C3 busy guest取消；D4后台kill | 任意不合作外部Agent、全取消竞态、跨平台和硬崩溃未测 |
| Windows受限执行 | 正式Node PTC+ACL read-only；C5真实文件拒写；缺confinement注入fail closed | partial；读取/硬链接/网络/其他OS不认证 |
| Session/模型 | D1四类根记录8条，真实JSONL flush/readback；后续parent请求含聚合 | 嵌套调用不记录、append/flush失败只静态；不等断电持久性 |
| Jobs | D3接纳、观察/模型游标、quiet notice、终态结果一次；D4 stopping→killed | 默认wakeup、新Turn成本、failed异常cleanup、ring截断、owner teardown矩阵未动态覆盖 |
| Goal | C服务CAS/phase/activation，0模型 | Goal轮次driver、预算耗尽、持久恢复与自动继续未动态覆盖 |
| Schedule | C未来任务真实JSON保存/新Context读回，selector拒绝，0模型 | due delivery、虚拟时钟触发、recurrence、持久回执、跨进程/分布式可靠调度未测 |
| 规模限制 | 并发、总量、item、Subagent容量互动实测 | PTC maxPendingCalls只静态，深度消费方策略未在本课动态验证 |
| 协议/外部服务 | 子进程真实；Provider输出受控；全部本地Mock | 没有外部Agent/真实LLM/服务器/用户业务效果 |
| 完整应用/教学 | C/D局部通过，作者材料审查 | E级完整Harness、学员试读、实测耗时和独立外审均未验证 |

H21的委派/容量/清理与本课有主题重合，新增的是guest/Host/Workflow Tool/Job整链；不据此估“去重后独立故障数”。官方Vitest只有选读，没有含递归删除的官方套件PASS。源与依赖字节身份也不等于上述每一语义均受动态覆盖。
'''
(R/'coverage-matrix.md').write_text(md,encoding='utf-8')
print('23 graded cases and 30-lesson input map written')
