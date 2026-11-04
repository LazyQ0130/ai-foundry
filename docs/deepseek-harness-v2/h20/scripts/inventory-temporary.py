"""只读登记 H20 临时材料；不删除、不压缩、不迁移任何文件。"""
from pathlib import Path
import datetime, hashlib, json, tempfile

R=Path(__file__).resolve().parents[1]; E=R/'evidence'; T=Path(tempfile.gettempdir()).resolve()
roots=set()
for p in E.glob('run-*.json'):
    d=json.loads(p.read_text(encoding='utf-8'))
    if d.get('scratch'): roots.add(Path(d['scratch']).resolve())
if (E/'visual-qa.json').exists():
    roots.add(Path(json.loads((E/'visual-qa.json').read_text(encoding='utf-8'))['scratch']).resolve())
# Earlier direct preview attempts may predate a raw check wrapper. Discovery is
# read-only, scoped to this lesson's distinctive prefix, and never a cleanup list.
roots.update(p.resolve() for p in T.glob('aifoundry-h20-*') if p.is_dir())
items=[]
for root in sorted(roots):
    assert root.parent==T and root.name.startswith('aifoundry-h20-'),root
    assert root.is_dir(),root
    files=[]; directories=[str(root)]
    for p in sorted(root.rglob('*')):
        if p.is_dir(): directories.append(str(p))
        elif p.is_file(): files.append({'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    items.append({'root':str(root),'purpose':'isolated real-component/JSONL lab' if root.name.startswith('aifoundry-h20-lab-') else 'author-only browser build and preview','state':'retained, no deletion performed','files':files,'directories':directories})
data={'generatedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'policy':'retain every new file and empty directory; no bulk deletion; H18 materials audited separately','rootCount':len(items),'fileCount':sum(len(i['files']) for i in items),'directoryCount':sum(len(i['directories']) for i in items),'items':items}
(E/'temporary-artifacts.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"retained H20 roots={data['rootCount']}, files={data['fileCount']}, directories={data['directoryCount']}")
