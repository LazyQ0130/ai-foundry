from pathlib import Path
import hashlib,json,subprocess
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';E.mkdir(parents=True,exist_ok=True)
if (E/'workspace-before.json').exists():raise SystemExit('Preserve existing audit baseline')
git=lambda *a:subprocess.check_output(['git',*a],cwd=P).decode('utf-8')
paths=set(git('ls-files','-z').split('\0'))|set(git('ls-files','--others','--exclude-standard','-z').split('\0'))
paths.update(p.relative_to(P).as_posix() for p in (P/'output').rglob('*') if p.is_file())
files=[{'path':p,'sha256':hashlib.sha256((P/p).read_bytes()).hexdigest()} for p in sorted(paths) if p and not p.startswith('docs/deepseek-harness-v2/module-four-review/') and (P/p).is_file()]
(E/'workspace-before.json').write_text(json.dumps({'base':git('rev-parse','HEAD').strip(),'status':git('status','--short'),'files':files},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(len(files))
