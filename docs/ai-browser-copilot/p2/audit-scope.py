"""Read-only audit against the pre-task current-content baseline. No git staging."""
from pathlib import Path
from zipfile import ZipFile
import json, hashlib, subprocess, re, time
repo=Path(__file__).resolve().parents[3]
evidence=repo/'docs/ai-browser-copilot/p2/artifacts'
baseline=json.loads((evidence/'protected-baseline.json').read_text('utf-8'))
changed=[]; missing=[]
for item in baseline['files']:
    path=repo/item['path']
    if not path.is_file(): missing.append(item['path']); continue
    if hashlib.sha256(path.read_bytes()).hexdigest()!=item['sha256']: changed.append(item['path'])
current=subprocess.run(['git','status','--short'],cwd=repo,capture_output=True,text=True,encoding='utf-8').stdout
latest=json.loads((evidence/'latest-delivery.json').read_text('utf-8'))
delivery=json.loads((repo/latest['evidence']/'report.json').read_text('utf-8'))
packages=[]
for item in delivery['sources']+delivery['extension_packages']:
    path=repo/item['file']
    assert hashlib.sha256(path.read_bytes()).hexdigest()==item['sha256']
    with ZipFile(path) as z:
        assert sorted(z.namelist())==sorted(item['files'])
        for name in z.namelist():
            assert not any(part in ['node_modules','.wxt','.output','profile','profiles'] or part.startswith('.env') for part in Path(name).parts),name
            data=z.read(name)
            assert not re.search(rb'(?i)((?<![A-Za-z0-9])[A-Z]:[\\/]|/Users/|/home/|sk-[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY)',data),name
        if 'file_sha256' in item:
            assert all(hashlib.sha256(z.read(n)).hexdigest()==sha for n,sha in item['file_sha256'].items())
        else:
            source=repo/('starter/ai-browser-copilot/p2' if item['role']=='starter' else 'course-content/internal/ai-browser-copilot/p2/reference')
            assert all(z.read(n)==(source/n).read_bytes() for n in item['files'])
    packages.append({'file':item['file'],'sha256':item['sha256'],'files':len(item['files']),'status':'PASS'})
manual=json.loads((evidence/'manual-target.json').read_text('utf-8'))
for name,sha in manual['file_sha256'].items(): assert hashlib.sha256((Path(manual['extension_directory'])/name).read_bytes()).hexdigest()==sha
report={'status':'PASS' if not changed and not missing else 'REVIEW_EXTERNAL_CHANGES','baseline_files':len(baseline['files']),'unchanged':len(baseline['files'])-len(changed)-len(missing),'changed':changed,'missing':missing,'packages':packages,'manual_production_bits_match':True,'git_status_after':current,'staging_commit_push':'not performed','scope':'P2 new paths only; all pre-existing dirty content compared against its start-of-task bytes'}
report['phase0_protected_files']=sum(1 for item in baseline['files'] if item['path'].replace('\\','/').startswith('spikes/ai-browser-copilot-spike/'))
report['phase0_changed']=[p for p in changed+missing if p.replace('\\','/').startswith('spikes/ai-browser-copilot-spike/')]
report['p1_or_blueprint_changed']=[p for p in changed+missing if '/p1/' in p.replace('\\','/') or p.replace('\\','/').startswith('starter/ai-browser-copilot/p1/') or p.endswith('blueprint-v1.2.md') or '/ai-browser-copilot/p1-' in p.replace('\\','/')]
(evidence/'scope-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(evidence/('scope-audit-'+str(int(time.time()*1000))+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='git_status_after'},ensure_ascii=False,indent=2))
