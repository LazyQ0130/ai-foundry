from pathlib import Path
import json,hashlib,subprocess,re,sys
sys.stdout.reconfigure(encoding='utf-8')
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';prefix=R.relative_to(P).as_posix()+'/'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
git=lambda *a:subprocess.check_output(['git',*a],cwd=P).decode('utf-8')
before=read(E/'workspace-before.json');allowed={f'docs/deepseek-harness-v2/{h}/{f}' for h in ['h15','h16'] for f in ['README.md','scripts/run-labs.mjs']}
changes=[];preserved=[]
for f in before['files']:
 p=P/f['path'];assert p.is_file(),'protected file missing '+f['path'];now=sha(p.read_bytes())
 if now!=f['sha256']:
  assert f['path']in allowed,'unauthorized change '+f['path'];old=E/'before'/f['path'].replace('/','__');assert old.is_file()and sha(old.read_bytes())==f['sha256'];changes.append({'path':f['path'],'before':f['sha256'],'after':now,'reason':'R01 complete transitive filesystem dependency pin/integrity guard'})
 else:preserved.append(f['path'])
assert {f['path']for f in changes}==allowed
baselineStatus='\n'.join(l for l in before['status'].splitlines() if not l[3:].startswith(prefix))+'\n';baseDirty={l[3:]for l in baselineStatus.splitlines() if len(l)>3}
current=git('status','--porcelain');currentPaths={l[3:]for l in current.splitlines()if len(l)>3}
for path in currentPaths:
 assert path.startswith(prefix)or path in baseDirty or path in allowed,'unexpected Git status '+path
staged=git('diff','--cached','--name-only').splitlines()
assert all(p.startswith(prefix)or p in allowed for p in staged),'staged scope violation'
lab=read(E/'lab-results.json');assert lab['status']=='PASS';assert sum(r['tests']for r in lab['results'])==139
for r in lab['results']:
 for f in r['programs']:
  p=Path(f['origin']) if f.get('origin')else (R/'lab'/f['name'] if r['lesson']=='cross'else P/f'course-content/internal/deepseek-harness/{r["lesson"]}/lab'/f['name'])
  assert sha(p.read_bytes())==f['sha256'],'program changed since test '+str(p)
