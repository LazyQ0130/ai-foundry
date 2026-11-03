"""只读枚举本次run记录所指的新建根；不执行任何清理。"""
from pathlib import Path
import json

E=Path(__file__).resolve().parents[1]/'evidence'
runs=[]
for p in sorted(E.glob('run-*.json')):
    d=json.loads(p.read_text(encoding='utf-8'))
    scratch=Path(d['scratch'])
    assert scratch.is_absolute() and scratch.name.startswith('aifoundry-h18-lab-')
    files=[{'path':str(f),'bytes':f.stat().st_size} for f in scratch.rglob('*')
           if f.is_file() and f.name.endswith(('.jsonl','.jsonl.zstd'))]
    runs.append({'record':p.name,'scratch':str(scratch),'exit':d['exit'],'retainedSessionArtifacts':files})
(E/'temporary-artifacts.json').write_text(json.dumps({
    'policy':'No bulk or recursive deletion. Known closed single artifacts may be unlinked by removeOne; empty directories, code copies, review/failure artifacts retained. This inventory only reads task-created roots.',
    'runs':runs,
},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Inventoried {len(runs)} task run records; no deletion')
