"""Point only P2 delivery documentation at the final tested artifacts; preserve prior report."""
from pathlib import Path
import json, shutil
repo=Path(__file__).resolve().parents[3]
docs=repo/'docs/ai-browser-copilot/p2'
history=docs/'artifacts/timeout-regression-1791972430571'
for name in ['final-report.md','acceptance-matrix.md','manual-chrome.md']:
    dest=history/('before-fix-'+name)
    if not dest.exists(): shutil.copy2(docs/name,dest)
latest=json.loads((docs/'artifacts/latest-delivery.json').read_text('utf-8'))
delivery=json.loads((repo/latest['evidence']/'report.json').read_text('utf-8'))
ref=next(p for p in delivery['sources'] if p['role']=='reference')
ext=next(p for p in delivery['extension_packages'] if p['role']=='reference')
for name in ['final-report.md','acceptance-matrix.md','manual-chrome.md','work-log.md']:
    path=docs/name; text=path.read_text('utf-8')
    replacements={
     'delivery-1791971621071':'delivery-1791973166736',
     'checks-1791971784892':'checks-1791973212864',
     'chrome-1791972063245':'chrome-1791973208067',
     '24项':'28项',
     'p2-native-20261014\\':'p2-native-20261014-final\\',
     'c0da4160686bc6c994a7a9e86fa7c9145979605d6c21b90067893366280e8777':ref['sha256'],
     '8edaf81047449d9727baf79194e3ffa7a8836aa585c345dc3dcddf7245edd30f':ext['sha256'],
    }
    for old,new in replacements.items(): text=text.replace(old,new)
    path.write_text(text,encoding='utf-8')
print(json.dumps({'reference_source_sha256':ref['sha256'],'reference_chrome_sha256':ext['sha256'],'delivery':latest['evidence']},indent=2))
