import hashlib, json, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).resolve().parents[1] / 'evidence'
OUT.mkdir(parents=True, exist_ok=True)
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
paths = set(git('ls-files', '-z').decode().split('\0')) - {''}
paths.update(x for x in git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0') if x)
paths.update(p.relative_to(ROOT).as_posix() for p in (ROOT/'output').rglob('*') if p.is_file())
files = {p: digest(ROOT/p) for p in sorted(paths) if (ROOT/p).is_file() and '/module-three-review/' not in p}
data = dict(head=git('rev-parse','HEAD').decode().strip(), status=git('status','--short').decode(), files=files)
(OUT/'workspace-before.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'user-before.patch').write_bytes(git('diff','--binary'))
print(json.dumps(dict(files=len(files),status=data['status']),ensure_ascii=False))
