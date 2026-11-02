from pathlib import Path
import json,hashlib,sys
sys.stdout.reconfigure(encoding='utf-8')
R=Path(__file__).resolve().parents[1];P=R.parents[2]
paths=[f'docs/deepseek-harness-v2/{h}/{f}' for h in ['h15','h16'] for f in ['README.md','scripts/run-labs.mjs']]
out=R/'evidence/before';out.mkdir(parents=True,exist_ok=True)
for p in paths:
 d=(P/p).read_bytes();dest=out/(p.replace('/','__'))
 if not dest.exists():dest.write_bytes(d)
 else:assert dest.read_bytes()==d,'before evidence must not be overwritten'
old=Path('C:/Users/QYF/.codex/research/h15-probe-deps/package-lock.json')
(R/'evidence/dependency-gap-before.json').write_text(json.dumps({'path':str(old),'sha256':hashlib.sha256(old.read_bytes()).hexdigest(),'installed':json.loads(old.read_text())['packages']['node_modules/readdirp'],'expected':'5.0.0 fixed pnpm-lock','failure':'new strict guard rejected node_modules/readdirp before any test'},indent=2)+'\n',encoding='utf-8')
target=Path('C:/Users/QYF/.codex/research/module-four-probe-deps');target.mkdir(exist_ok=True)
package={'name':'module-four-pinned-fs-probe','private':True,'dependencies':{'chokidar':'5.0.0','koffi':'3.1.1','yaml':'2.9.0','readdirp':'5.0.0'},'overrides':{'readdirp':'5.0.0'}}
dest=target/'package.json'
if dest.exists():assert json.loads(dest.read_text())==package
else:dest.write_text(json.dumps(package,indent=2)+'\n',encoding='utf-8')
print(target)
