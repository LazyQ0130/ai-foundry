"""原实验/Renderer 复验，证据写新目录。保留所有历史结果和临时目录。"""
from pathlib import Path
import hashlib, json, os, re, subprocess, sys, tempfile

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
E = ROOT / 'evidence'
TAG = sys.argv[2] if len(sys.argv)>2 else ''
if TAG: E=E/TAG
E.mkdir(parents=True, exist_ok=True)
PARENT = REPO / 'node_modules/.cache'
PARENT.mkdir(parents=True, exist_ok=True)
SCRATCH = Path(tempfile.mkdtemp(prefix='module-two-audit-', dir=PARENT))
(SCRATCH/'package.json').write_text('{"private":true,"type":"module"}\n', encoding='utf-8')
records = []
completed = []

def execute(args, log):
    result = subprocess.run([str(x) for x in args], cwd=REPO, capture_output=True,
                            encoding='utf-8', errors='strict', env={**os.environ, 'PYTHONUTF8':'1'})
    target = E/log
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(result.stdout+result.stderr, encoding='utf-8')
    records.append({'command':[str(x) for x in args], 'exitCode':result.returncode, 'log':log})
    save()
    if result.returncode:
        raise RuntimeError(f'{log}: {result.stdout[-2000:]} {result.stderr[-2000:]}')

def save():
    (E/('run-record-'+sys.argv[1]+'.json')).write_text(json.dumps({
        'phase':sys.argv[1], 'scratchRetained':str(SCRATCH), 'records':records,
        'adaptation':'Same assertions and fixtures; absolute imports/root and audit-only evidence paths.',
        'fullOfficialApplication':'NOT_RUN', 'nativeHmr':'NOT_RUN'
    }, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def derived(h, filename, visual=False):
    original = ROOT.parent/h/'scripts'/filename
    out = E/h
    out.mkdir(parents=True, exist_ok=True)
    (out/'evidence').mkdir(parents=True, exist_ok=True)
    text = original.read_text(encoding='utf-8')
    for folder in ['server','src','tailwind.config.js']:
        text=text.replace('../../../../'+folder, (REPO/folder).as_uri())
    text=re.sub(r"fileURLToPath\(new URL\('../',\s*import.meta.url\)\)",
                lambda m:json.dumps((ROOT.parent/h).as_posix()), text)
    # 只重定向写操作，读操作仍使用原课证据/源码锁定/实验文件。
    text=re.sub(r'\bwriteFile\b(?=[^\n]*from [\'"]node:fs/promises)', 'writeFile as auditRawWriteFile', text, count=1)
    wrapper='''
async function writeFile(destination, ...args) {
 const {mkdir: auditMkdir}=await import('node:fs/promises');
 const {relative: auditRelative, dirname: auditDirname, isAbsolute: auditAbsolute}=await import('node:path');
 if(typeof destination==='string') {
  const rel=auditRelative(AUDIT_ORIGINAL,destination);
  if(rel && !rel.startsWith('..') && !auditAbsolute(rel)) destination=resolve(AUDIT_OUTPUT,rel);
 }
 await auditMkdir(auditDirname(destination),{recursive:true});
 return auditRawWriteFile(destination,...args);
}
'''.replace('AUDIT_ORIGINAL',json.dumps((ROOT.parent/h).as_posix())).replace('AUDIT_OUTPUT',json.dumps(out.as_posix()))
    text += wrapper
    # H08 子进程直接写报告，不能只拦截父进程 writeFile。
    text=text.replace("H08_PROFILE_REPORT: resolve(root, 'evidence/official-profiles.json')",
                      'H08_PROFILE_REPORT: '+json.dumps((out/'evidence/official-profiles.json').as_posix()))
    if visual:
        dest=out/'visual'
        dest.mkdir(parents=True, exist_ok=True)
        text=text.replace('path:resolve(root,f.image)', 'path:'+json.dumps(dest.as_posix())+'+"/"+f.id+"-master.png"')
        text=text.replace('path:resolve(root,`figures/qa/', 'path:resolve('+json.dumps(dest.as_posix())+',`')
    target=SCRATCH/(h+'-'+filename)
    target.write_text(text, encoding='utf-8')
    records.append({'derivedFrom':original.relative_to(REPO).as_posix(),
                    'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest(),
                    'derivedScript':str(target), 'derivedSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    return target

phase=sys.argv[1]
for h in ['h05','h06','h07','h08']:
    if TAG=='retry-h08' and h!='h08': continue
    if TAG.startswith('only-h07') and h!='h07': continue
    if phase=='labs':
        execute(['node',derived(h,'run-labs.mjs')],h+'/run-labs.txt')
    elif phase=='content':
        # 允许的三份已修订课阅读预览重新生成；H06 原件不变。
        if h!='h06': execute(['node','--import','tsx',ROOT.parent/h/'scripts/make-reading-preview.tsx'],h+'/preview.txt')
        execute(['node','--import','tsx',derived(h,'check-content.ts')],h+'/content.txt')
    elif phase=='visual':
        execute(['node','--import','tsx',derived(h,'preview-and-qa.tsx',True)],h+'/visual.txt')
    completed.append(h)
if phase=='content': execute(['node','--import','tsx','--test','tests/lesson-renderer.test.ts'],'renderer-tests.tap')
save()
print('PASS:',phase,','.join(completed),'(original assertions retained)')
