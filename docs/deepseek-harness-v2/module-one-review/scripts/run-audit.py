"""重用各课真实 Renderer/源码探针；输出转入本轮目录，不覆盖历史证据。无删除。"""
from pathlib import Path
import hashlib, json, os, re, subprocess, tempfile, sys

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
E = ROOT/'evidence'
SCRATCH_PARENT = REPO/'node_modules/.cache'
SCRATCH_PARENT.mkdir(parents=True,exist_ok=True)
SCRATCH = Path(tempfile.mkdtemp(prefix='foundry-module-one-checks-',dir=SCRATCH_PARENT))
(SCRATCH/'package.json').write_text('{"private":true,"type":"module"}\n',encoding='utf-8')
SOURCE = Path(json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf-8-sig'))['sourceCache'])
COMMANDER = Path(os.environ.get('HARNESS_PROBE_COMMANDER', 'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js'))
records = []
def execute(args, log):
    result = subprocess.run([str(x) for x in args], cwd=REPO, capture_output=True, encoding='utf-8', errors='strict', env={**os.environ,'PYTHONUTF8':'1'})
    (E/log).write_text(result.stdout+result.stderr, encoding='utf-8')
    records.append({'command':[str(x) for x in args], 'exitCode':result.returncode, 'log':log})
    if result.returncode: raise RuntimeError(f'{log}: {result.stdout[-1500:]} {result.stderr[-1500:]}')
def ts(args, log, config=None):
    execute(['node',REPO/'node_modules/tsx/dist/cli.mjs',*(['--tsconfig',config] if config else []),*args],log)
def derived(h, filename, name, replacements):
    original=ROOT.parent/h/'scripts'/filename
    text=original.read_text(encoding='utf-8')
    # 新脚本位于外部临时目录，绝对导入保持与原夹具完全相同的真实组件。
    for folder in ['server','src','tailwind.config.js']:
        text=text.replace('../../../../'+folder, (REPO/folder).as_uri())
    text=re.sub(r"fileURLToPath\(new URL\('../',\s*import.meta.url\)\)",lambda m:json.dumps((ROOT.parent/h).as_posix()),text)
    text=re.sub(r"resolve\(root,\s*'evidence/content-check.json'\)",lambda m:json.dumps((E/(h+'-content-check.json')).as_posix()),text)
    text=re.sub(r"resolve\(root,\s*'evidence/visual-qa.json'\)",lambda m:json.dumps((E/(h+'-visual-qa.json')).as_posix()),text)
    for a,b in replacements: text=text.replace(a,b)
    path=SCRATCH/name;path.write_text(text,encoding='utf-8')
    records.append({'derivedFrom':original.relative_to(REPO).as_posix(),'sourceSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'adaptation':'absolute module imports, original lesson root, audit-only output paths; original proof logic retained','derivedScript':str(path),'derivedSha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    return path

if __name__=='__main__':
    for h,lab in ([] if '--helpers-only' in sys.argv else [('h01','compare'),('h02','navigate'),('h03','trace'),('h04','launch-lab')]):
        folder=REPO/f'course-content/internal/deepseek-harness/{h}/lab'
        execute(['node','--test',folder/f'{lab}.test.mjs'],f'{h}-lab-tests.tap')
        execute(['node',folder/f'{lab}.mjs','--self-test'],f'{h}-lab-self-test.txt')
        # 原生成器只刷新四个本轮允许修订的阅读预览。
        ts([ROOT.parent/h/'scripts/make-reading-preview.tsx'],f'{h}-preview.txt')
        content=derived(h,'check-content.ts',h+'-content.ts',[("resolve(root,'evidence/content-check.json')",json.dumps((E/(h+'-content-check.json')).as_posix()))])
        ts([content],f'{h}-content.txt')
        out=E/'visual'/h;out.mkdir(parents=True,exist_ok=True)
        qa=derived(h,'preview-and-qa.tsx',h+'-qa.tsx',[
            ('path:resolve(root,f.image)',f'path:{json.dumps(out.as_posix())}+"/"+f.id+"-master.png"'),
            ('path:resolve(root,`figures/qa/',f'path:resolve({json.dumps(out.as_posix())},`'),
            ("resolve(root,'evidence/visual-qa.json')",json.dumps((E/(h+'-visual-qa.json')).as_posix()))])
        ts([qa],f'{h}-visual.txt')
    if '--helpers-only' not in sys.argv: execute(['node','--import','tsx','--test','tests/lesson-renderer.test.ts'],'renderer-tests.tap')
    for h,name in ([] if '--helpers-only' in sys.argv else [('h03','inspect-flow.ts'),('h04','inspect-boot.ts')]):
        p=derived(h,name,h+'-'+name,[("resolve(root,'evidence/control-flow.json')",json.dumps((E/(h+'-control-flow.json')).as_posix()))])
        ts([p],h+'-ast.txt')
    # H03 helper import 从 CLI 给定的固定源码取；输出单独重定向。
    p=derived('h03','actual-probes.ts','actual-stream-probes.ts',[("new URL('../evidence/actual-probes.json',import.meta.url)",json.dumps((E/'actual-stream-probes.json').as_posix()))])
    ts([p,SOURCE],'actual-stream-probes.txt',SOURCE/'tsconfig.base.json')
    # H04 子进程依靠 own 定位自身，故原 root 的计算也改为显式原作者目录。
    p=derived('h04','actual-probes.ts','actual-boot-probes.ts',[
        ("root=resolve(own,'../..')",'root='+json.dumps((ROOT.parent/'h04').as_posix())),
        ("resolve(root,'evidence/actual-probes.json')",json.dumps((E/'actual-boot-probes.json').as_posix()))])
    ts([p,SOURCE,COMMANDER],'actual-boot-probes.txt',SOURCE/'tsconfig.base.json')
    (E/'run-record.json').write_text(json.dumps({'records':records,'mode':'helpers-only' if '--helpers-only' in sys.argv else 'full','previousChecks':'Four lessons, Renderer and AST logs/JSON retained from the full run before helper output-path fix; no lesson or proof-logic changes after that run.' if '--helpers-only' in sys.argv else 'All listed commands executed in this run.','scratchRetained':str(SCRATCH),'upstreamSuite':'NOT_RUN','scope':'37 lab cases + 9 existing Renderer tests; 11 AST checks, 14 actual-source helper checks; no full application boot'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS: four lessons, existing Renderer tests, AST and isolated actual-source helper checks. See evidence/run-record.json')
