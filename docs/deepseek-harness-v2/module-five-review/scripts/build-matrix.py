from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[4];BASE=ROOT/'docs/deepseek-harness-v2';HERE=BASE/'module-five-review'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def env(h):
 p=HERE/f'evidence/{h}/evidence/lab-results.json';return json.loads(p.read_text(encoding='utf-8'))
def classify(h,n,name):
 if h=='h17':
  if n==10:return ('request','Session canonicalHeader/request-header','完整header快照/空字段；无Runtime或磁盘')
  if n==11:return ('request','Session/tool-history','历史工具schema与当前移除；无实际工具执行')
  if n==13:return ('surface','Session/Surface/ProjectionRegistry','同一人工合法日志折叠；无活Loop/磁盘')
  if n==14:return ('request','Session/request-header/Surface','人工前缀重建过去请求；非活Loop请求')
  if n==15:return ('append','Session seed replay','人工断Seq种子；不排序或修补')
  return [('append','Session/Store','无后端；计数flush listener及非法JSON'),('surface','Session/Surface','人工事件，未承诺完整持久生命周期'),('projection','Session/ProjectionRegistry','自定义同步任务fold，内存checkpoint'),('request','AgentLoop/Runtime/Session/NativeTools','脚本Adapter、常量工具、无磁盘')][0 if n<=6 or n==16 else 1 if n in [7,8,9,10,11,15,17] else 2 if n in [12,13,14] else 3]
 if h=='h18':
  if n in [2,3]:return ('persistence','JSONL Handle/scanner/isolated Node reader','真实文件；同进程新后端与独立PID正常读取；非完整Agent崩溃')
  if n==15:return ('append','SessionStore/preparation','未发布Session身份/同步release；无JSONL写入')
  if n==21:return ('persistence','JSONL Handle append snapshot','调用后改原批次；真实隔离文件读回；非外部进程竞态')
  if n==22:return ('persistence','JSONL Handle cancellation','工作开始前signal已abort；不代表活动物理sync可中断')
  if n>=23:return ('resume' if n==23 else 'fork','AgentLoop/JSONL/Session/NativeTools','脚本模型与sum；开放尾或正常保存；同进程新实例')
  if n in [6,7,8,9,14]:return ('repair','JSONL/ToolCallRecovery' if n<10 else 'buildForkSeed/ToolCallRecovery','人工合法前缀；直接调用repair，不是完整活Loop中断')
  if n in [10,11]:return ('physical','JSONL scanner/write path','新建文件半行/撕裂checksum fixture；没有实际断电')
  if n in [13]:return ('fork','SessionStore/buildForkSeed','人工多Turn/Step；内存分支')
  if n==5:return ('ownership','JSONL/kernel lease/isolated Node workers','本次新PID，同Windows登录会话；非跨平台')
  if 16<=n<=20:return ('format','JSONL/format readers','隔离格式文件；写迁移Worker未运行')
  return ('persistence','JSONL Handle/Tracker/SessionStore','真实临时磁盘；12为实例persistBatch故障，非物理sync故障')
 if h=='h19':
  if n==1:return ('tokens','TokenMeter/Session/Runtime','受控Usage与图片价格；无真实账单')
  if n==2:return ('surface','Pruner/Session/Meter','人工开放Turn；富块；无真实模型')
  if 3<=n<=18:return ('compaction','Basic/Session/Meter/Runtime','结构Agent；真实摘要协议组件，脚本输出；提交失败注入仅当前实例')
  if n==31:return ('resume','AgentLoop/Basic/Pruner/Meter/JSONL','脚本Adapter；none；同进程新实例；闭合后恢复')
  if n==32:return ('images','Offload/Session/Basic/Runtime','附件引用fixture；不是实际图片Provider')
  return ('compaction','AgentLoop/Basic/Runtime/Session'+('/Commands' if n==33 else ''),'脚本模型、合法seed；34用flush listener拒绝，非磁盘错误')
 if h=='h20':
  if n==1:return ('retry','resolveRetryPolicy','纯官方策略函数；无请求')
  if n==19:return ('retry','LlmRuntime/受控Adapter','直接一次ctx.llm.stream；未创建或运行AgentLoop，无Session重试事件；复核降为C')
  if n in [28,29]:return ('tools','AgentLoop/ToolRuntime/NativeTools/Session','内存业务/策略拒绝，不是Agent取消；本批正常完成')
  if n==35:return ('cancel','AgentHandle/AgentLoop/Tools/Session','dispose等待受控工具门闩；未挂真实JSONL')
  if n==36:return ('cancel','Retry plugin/AgentLoop/Session','插件lifetime退出；Turn error而非user aborted')
  if n==44:return ('side-effects','ToolCallRecovery/Session + 教学Map','真实repair；业务键幂等与盲重仅内存替身，无真实外部服务')
  if n<=23:return ('retry' if n not in [22,23] else 'compaction','AgentLoop/Runtime/Retry/Session'+('/Basic/Meter' if n in [22,23] else ''),'脚本Adapter；虚拟timer/受控random；19直接Runtime；20在middleware边界失败')
  if n<=37:return ('cancel','AgentLoop/Tools/Retry/Session','受控门闩/内存效果/虚拟timer；明确放行；非强杀外部进程')
  if n<=39:return ('resume','AgentLoop/Retry/JSONL/Session','none，同进程新实例；闭合重读；不复启旧timer')
  if n<=44:return ('repair','ToolCallRecovery/Session','外部Map为教学模拟；closed-step仅组件边界')
  return ('side-effects','AgentLoop/Tools/Retry/JSONL/Repair','内存假效果；精确前缀写新ID副本；非物理崩溃/Fork')
