"""Explicit-source packaging and independent installs. No existing tree is cleaned."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import subprocess, hashlib, json, re, tempfile, time, os, shutil

repo=Path(__file__).resolve().parents[3]
stamp=str(int(time.time()*1000))
evidence=repo/'docs/ai-browser-copilot/p2/artifacts'/('delivery-'+stamp)
evidence.mkdir(parents=True)
out=repo/'course-content/internal/ai-browser-copilot/p2/deliverables'; out.mkdir(exist_ok=True)
names=['.nvmrc','.npmrc','.gitignore','README.md','package.json','package-lock.json','tsconfig.json',
 'extension/wxt.config.ts','extension/entrypoints/background.ts','extension/entrypoints/sidepanel/index.html',
 'extension/entrypoints/sidepanel/main.tsx','extension/entrypoints/sidepanel/App.tsx','extension/entrypoints/sidepanel/style.css',
 'extension/src/contracts.ts','extension/src/context-tokens.ts','extension/src/extract.ts','extension/src/coordinator.ts','extension/src/read-client.ts','scripts/fixtures.mjs']
roots={'starter':repo/'starter/ai-browser-copilot/p2','reference':repo/'course-content/internal/ai-browser-copilot/p2/reference'}
report={'time':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'sources':[],'extension_packages':[],'validation':{}}
spike=json.loads((repo/'spikes/ai-browser-copilot-spike/package-lock.json').read_text('utf-8'))
p1=json.loads((repo/'course-content/internal/ai-browser-copilot/p1/reference/package-lock.json').read_text('utf-8'))
def sha(b): return hashlib.sha256(b).hexdigest()
def add(z,name,data):
    info=ZipInfo(name,date_time=(2026,10,14,0,0,0)); info.compress_type=ZIP_DEFLATED; info.external_attr=0o100644<<16
    z.writestr(info,data)
def run(label,args,cwd):
    result=subprocess.run(args,cwd=cwd,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=180)
    (evidence/(label+'.txt')).write_text(result.stdout+'\n'+result.stderr+'\nexit_code='+str(result.returncode),encoding='utf-8')
    if result.returncode: raise RuntimeError(f'{label}: exit {result.returncode}, see raw log')
    return result.stdout
try:
    for role,source in roots.items():
        dest=out/f'ai-web-reader-p2-{role}.zip'
        lock=json.loads((source/'package-lock.json').read_text('utf-8'))
        for name,pkg in lock['packages'].items():
            if name:
                old=spike['packages'][name]
                assert pkg.get('version')==old.get('version') and pkg.get('integrity')==old.get('integrity'),name
        with ZipFile(dest,'w',ZIP_DEFLATED) as z:
            for name in names:
                f=source/name; assert f.is_file() and not f.is_symlink(),name
                b=f.read_bytes(); text=b.decode('utf-8')
                assert not re.search(r'(?i)([A-Z]:[\\/]Users[\\/]|sk-[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY|AKIA[A-Z0-9]{16})',text),name
                add(z,name,b)
        validation=Path(tempfile.mkdtemp(prefix='aifoundry-p2-'+role+'-'))
        with ZipFile(dest) as z:
            assert sorted(z.namelist())==sorted(names)
            for name in names: assert z.read(name)==(source/name).read_bytes()
            z.extractall(validation)
        shutil.copy2(dest,evidence/dest.name)
        assert not (validation/'node_modules').exists()
        run(role+'-fresh-ci',['npm.cmd','ci'],validation)
        run(role+'-fresh-typecheck',['npm.cmd','run','typecheck'],validation)
        run(role+'-fresh-build',['npm.cmd','run','build'],validation)
        built=validation/'.output/chrome-mv3'
        manifest=json.loads((built/'manifest.json').read_text('utf-8'))
        assert sorted(manifest['permissions'])==['activeTab','scripting','sidePanel','storage']
        assert manifest['manifest_version']==3 and manifest['minimum_chrome_version']=='116'
        assert manifest['side_panel']['default_path']=='sidepanel.html'
        assert not any(k in manifest for k in ['host_permissions','content_scripts','externally_connectable'])
        assert not manifest['action'].get('default_popup')
        assert "connect-src 'none'" in manifest['content_security_policy']['extension_pages']
        (evidence/(role+'-manifest.json')).write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
        extnames=['manifest.json','sidepanel.html','background.js']
        extnames+=sorted(str(p.relative_to(built)).replace('\\','/') for p in (built/'chunks').glob('*.js'))
        extnames+=sorted(str(p.relative_to(built)).replace('\\','/') for p in (built/'assets').glob('*.css'))
        extzip=out/f'ai-web-reader-p2-{role}-chrome.zip'
        with ZipFile(extzip,'w',ZIP_DEFLATED) as z:
            for name in extnames:
                b=(built/name).read_bytes(); assert not re.search(rb'(?i)[A-Z]:[\\/]Users[\\/]',b)
                add(z,name,b)
        shutil.copy2(extzip,evidence/extzip.name)
        report['sources'].append({'role':role,'file':str(dest.relative_to(repo)).replace('\\','/'),'sha256':sha(dest.read_bytes()),'bytes':dest.stat().st_size,'files':names,'lock_packages':len(lock['packages'])-1,'lock_provenance':'all package version/integrity match Phase0','source_matches_zip':True})
        report['extension_packages'].append({'role':role,'file':str(extzip.relative_to(repo)).replace('\\','/'),'sha256':sha(extzip.read_bytes()),'bytes':extzip.stat().st_size,'files':extnames,'file_sha256':{n:sha((built/n).read_bytes()) for n in extnames}})
        report['validation'][role]={'directory':str(validation),'install':'PASS','typecheck':'PASS','build':'PASS','manifest':'PASS'}
    report['starter_reference_differences']=[n for n in names if (roots['starter']/n).read_bytes()!=(roots['reference']/n).read_bytes()]
    assert (roots['starter']/'package-lock.json').read_bytes()==(roots['reference']/'package-lock.json').read_bytes()
    newlock=json.loads((roots['reference']/'package-lock.json').read_text('utf-8'))
    report['p1_retained_lock_entries']=sum(1 for n in newlock['packages'] if n and n in p1['packages'])
    assert set(newlock['packages'])-set(p1['packages'])=={'node_modules/zod'}
    report['status']='PASS'
except Exception as error:
    report['status']='FAIL'; report['error']=repr(error)
finally:
    (evidence/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    (repo/'docs/ai-browser-copilot/p2/artifacts/latest-delivery.json').write_text(json.dumps({'evidence':str(evidence.relative_to(repo)).replace('\\','/'),'status':report['status']},indent=2),encoding='utf-8')
    print(json.dumps({'evidence':str(evidence),'status':report['status'],'validation':report['validation'],'error':report.get('error')},ensure_ascii=False,indent=2))
if report['status']!='PASS': raise SystemExit(1)
