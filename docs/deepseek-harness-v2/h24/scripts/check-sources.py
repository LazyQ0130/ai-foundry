"""核锁定缓存字节与 Git blob；不运行上游带递归清理的测试。"""
from pathlib import Path
import os,json,hashlib,subprocess,re
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
SOURCE=Path(os.environ.get('HARNESS_SOURCE_CACHE',r'C:\Users\QYF\.codex\research\harness-v2-source\deepseek-harness-'+COMMIT))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',r'C:\Users\QYF\.codex\research\deepseek-harness-f3803c9'))
tree=subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r',COMMIT],text=True)
blobs={line.split('\t',1)[1]:line.split()[2] for line in tree.splitlines() if '\t' in line}
prefixes=('vendor/','packages/','native/system/','apps/cli/','snapshots/','benchmarks/','apps/web/tests/','scripts/')
docs=['docs/testing.zh.md','vitest.config.ts','AGENTS.md','benchmarks/AGENTS.md','scripts/run-gates.ts','docs/subsystems/web-server.zh.md','apps/cli/README.zh.md','apps/cli/reference/README.zh.md','python/README.zh.md','python/sdk/README.zh.md','docs/subsystems/workflow.zh.md','docs/subsystems/jobs.zh.md','docs/subsystems/goal.zh.md','docs/subsystems/schedule.zh.md','docs/subsystems/subagent.zh.md','docs/subsystems/agent-team.zh.md','docs/subsystems/compaction.zh.md','docs/subsystems/token-meter.zh.md','docs/config-catalog.zh.md','docs/subsystems/session.zh.md','docs/subsystems/session-projection.zh.md','docs/subsystems/persistence.zh.md','docs/persistence-catalog.zh.md','docs/capability-seams.zh.md','docs/subsystems/web.zh.md','docs/subsystems/mcp.zh.md','docs/subsystems/approval.zh.md','docs/subsystems/sandbox.zh.md','docs/subsystems/filesystem.zh.md','docs/tool-execution-pipeline.zh.md','docs/subsystems/tools.zh.md','docs/cookbook/adding-a-tool.zh.md','docs/architecture.zh.md','docs/agent-lifecycle.zh.md','docs/subsystems/core.zh.md','docs/subsystems/system-prompt.zh.md','docs/subsystems/llm-streaming.zh.md','docs/cordis-tutorial/06-composition-and-hmr.zh.md','docs/subsystems/boot.zh.md','SAFETY.zh.md','LICENSE','package.json','tsconfig.base.json','pnpm-lock.yaml']
docs+=['docs/subsystems/otel.zh.md','docs/postmortem/0001-acp-default-export-drops-inject.zh.md','vitest.web.config.ts','vitest.snapshot.config.ts']
paths=sorted(p for p in blobs if (p.startswith(prefixes) and (p.endswith(('.ts','.mjs','.yml','.yaml','.json','.md','LICENSE')))) or p in docs)
files=[]
for path in paths:
 data=(SOURCE/path).read_bytes(); blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 assert blob==blobs[path],path
 files.append({'path':path,'sha256':hashlib.sha256(data).hexdigest(),'gitBlob':blob,'lines':len(data.splitlines())})
lock={'repository':'https://github.com/deepseek-ai/deepseek-harness','commit':COMMIT,'rootVersion':'0.2.2-alpha.2','cordisVersion':'4.0.6-alpha.1','sourceCache':str(SOURCE),'gitCache':str(GIT),'files':files,'method':'SHA1 Git blob against fixed ls-tree and SHA256 before runtime'}
(ROOT/'evidence/source-lock.json').write_text(json.dumps(lock,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
refs=[]
for name in ['course-content/internal/deepseek-harness/h24/lesson.md','docs/deepseek-harness-v2/h24/source-checklist.md']:
 p=REPO/name
 if not p.exists():continue
 for match in re.finditer(r'/blob/('+COMMIT+r')/([^\s)#]+)#L(\d+)-L(\d+)',p.read_text(encoding='utf-8')):
  _,path,a,b=match.groups(); assert path in paths,path
  lines=(SOURCE/path).read_text(encoding='utf-8').splitlines();assert 1<=int(a)<=int(b)<=len(lines),(path,a,b)
  refs.append({'file':name,'path':path,'start':int(a),'end':int(b)})
(ROOT/'evidence/source-check.json').write_text(json.dumps({'status':'PASS','commit':COMMIT,'files':len(files),'references':refs,'meaning':'Byte/range integrity only; semantic review in source-checklist. Official tests selected/read, not executed.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(files)} fixed source/config/document files, {len(refs)} bounded references')
