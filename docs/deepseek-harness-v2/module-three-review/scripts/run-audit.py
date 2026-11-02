"""Run unchanged author checks with all writes redirected to this audit; never clean up."""
from pathlib import Path
import hashlib, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
PHASE=sys.argv[1]; TAG=sys.argv[2] if len(sys.argv)>2 else 'baseline'
E=ROOT/'evidence'/TAG; E.mkdir(parents=True,exist_ok=True)
SCRATCH=Path(tempfile.mkdtemp(prefix='m3-audit-',dir=REPO/'node_modules/.cache'))
(SCRATCH/'package.json').write_text('{"private":true,"type":"module"}\n',encoding='utf-8')
records=[]
def save():
 (E/('run-'+PHASE+'.json')).write_text(json.dumps({'phase':PHASE,'scratchRetained':str(SCRATCH),'records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def run(args,log):
 r=subprocess.run(list(map(str,args)),cwd=REPO,capture_output=True,encoding='utf-8',env={**os.environ,'PYTHONUTF8':'1'})
 target=E/log; target.parent.mkdir(parents=True,exist_ok=True); target.write_text(r.stdout+r.stderr,encoding='utf-8')
 records.append({'command':list(map(str,args)),'exit':r.returncode,'log':log}); save()
 print(log, r.returncode, (r.stdout+r.stderr)[-600:],flush=True)
 return r.returncode
def derived(h,filename):
 original=ROOT.parent/h/'scripts'/filename; out=E/h; out.mkdir(parents=True,exist_ok=True)
 text=original.read_text(encoding='utf-8')
 for folder in ['server','src','tailwind.config.js']:
  text=text.replace('../../../../'+folder,(REPO/folder).as_uri())
 text=re.sub(r"fileURLToPath\(new URL\('../',\s*import.meta.url\)\)",lambda m:json.dumps((ROOT.parent/h).as_posix()),text)
 text=re.sub(r'\bwriteFile\b(?=[^\n]*from [\'"]node:fs/promises)', 'writeFile as auditRawWriteFile',text,count=1)
 text+='''
async function writeFile(destination,...args){
 const {mkdir}=await import('node:fs/promises');
 const {relative,dirname,isAbsolute}=await import('node:path');
 if(typeof destination==='string'){
  const rel=relative(ORIGINAL,destination);
  if(rel&&!rel.startsWith('..')&&!isAbsolute(rel))destination=resolve(OUTPUT,rel);
 }
 await mkdir(dirname(destination),{recursive:true});return auditRawWriteFile(destination,...args);
}
'''.replace('ORIGINAL',json.dumps((ROOT.parent/h).as_posix())).replace('OUTPUT',json.dumps(out.as_posix()))
 if filename=='preview-and-qa.tsx':
  visual=out/'visual'; visual.mkdir(parents=True,exist_ok=True)
  text=text.replace('path:resolve(root,f.image)','path:'+json.dumps(visual.as_posix())+'+"/"+f.id+"-master.png"')
  text=text.replace('path:resolve(root,`figures/qa/','path:resolve('+json.dumps(visual.as_posix())+',`')
 if filename=='check-content.ts' and TAG!='baseline':
  text=text.replace("resolve(root,'reading-preview.html')",json.dumps((out/'reading-preview.html').as_posix()))
  text=text.replace("resolve(root, 'reading-preview.html')",json.dumps((out/'reading-preview.html').as_posix()))
 target=SCRATCH/(h+'-'+filename); target.write_text(text,encoding='utf-8')
 records.append({'derivedFrom':original.relative_to(REPO).as_posix(),'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'derivedScript':str(target),'derivedSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'adaptation':'absolute imports and audit-only write/screenshot destinations; assertions unchanged; final check uses audit SSR preview'})
 return target
for h in ['h09','h10','h11','h12']:
 if PHASE=='labs':run(['node',derived(h,'run-labs.mjs')],h+'/run-labs.txt')
 elif PHASE=='content':
  if TAG!='baseline':run(['node','--import','tsx',derived(h,'make-reading-preview.tsx')],h+'/make-preview.txt')
  run(['node','--import','tsx',derived(h,'check-content.ts')],h+'/content.txt')
 elif PHASE=='visual':run(['node','--import','tsx',derived(h,'preview-and-qa.tsx')],h+'/visual.txt')
if PHASE=='content':run(['node','--import','tsx','--test','tests/lesson-renderer.test.ts'],'renderer-tests.tap')
save()
if any(r.get('exit',0)!=0 for r in records):sys.exit(1)
