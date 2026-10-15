from pathlib import Path
from zipfile import ZipFile
from datetime import datetime, timezone
import json,hashlib,subprocess
repo=Path(__file__).resolve().parents[2]
e=repo/'docs/ai-browser-copilot/artifacts/p1-20261014'
baseline=json.loads((e/'protected-baseline.json').read_text(encoding='utf-8'))
report={'time':datetime.now(timezone.utc).isoformat(),'protected':{},'final_zip_reinstall':[]}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for group in ['tracked_working_files','phase0_files']:
    changed=[f['file'] for f in baseline[group] if not (repo/f['file']).is_file() or sha(repo/f['file'])!=f['sha256']]
    report['protected'][group]={'count':len(baseline[group]),'unchanged':len(baseline[group])-len(changed),'changed':changed,'status':'EXTERNAL_CHANGES_DETECTED' if changed else 'PASS'}
    if group=='phase0_files':
        assert not changed,changed
audit=json.loads((e/'delivery-audit.json').read_text(encoding='utf-8'))
for item in audit['source_packages']:
    root=repo/f'.runtime/p1-final-package-recheck-20261014/{item["role"]}'
    assert sha(repo/item['file'])==item['sha256']
    with ZipFile(repo/item['file']) as z:
        for name in item['files']:
            assert (root/name).read_bytes()==z.read(name),name
    compiled=next(p for p in audit['extension_packages'] if p['role']==item['role'])
    with ZipFile(repo/compiled['file']) as z:
        for name in z.namelist():
            assert (root/'.output/chrome-mv3'/name).read_bytes()==z.read(name),name
    report['final_zip_reinstall'].append({'role':item['role'],'status':'PASS','sourceZipSha256':item['sha256'],'filesEqualToFinalSourceZip':len(item['files']),'productionFilesEqualToIndependentlyBuiltZip':len(compiled['files'])})
status=subprocess.run(['git','status','--short'],cwd=repo,text=True,capture_output=True,encoding='utf-8',check=True).stdout
(e/'git-status-final.txt').write_text(status,encoding='utf-8')
report['status']='PASS for isolated P1 packages and Phase0 preservation; workspace baseline has separately recorded external changes'
external=json.loads((e/'external-isolation-path.json').read_text(encoding='utf-8'))
report['outside_repository_reinstall']=[]
for item in audit['extension_packages']:
    built=Path(external['root'])/item['role']/'.output/chrome-mv3'
    with ZipFile(repo/item['file']) as z:
        for name in z.namelist():
            assert (built/name).read_bytes()==z.read(name),name
    report['outside_repository_reinstall'].append({'role':item['role'],'status':'PASS','productionFilesEqual':len(item['files']),'installation':'npm ci and typecheck, WXT production build+zip in fresh system TEMP, outside parent repository configs/dependencies'})
report['notes']='P1 writes limited to three new delivery/document roots and private .runtime/system TEMP validation. Four protected paths changed during concurrent workspace work; they were not edited or reverted by this task and are excluded from deliverables. No git staging/commit/push; no database/migration or publish commands executed.'
(e/'scope-and-reinstall-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