source=read(E/'source-review.json');assert source['status']=='PASS'and len(source['assertions'])==218 and source['filesChecked']==9552
content=read(E/'content-check.json');assert content['status']=='PASS'and content['astChecks']==110
visual=read(E/'visual-qa.json');assert visual['status']=='PASS'and len(visual['viewports'])==15 and len(visual['figures'])==16
assert all(f['byteIdentical']for f in visual['figures'])
for r in content['records']:assert sha((P/f'course-content/internal/deepseek-harness/{r["id"]}/lesson.md').read_bytes())==r['lessonSha256']
assert len(read(E/'test-matrix.json')['tests'])==139
questions=read(R/'assessment.json');assert len(questions)==18 and sum(q['points']for q in questions)==100
aux=read(E/'aux-results.json');assert len([x for x in aux if x.get('kind')=='negative'and x['status']=='EXPECTED_FAILURE'])==4
renderer=sorted(E.glob('check-*-renderer.json'))[-1];rr=read(renderer);assert rr['exit']==0 and '# tests 12'in rr['stdout']and '# fail 0'in rr['stdout']
required=['README.md','review-report.md','unified-tool-model.md','technical-consistency.md','dependency-matrix.md','safety-review.md','family-matrix.md','test-evidence.md','test-case-index.md','source-review.md','source-assertion-index.md','figures-review.md','assessment.md','assessment.json','assessment-preview.html','workload.md','issues-initial.md','revisions.md','production-standard-module-four-addendum.md','h17-h20-handoff.md']
assert all((R/p).is_file()for p in required)
links=[]
planned={(E/'necessary-revisions.patch').resolve(),(E/'validation.json').resolve(),(R/'acceptance.md').resolve()}
for p in R.glob('*.md'):
 for target in re.findall(r'(?<!!)\[[^\]]*\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
  if re.match(r'\w+://|^#',target):continue
  target=target.split('#',1)[0];dest=(p.parent/target).resolve();assert dest.is_file()or ('--verify'not in sys.argv and dest in planned),str(p)+' -> '+target;links.append({'from':p.name,'to':target})
for sample in read(E/'manual-review.json')['finalSamples']:assert sha((R/sample['path']).read_bytes())==sample['sha256']
result={'status':'PASS','base':before['base'],'protectedFiles':len(before['files']),'preservedFiles':len(preserved),'necessaryChanges':changes,'outputFilesPreserved':len([p for p in preserved if p.startswith('output/')]),'originalUserStatusPreserved':baselineStatus,'tests':139,'originalTests':136,'newD':3,'semanticThemes':20,'rendererTests':12,'sourceAssertions':218,'fixedSourceFiles':9552,'astChecks':110,'mountedViewports':15,'figures':16,'questions':18,'localLinksChecked':len(links),'stagedFiles':len(staged),'unverified':['native Shell','Linux/macOS/Windows native process sandbox','real Web','MCP HTTP','complete Harness E','learner outcomes','independent review']}
if '--verify'in sys.argv:
 inventory=read(E/'artifact-inventory.json')['files'];actualPaths={p.relative_to(P).as_posix()for p in R.rglob('*')if p.is_file()and p.name!='artifact-inventory.json'}
 assert {f['path']for f in inventory}==actualPaths,'inventory coverage differs'
 for f in inventory:assert sha((P/f['path']).read_bytes())==f['sha256'],'artifact changed '+f['path']
 entries={part.split('\t',1)[1]:part.split()[1]for part in git('ls-files','--stage','-z').split('\0')if part}
 for p in staged:
  data=(P/p).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  if not p.startswith(prefix):blob=subprocess.check_output(['git','hash-object','--path='+p,'--stdin'],input=data,cwd=P).decode().strip()
  assert entries[p]==blob,'index differs from reviewed file '+p
 assert (E/'necessary-revisions.patch').read_bytes().count(b'diff --git ')==4,'necessary patch must contain four files'
 print(json.dumps({k:result[k]for k in ['status','protectedFiles','preservedFiles','tests','rendererTests','questions','stagedFiles']},ensure_ascii=False));raise SystemExit
(E/'necessary-revisions.patch').write_bytes(subprocess.check_output(['git','diff',before['base'],'--binary','--unified=0','--',*sorted(allowed)],cwd=P))
(E/'workspace-after.json').write_text(json.dumps({'status':current,'changes':changes,'preservedFiles':len(preserved)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
accept=f'''# 最终自动验收与范围保护

PASS。基线 `{before['base']}`；3768份原文件中4件R01必要配套修改有before原件/精确patch/hash，其他{len(preserved)}份逐字节保留，其中output共{result['outputFilesPreserved']}份。四课正式正文、lab、源图/PNG与历史报告未变；H01–H12、前三集中审查及用户已有修改保留。

| 门禁 | 最终结果 |
|---|---|
| 固定源码完整性/引用 | 9552文件Git blob+SHA256，218断言、90正文链接范围PASS |
| 内容/源码辅助 | 实际parser/SSR、四课元数据/嵌入完整程序、任务key、110AST PASS |
| 实际行为 | 原136项+新3D =139执行项PASS；20语义主题，非独立安全场景数 |
| 负例/依赖 | 4个AssertionError受控预期失败；旧传递依赖树拒绝，新树锁核验PASS；H15/H16 demo PASS |
| Renderer | 既有12项PASS，原始stdout/stderr保留 |
| 视觉与交互 | 16源图重导byte-identical、四课12宽度+测验3宽度挂载PASS；48图截图、原图、87完整程序复制、折叠键盘、代码局部横滚 |
| 综合测验 | 18题100分、四跨课与阶梯任务；完整答案/推导/Rubric/误答/依赖；三宽度互动及长答案PASS |
| 人工作者样本 | 24份最终样本含16源/320图对照和最终长答案，hash锁定；不是独立外审 |
| 范围 | 只新增本目录+H15/H16两README/两runner；当前暂存{len(staged)}件，最终提交前再查cached scope/whitespace |

`evidence/validation.json`为最终机器报告，`necessary-revisions.patch`是4件必要修改的原diff；各次check/aux/run时间戳raw保留失败。源片段/AST/几何是辅助，不能替代语义、安全审计或真实教学效果。

原生Shell与三平台进程sandbox、真实Web/MCP HTTP、完整E、跨进程持久恢复、学员效果/实测耗时、独立外审继续NOT_RUN/PENDING。结论CONDITIONAL GO不构成发布许可。不开发H17、不修改课程价格/权限/数据库/发布/线上业务，无批量删除。

提交后用 `python docs/deepseek-harness-v2/module-four-review/scripts/final-audit.py --verify` 只读复核；不重写已提交证据。
'''
(R/'acceptance.md').write_text(accept,encoding='utf-8')
for link in links:assert (R/link['from']).parent.joinpath(link['to']).resolve().is_file(),link
inventory=[{'path':p.relative_to(P).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())}for p in sorted(R.rglob('*'))if p.is_file()and p.name!='artifact-inventory.json']
(E/'artifact-inventory.json').write_text(json.dumps({'meaning':'Self inventory excludes itself; generated after validation/acceptance','files':inventory},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:result[k]for k in ['status','protectedFiles','preservedFiles','tests','rendererTests','questions','stagedFiles']},ensure_ascii=False))
