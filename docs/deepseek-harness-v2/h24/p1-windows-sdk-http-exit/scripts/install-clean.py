from pathlib import Path
import tempfile,subprocess,json,hashlib,shutil
R=Path(__file__).resolve().parents[1];E=R/'evidence';old=R.parent/'evidence/dependency-manifests';base=Path(tempfile.mkdtemp(prefix='aifoundry-h24-p1-deps-'));runs=[]
for source in sorted(old.iterdir()):
 if not source.is_dir():continue
 target=base/source.name;target.mkdir();assert not (target/'node_modules').exists()
 for name in ['package.json','package-lock.json']:shutil.copyfile(source/name,target/name)
 before=hashlib.sha256((target/'package-lock.json').read_bytes()).hexdigest()
 cmd=[shutil.which('npm.cmd'),'install','--prefix',str(target),'--cache',str(base/'private-npm-cache'),'--ignore-scripts','--no-audit','--no-fund']
 r=subprocess.run(cmd,text=True,capture_output=True,timeout=90);after=hashlib.sha256((target/'package-lock.json').read_bytes()).hexdigest()
 entry=dict(directory=str(target),command=cmd,exit=r.returncode,stdout=r.stdout,stderr=r.stderr,lockBefore=before,lockAfter=after,packageLock=json.loads((target/'package-lock.json').read_text()),inputPackage=json.loads((target/'package.json').read_text()))
 runs.append(entry);(E/f'clean-install-{base.name}.json').write_text(json.dumps(dict(base=str(base),runs=runs),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 assert r.returncode==0,(source,r.stderr)
 assert 'removed ' not in r.stdout,r.stdout
 assert before==after,'npm changed locked input'
 print(source.name,'fresh install PASS',flush=True)
mapping=dict(H24_DEPS_ANCHOR='h04-probe-deps/node_modules/commander/index.js',H24_ZOD_ANCHOR='h09-probe-deps/node_modules/zod/index.js',H24_NATIVE_ANCHOR='module-four-probe-deps/node_modules/koffi/index.js',H24_LIMIT_ANCHOR='h18-persistence-deps/node_modules/p-limit/index.js',H24_PTC_ANCHOR='h22-ptc-deps/node_modules/acorn/dist/acorn.js',H24_WIRE_ANCHOR='h23-wire-deps/node_modules/ws/index.js',H24_TEST_ANCHOR='h24-fixed-test-deps/node_modules/execa/index.js',H24_HTTP_ANCHOR='h24-http-deps/node_modules/undici/index.js')
(E/'clean-anchors.json').write_text(json.dumps({k:str(base/v) for k,v in mapping.items()},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Fresh locked trees ready; no original cache changed')
