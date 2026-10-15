"""Explicit whitelist packaging. No cleanup or source-tree traversal."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib, json, re
repo=Path(__file__).resolve().parents[2]
out=repo/'course-content/internal/ai-browser-copilot/p1/deliverables'
out.mkdir(exist_ok=True)
evidence=repo/'docs/ai-browser-copilot/artifacts/p1-20261014'
names=['.nvmrc','.npmrc','.gitignore','README.md','package.json','package-lock.json','tsconfig.json','extension/wxt.config.ts','extension/entrypoints/background.ts','extension/entrypoints/sidepanel/index.html','extension/entrypoints/sidepanel/main.tsx','extension/entrypoints/sidepanel/App.tsx','extension/entrypoints/sidepanel/style.css']
roots={'starter':repo/'starter/ai-browser-copilot/p1','reference':repo/'course-content/internal/ai-browser-copilot/p1/reference'}
report={'source_packages':[],'extension_packages':[]}
def add(z,name,b):
    info=ZipInfo(name,date_time=(2026,10,14,0,0,0))
    info.compress_type=ZIP_DEFLATED
    info.external_attr=0o100644 << 16
    z.writestr(info,b)
for role,source in roots.items():
    dest=out/f'ai-web-reader-p1-{role}.zip'
    with ZipFile(dest,'w',ZIP_DEFLATED) as z:
        for name in names:
            f=source/name
            assert f.is_file() and not f.is_symlink(),name
            b=f.read_bytes()
            text=b.decode('utf-8')
            assert not re.search(r'(?i)([A-Z]:[\\/]Users[\\/]|sk-[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY|AKIA[A-Z0-9]{16})',text),name
            add(z,name,b)
    with ZipFile(dest) as z:
        assert sorted(z.namelist())==sorted(names)
        for name in names:
            assert z.read(name)==(source/name).read_bytes()
    report['source_packages'].append({'role':role,'file':str(dest.relative_to(repo)),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'files':names,'sensitive_scan':'PASS: explicit whitelist, no profile/cache/env/keys/developer absolute paths; ZIP contents equal source'})
    built=repo/f'.runtime/p1-clean-online-20261014/{role}/.output/chrome-mv3'
    expected=['manifest.json','sidepanel.html','background.js']
    expected+=sorted(str(p.relative_to(built)).replace('\\','/') for p in (built/'chunks').glob('*.js'))
    expected+=sorted(str(p.relative_to(built)).replace('\\','/') for p in (built/'assets').glob('*.css'))
    extzip=out/f'ai-web-reader-p1-{role}-chrome.zip'
    with ZipFile(extzip,'w',ZIP_DEFLATED) as z:
        for name in expected:
            f=built/name
            assert f.is_file() and not f.is_symlink()
            b=f.read_bytes()
            assert not re.search(rb'(?i)[A-Z]:[\\/]Users[\\/]',b)
            add(z,name,b)
    report['extension_packages'].append({'role':role,'file':str(extzip.relative_to(repo)),'bytes':extzip.stat().st_size,'sha256':hashlib.sha256(extzip.read_bytes()).hexdigest(),'files':expected,'source':'independently installed production build; not proof of native toolbar behavior'})
diff=[n for n in names if (roots['starter']/n).read_bytes()!=(roots['reference']/n).read_bytes()]
assert diff==['README.md','extension/entrypoints/background.ts','extension/entrypoints/sidepanel/App.tsx'],diff
report['starter_reference_differences']=diff
lock=json.loads((roots['starter']/'package-lock.json').read_text())
spike=json.loads((repo/'spikes/ai-browser-copilot-spike/package-lock.json').read_text())
for name,pkg in lock['packages'].items():
    if name:
        old=spike['packages'][name]
        assert pkg.get('version')==old.get('version') and pkg.get('integrity')==old.get('integrity'),name
report['locked_reachable_packages']=len(lock['packages'])-1
report['lock_provenance']='PASS: every retained package version and integrity equals Phase0 lock'
(evidence/'delivery-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
