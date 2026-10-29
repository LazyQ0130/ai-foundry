from pathlib import Path
import json, os, subprocess, tempfile
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
source=Path(json.loads((ROOT.parent/'h08/evidence/source-lock.json').read_text(encoding='utf-8'))['sourceCache'])
scratch=Path(tempfile.mkdtemp(prefix='module-two-probe-'))
(scratch/'tsconfig.json').write_text(json.dumps({'extends':(source/'tsconfig.base.json').as_posix()}),encoding='utf-8')
args=['node',str(REPO/'node_modules/tsx/dist/cli.mjs'),'--tsconfig',str(scratch/'tsconfig.json'),'--test','--test-reporter=tap',str(ROOT/'probes/cross-course.test.ts')]
env={k:os.environ[k] for k in ['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'] if k in os.environ}
r=subprocess.run(args,cwd=REPO,env=env,capture_output=True,encoding='utf-8')
log=ROOT/'evidence'/('cross-course-'+scratch.name+'.tap')
log.write_text(r.stdout+r.stderr,encoding='utf-8')
(ROOT/'evidence'/('cross-course-'+scratch.name+'.json')).write_text(json.dumps({'command':args,'exitCode':r.returncode,'log':log.name,'scratchRetained':str(scratch),'grade':'B','officialCommit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3','fullHarness':'NOT_RUN'},indent=2)+'\n',encoding='utf-8')
print(r.stdout+r.stderr)
raise SystemExit(r.returncode)
