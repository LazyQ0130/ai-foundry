from pathlib import Path
import json,hashlib,base64,tarfile,io,tempfile,subprocess,shutil
R=Path(__file__).resolve().parents[1];E=R/'evidence';cache=Path('C:/Users/QYF/AppData/Local/npm-cache/_cacache');entries=[]
targets={'pretty-ms':('9.3.1','9.3.0'),'pure-rand':('8.4.2','8.4.0'),'yoctocolors':('2.2.0','2.1.2')}
for p in (cache/'index-v5').rglob('*'):
 if not p.is_file():continue
 for line in p.read_text(errors='replace').splitlines():
  if '\t' not in line:continue
  try:d=json.loads(line.split('\t',1)[1])
  except ValueError:continue
  if not any('/'+name+'/-/' in d.get('key','') for name in targets):continue
  digest=base64.b64decode(d['integrity'].split('-',1)[1]).hex();data=(cache/'content-v2/sha512'/digest[:2]/digest[2:4]/digest[4:]).read_bytes();assert hashlib.sha512(data).hexdigest()==digest
  with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
   package=json.load(archive.extractfile('package/package.json'));native=[n for n in archive.getnames() if n.endswith('.node')]
  entries.append(dict(cacheKey=d['key'],integrity=d['integrity'],cachedAtMs=d['time'],package=package,nativeBindings=native))
(E/'dependency-cache-forensics.json').write_text(json.dumps(dict(entries=entries,confidence='pretty-ms before version directly in preserved failed assertion; pure-rand/yoctocolors before versions corroborated by cache tarball identity and simultaneous fetch timestamps, original pre-replacement lock was not preserved',replaced=[dict(name=n,before=v[0],after=v[1]) for n,v in targets.items()],originalTreesUntouched=True),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
anchors=json.loads((E/'clean-anchors.json').read_text());clean=Path(anchors['H24_TEST_ANCHOR']).parents[2];base=Path(tempfile.mkdtemp(prefix='aifoundry-h24-p1-before-candidate-'));pkg=json.loads((clean/'package.json').read_text());lock=json.loads((clean/'package-lock.json').read_text())
for n,(before,after) in targets.items():
 entry=next(e for e in entries if e['package']['name']==n and e['package']['version']==before);pkg['overrides'][n]=before
 key=next(k for k in lock['packages'] if k.endswith('node_modules/'+n));old=lock['packages'][key];old.update(version=before,resolved=entry['cacheKey'].split('request-cache:',1)[1],integrity=entry['integrity'])
 for prop in ['engines','dependencies','bin']:
  if prop in entry['package']:old[prop]=entry['package'][prop]
  else:old.pop(prop,None)
for name,data in [('package.json',pkg),('package-lock.json',lock)]: (base/name).write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
beforeHash=hashlib.sha256((base/'package-lock.json').read_bytes()).hexdigest();cmd=[shutil.which('npm.cmd'),'install','--prefix',str(base),'--cache',str(base/'private-npm-cache'),'--ignore-scripts','--no-audit','--no-fund'];r=subprocess.run(cmd,capture_output=True,text=True,timeout=90)
(E/'before-candidate-install.json').write_text(json.dumps(dict(base=str(base),command=cmd,exit=r.returncode,stdout=r.stdout,stderr=r.stderr,lockBefore=beforeHash,lockAfter=hashlib.sha256((base/'package-lock.json').read_bytes()).hexdigest(),meaning='explicit reconstruction candidate of three pre-replacement versions, not an authenticated original pre-replacement directory and not official locked environment'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8');assert r.returncode==0,r.stderr;assert 'removed ' not in r.stdout
print('Cache identities verified; fresh before-version candidate',str(base))