rows=[]
for h in ['h17','h18','h19','h20']:
 raw=BASE/f'{h}/evidence/lab-tests.txt';tap=raw.read_text(encoding='utf-8');current=HERE/f'evidence/{h}/evidence/lab-tests.txt';now=current.read_text(encoding='utf-8')
 tests=re.findall(r'^ok (\d+) - ([CD]) (.*)$',tap,re.M);currentNames=re.findall(r'^ok \d+ - ([CD]) (.*)$',now,re.M)
 assert [(g,n) for _,g,n in tests]==currentNames
 runs=[]
 for p in sorted((BASE/f'{h}/evidence').glob('run-*.json')):
  v=json.loads(p.read_text(encoding='utf-8'))
  if v.get('exit')==0 and v.get('args',[None])[0]=='--test':runs.append((p,v))
 p,v=runs[-1]
 for number,originalGrade,name in tests:
  grade='C' if h=='h20' and int(number)==19 else originalGrade
  n=int(number);theme,components,boundary=classify(h,n,name)
  rows.append({'id':f'{h.upper()}-{n:02}','course':h.upper(),'test':grade+' '+name,'claim':name,'components':components,'fixtureBoundary':boundary,'platform':'win32 x64 / Node24 (current runner details in lab-results)','originalCommand':f'node docs/deepseek-harness-v2/{h}/scripts/run-labs.mjs; child: tsx --tsconfig <scratch>/tsconfig.json --import <scratch>/bootstrap.mjs '+' '.join(v['args']),'originalResult':f'ok {n}; suite fail0, skipped0','grade':grade,'originalRaw':p.relative_to(ROOT).as_posix(),'originalTapSha256':sha(raw),'currentCommand':f'node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs {h}','currentResult':'PASS','currentTap':current.relative_to(ROOT).as_posix(),'currentRaw':[x.relative_to(ROOT).as_posix() for x in sorted((HERE/f'evidence/{h}/evidence').glob('run-*-tests.json'))],'theme':theme,'crossCourseOverlap':theme in ['surface','request','resume','repair','compaction','retry','cancel'],'riskUncovered':boundary+'；完整Harness E/真实Provider/真实学员未验证'})
  rows[-1].update(originalGrade=originalGrade,originalTest=originalGrade+' '+name,gradeReview='direct Runtime only; D→C' if grade!=originalGrade else 'retained after boundary review')
# Store all test rows; semantic overlap is never converted into a unique failure count.
(HERE/'evidence/test-matrix.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md=['# H17–H20 逐项测试证据矩阵','', '逐项来自原TAP、实际test及被调用实践程序。原成功/失败run均保留；当前复验重定向到本目录，未覆盖历史。互斥分级按主要受测责任与真实跨边界断言：基础依赖不另计B/C，结构Agent不冒充真实Loop。A/B/E无独立执行项，不表示D中没有教学替身。','', '原报告123项=C64/D59；边界复核后C65/D58，H20 raw-stream由D降C。新增5项D另列cross-course-validation.md，当前128项=C65/D63。主题只是检索标签，不能作为唯一故障数量。每行实际命令、raw路径、平台、hash及缺口详见[evidence/test-matrix.json](evidence/test-matrix.json)。','', '|编号/原测试名称|技术断言及真实组件|Fixture边界/未覆盖|原结果→本轮|等级/跨课主题|','|---|---|---|---|---|']
for r in rows:
 md.append(f"|{r['id']} {r['originalTest']}|{r['claim']}；{r['components']}|{r['fixtureBoundary']}|[{r['originalResult']}](../{r['course'].lower()}/evidence/lab-tests.txt) → [PASS]({r['currentTap'].replace('docs/deepseek-harness-v2/module-five-review/','')})|{r['grade']} / {r['theme']} / {'有语义重合' if r['crossCourseOverlap'] else '本责任边界'}|")
md+=['','## 去重与证据解释','','H17 B/X与H19 C/X重复验证Surface派生，但后者加入真实摘要与压缩来源；H18 C6–9/D23与H20 D/X重合保守repair语义，但H20增加取消与假外部效果。H19 overflow与H20 A22/23重合输入恢复，后者额外检验Retry共存。H18 X/H19 X/H20 C/X都用新后端Resume，保存对象和中断前提不同。H20多个瞬态码、normal/always、门闩分支共享同一fixture，不能相加包装成互不相关系统场景。','','原名+课程+当前程序hash用于执行身份；主题重合保留交叉引用，不随意从123中扣一个数声称独立场景。真实JSONL、新PID、物理故障和E是正交维度，详见专项报告。']
(HERE/'test-evidence-matrix.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
print(len(rows),'original tests reconciled to current TAP')
