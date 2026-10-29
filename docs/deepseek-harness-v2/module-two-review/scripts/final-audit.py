"""范围、当前证据、材料和交付完整性验收；无删除/数据库/发布操作。"""
from pathlib import Path
import difflib, hashlib, json, re, subprocess
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]; E=ROOT/'evidence'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
before=read(E/'workspace-before.json'); allowed=set(read(E/'revision-allowlist.json'))
changed=[]
for path,old in before['tracked'].items():
    assert (REPO/path).is_file(),path
    if sha(REPO/path)!=old: changed.append(path)
assert set(changed)==allowed,(changed,allowed)
for path,old in before['output'].items(): assert sha(REPO/path)==old,path
assert {p.relative_to(REPO).as_posix() for p in (REPO/'output').rglob('*') if p.is_file()}==set(before['output'])
revisions=[];patch=[]
for path in sorted(allowed):
    old=E/'before'/path;new=REPO/path
    assert sha(old)==before['tracked'][path]
    revisions.append({'path':path,'before':sha(old),'after':sha(new)})
    # 零上下文精确diff，避免空上下文行的单个空格被当作新文件尾空白；完整原文另存before。
    if new.suffix!='.png':patch.extend(difflib.unified_diff(old.read_text(encoding='utf-8').splitlines(True),new.read_text(encoding='utf-8').splitlines(True),fromfile='before/'+path,tofile='after/'+path,n=0))
(E/'lesson-revisions.patch').write_text(''.join(patch),encoding='utf-8')
(E/'revisions.json').write_text(json.dumps(revisions,indent=2)+'\n',encoding='utf-8')
required=['README.md','dependency-matrix.md','repetition-and-gaps.md','technical-review.md','figures-review.md','assessment.md','assessment-answers.md','workload.md','issues-initial.md','revisions.md','test-evidence.md','production-standard-module-two-addendum.md','h09-handoff.md']
for name in required:assert (ROOT/name).is_file(),name
assert len(re.findall(r'^## Q\d{2}',(ROOT/'assessment.md').read_text(encoding='utf-8'),re.M))==14
score=[int(n) for n in re.findall(r'^## Q\d{2}[^\n]*（(\d+)分）',(ROOT/'assessment-answers.md').read_text(encoding='utf-8'),re.M)]
assert len(score)==14 and sum(score)==100,score
for h,count in [('h05',9),('h06',27),('h07',24),('h08',20)]:
    labs=E/('retry-h08/h08' if h=='h08' else h)/'evidence'
    assert read(labs/'lab-results.json')['tests']==count
    tap=(labs/'lab-tests.txt').read_text(encoding='utf-8');assert f'# tests {count}' in tap and '# fail 0' in tap
    assert read(labs/'lab-results.json')['mutation']['status']=='EXPECTED_FAILURE'
    latest=E/('only-h07-final/h07' if h=='h07' else h)/'evidence'
    visual=read(latest/'visual-qa.json');content=read(latest/'content-check.json')
    lesson=REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md'
    assert visual['lessonSha256']==content['lessonSha256']==sha(lesson),h
    assert len(visual['figures'])==(4 if h=='h08' else 3)
    assert [v['width'] for v in visual['viewports']]==[1440,390,320]
    for fig in visual['figures']:
        image=ROOT.parent/h/'figures/rendered'/(fig['id']+'.png');assert fig['imageSha256']==sha(image),fig['id']
    assert all(v['status']=='PASS' and not v['errors'] and not v['failed'] for v in visual['viewports'])
renderer=(E/'only-h07-final/renderer-tests.tap').read_text(encoding='utf-8')
assert re.search(r'(?m)^(?:#|ℹ) tests 9$',renderer) and re.search(r'(?m)^(?:#|ℹ) fail 0$',renderer)
assert '# tests 4' in (E/'cross-course-module-two-probe-b6e8yjaq.tap').read_text(encoding='utf-8')
assert '# fail 0' in (E/'cross-course-module-two-probe-b6e8yjaq.tap').read_text(encoding='utf-8')
sources=read(E/'source-check.json');assert sources['status']=='PASS' and len(sources['files'])==777
inventory=[]
inputs=[ROOT.parent/'A-blueprint-v2.md',*sorted((ROOT.parent/'module-one-review').glob('*.md'))]
for h in ['h05','h06','h07','h08']:
    inputs.extend(p for p in (ROOT.parent/h).rglob('*') if p.is_file())
    inputs.extend(p for p in (REPO/f'course-content/internal/deepseek-harness/{h}').rglob('*') if p.is_file())
for p in sorted(set(inputs)):
    rel=p.relative_to(REPO).as_posix();inventory.append({'path':rel,'bytes':p.stat().st_size,'sha256':sha(p),'baselineSha256':before['tracked'].get(rel)})
(E/'material-inventory.json').write_text(json.dumps({'scope':'Full blueprint, module-one report set and standard; four complete formal bodies, every lab/exercise/answer, source checklist, quality report, all figure source/rendered/QA and complete H08 review-prep. Hash inventory is integrity evidence, not a claim that every historical screenshot was manually viewed.','files':inventory},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# 当前审查文档的本地相对链接必须存在；忽略文档内代码片段和网页。
links=[]
for name in required:
    for target in re.findall(r'\]\(([^)]+)\)',(ROOT/name).read_text(encoding='utf-8')):
        if target.startswith(('https://','http://','#')):continue
        assert target=='evidence/final-audit.json' or (ROOT/target.split('#')[0]).exists(),(name,target)
        links.append({'document':name,'target':target})
(E/'final-audit.json').write_text(json.dumps({'status':'PASS','baseline':before['head'],'changedExisting':sorted(changed),'unchangedTracked':len(before['tracked'])-len(changed),'outputFilesPreserved':len(before['output']),'requiredDeliverables':required,'assessmentQuestions':14,'assessmentPoints':100,'fixedFiles':len(sources['files']),'lessonReferences':len(sources['references']),'reportReferences':len(sources['auditReferences']),'materialFiles':len(inventory),'localLinksChecked':len(links),'authorReview':'GO within audited scope; confirmed P0/P1 resolved','overall':'CONDITIONAL GO','nativeHmr':'NOT_RUN','fullOfficialApplication':'NOT_RUN','learners':'PENDING','independentExternalReview':'PENDING'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: 9 allowed existing files;',len(before['output']),'output files preserved;',len(inventory),'material files; 14 questions/100 points; current evidence hashes agree')
