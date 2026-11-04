from pathlib import Path
import json,hashlib,subprocess,re,sys
ROOT=Path(__file__).resolve().parents[4]; BASE=ROOT/'docs/deepseek-harness-v2'; HERE=BASE/'module-five-review'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if sys.argv[1]=='source':
 locks=[json.loads((BASE/f'h{h}/evidence/source-lock.json').read_text()) for h in range(17,21)]
 lock=locks[-1];source=Path(lock['sourceCache']);commit=lock['commit']
 tree=subprocess.check_output(['git','-C',lock['gitCache'],'ls-tree','-r',commit],text=True)
 blobs={line.split('\t',1)[1]:line.split()[2] for line in tree.splitlines() if '\t' in line}
 files={f['path']:f for l in locks for f in l['files']}; errors=[]
 for path,f in files.items():
  data=(source/path).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  if blob!=blobs[path] or hashlib.sha256(data).hexdigest()!=f['sha256']:errors.append(path)
 claims=[]
 for h in range(17,21):
  a=json.loads((BASE/f'h{h}/evidence/source-assertions.json').read_text(encoding='utf-8'))
  for c in a:
   p=source/c['path'];lines=p.read_text(encoding='utf-8').splitlines()
   assert 1<=c['start']<=c['end']<=len(lines)
   assert sha(p)==c['sourceSha256']
   claims.append({'course':f'H{h}',**c})
 save(HERE/'evidence/source-check.json',{'status':'PASS' if not errors else 'FAIL','commit':commit,'files':len(files),'errors':errors,'assertions':len(claims),'counts':{f'H{h}':sum(c['course']==f'H{h}' for c in claims) for h in range(17,21)},'scope':'Git blob/SHA256 and bounded assertion references; semantic reading and behavior evidence separately reported'})
 save(HERE/'evidence/source-assertion-index.json',claims)
 print(len(files),'files;',len(claims),'assertions;',errors)
elif sys.argv[1]=='claims':
 h=int(sys.argv[2]);a=json.loads((BASE/f'h{h}/evidence/source-assertions.json').read_text(encoding='utf-8'))
 for c in a:print(c['id'],c['symbol'],c['claim'],'|',c.get('test',c.get('behaviorEvidence','')),c['level'])
elif sys.argv[1]=='raw':
 rows=[]
 for h in range(17,21):
  for p in sorted((BASE/f'h{h}/evidence').glob('run-*.json')):
   v=json.loads(p.read_text(encoding='utf-8'));rows.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'args':v.get('args'),'exit':v.get('exit'),'error':v.get('error'),'scratch':v.get('scratch'),'stdoutBytes':len(v.get('stdout','')),'stderr':v.get('stderr',''),'failures':re.findall(r'^not ok[^\n]*|^\s+error: [^\n]*',v.get('stdout',''),re.M) if v.get('exit')!=0 or v.get('stdout','').startswith('TAP version') else []})
 save(HERE/'evidence/historical-runs.json',rows)
 for r in rows: print(r['path'].split('/')[-3],r['path'].split('/')[-1],r['exit'],r['args'],'; '.join(r['failures']),r['stderr'][:180])
