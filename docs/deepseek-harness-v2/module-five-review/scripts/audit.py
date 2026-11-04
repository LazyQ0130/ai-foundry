"""Read-only inventory and protection evidence; never deletes files."""
from pathlib import Path
import hashlib, json, subprocess, sys, re
ROOT=Path(__file__).resolve().parents[4]
HERE=Path(__file__).resolve().parents[1]
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def save(name,obj):
    p=HERE/'evidence'/name; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if sys.argv[1]=='baseline':
    target=HERE/'evidence/workspace-before.json'
    if target.exists(): raise SystemExit('Refusing to overwrite baseline')
    raw=subprocess.check_output(['git','status','--porcelain=v1','-z'],cwd=ROOT).decode()
    paths=[x[3:] for x in raw.split('\0') if x and 'module-five-review/' not in x]
    save('workspace-before.json',{'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip(),'status':raw,'protected':{p:digest(ROOT/p) for p in paths if (ROOT/p).is_file()},'output':{str(p.relative_to(ROOT)):digest(p) for p in (ROOT/'output').rglob('*') if p.is_file()}})
elif sys.argv[1]=='inventory':
    selected=[]
    base=ROOT/'docs/deepseek-harness-v2'
    for p in base.rglob('*'):
        rel=p.relative_to(base).as_posix()
        if p.is_file() and (rel in ['A-blueprint-v2.md','E-production-standard.md'] or re.match(r'(module-(one|two|three|four)-review/[^/]+\.md|h(17|18|19|20)/)',rel)) and p.suffix in ['.md','.ts','.tsx','.mjs','.py','.txt','.json','.svg']:
            selected.append(p)
    for h in [12,14,17,18,19,20]:
        selected.extend(p for p in (ROOT/f'course-content/internal/deepseek-harness/h{h}').rglob('*') if p.is_file())
    save('material-inventory.json',[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(set(selected))])
    print(len(set(selected)),'text/source evidence files inventoried')
elif sys.argv[1]=='read':
    p=ROOT/sys.argv[2]; s=p.read_text(encoding='utf-8-sig').splitlines()
    start=int(sys.argv[3]) if len(sys.argv)>3 else 1
    end=int(sys.argv[4]) if len(sys.argv)>4 else len(s)
    print(f'{p.relative_to(ROOT)} | {len(s)} lines | sha256 {digest(p)}')
    print('\n'.join(f'{i+1}: {s[i]}' for i in range(start-1,min(end,len(s)))))
elif sys.argv[1]=='protect':
    old=json.loads((HERE/'evidence/workspace-before.json').read_text(encoding='utf-8'))
    changed=[p for group in ['protected','output'] for p,h in old[group].items() if not (ROOT/p).is_file() or digest(ROOT/p)!=h]
    save('protection-check.json',{'changed':changed,'pass':not changed})
    print('protected differences',changed)
    if changed: raise SystemExit(1)
