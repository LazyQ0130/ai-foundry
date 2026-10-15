"""Run the new meaningful regression tests against the previously built copy, then the fix."""
from pathlib import Path
import json, os, subprocess, time, hashlib, tempfile
from zipfile import ZipFile
repo=Path(__file__).resolve().parents[3]
old_dir=repo/'docs/ai-browser-copilot/p2/artifacts/delivery-1791971621071'
old=json.loads((old_dir/'report.json').read_text('utf-8'))
evidence=repo/'docs/ai-browser-copilot/p2/artifacts'/('timeout-regression-'+str(int(time.time()*1000)))
evidence.mkdir()
for item in old['sources']+old['extension_packages']:
    preserved=old_dir/Path(item['file']).name
    assert hashlib.sha256(preserved.read_bytes()).hexdigest()==item['sha256']
before=Path(tempfile.mkdtemp(prefix='aifoundry-p2-regression-before-'))
with ZipFile(old_dir/'ai-web-reader-p2-reference.zip') as z: z.extractall(before)
install=subprocess.run(['npm.cmd','ci'],cwd=before,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=180)
(evidence/'before-install.txt').write_text(install.stdout+'\n'+install.stderr,encoding='utf-8')
assert install.returncode==0
args=['node',str(repo/'spikes/ai-browser-copilot-spike/node_modules/tsx/dist/cli.mjs'),'--test','docs/ai-browser-copilot/p2/unit.test.ts']
results=[]
for label,target in [('before',str(before)),('after',str(repo/'course-content/internal/ai-browser-copilot/p2/reference'))]:
    env=os.environ.copy(); env['P2_TEST_REFERENCE']=target
    p=subprocess.run(args,cwd=repo,env=env,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=60)
    (evidence/(label+'.txt')).write_text(p.stdout+'\n'+p.stderr+'\nexit_code='+str(p.returncode),encoding='utf-8')
    results.append({'variant':label,'exit':p.returncode,'source':target})
assert results[0]['exit']!=0 and results[1]['exit']==0,results
(evidence/'report.json').write_text(json.dumps({'status':'PASS','regressions':4,'results':results},indent=2),encoding='utf-8')
print(json.dumps({'evidence':str(evidence),'status':'PASS','results':results},indent=2))
