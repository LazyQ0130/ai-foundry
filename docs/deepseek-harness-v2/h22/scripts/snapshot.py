from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]; E=ROOT/'evidence';E.mkdir(parents=True,exist_ok=True)
if (E/'workspace-before.json').exists():raise SystemExit('Existing baseline preserved; never overwrite it during final verification.')
paths=set(subprocess.check_output(['git','ls-files','-z'],cwd=REPO).decode().split('\0'))-{''}
paths.update(p for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=REPO).decode().split('\0') if p)
paths.update(p.relative_to(REPO).as_posix() for p in (REPO/'output').rglob('*') if p.is_file())
allow=('docs/deepseek-harness-v2/h22/','course-content/internal/deepseek-harness/h22/')
files=[{'path':p,'sha256':hashlib.sha256((REPO/p).read_bytes()).hexdigest()} for p in sorted(paths) if not p.startswith(allow) and (REPO/p).is_file()]
data={'base':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),'status':subprocess.check_output(['git','status','--short'],cwd=REPO,text=True),'files':files}
(E/'workspace-before.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(len(files))
