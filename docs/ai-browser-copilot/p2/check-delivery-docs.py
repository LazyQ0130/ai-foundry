from pathlib import Path
import json, re, hashlib
repo=Path(__file__).resolve().parents[3]
docs=repo/'docs/ai-browser-copilot/p2'
course=repo/'course-content/internal/ai-browser-copilot/p2'
files=[docs/name for name in ['final-report.md','acceptance-matrix.md','manual-chrome.md','decisions.md']]
files += [course/name for name in ['README.md','lesson.md','increment-from-p1.md','starter-reference-diff.md','handoff-p3.md']]
checked=0
for file in files:
    text=file.read_text('utf-8')
    for raw in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)',text):
        target=raw.split('#',1)[0].strip('<>')
        if not target or target.startswith(('https://','http://','/environment')): continue
        assert (file.parent/target).resolve().exists(),(str(file),target)
        checked+=1
latest=json.loads((docs/'artifacts/latest-delivery.json').read_text('utf-8'))
delivery=json.loads((repo/latest['evidence']/'report.json').read_text('utf-8'))
assert delivery['status']=='PASS'
for item in delivery['sources']+delivery['extension_packages']:
    assert hashlib.sha256((repo/item['file']).read_bytes()).hexdigest()==item['sha256']
    assert item['sha256'] in (docs/'final-report.md').read_text('utf-8') or item['role']=='starter'
report={'status':'PASS','documents':len(files),'local_links':checked,'final_hashes_match_report':True,'scope':'Private P2 documents only; no route/catalogue/publication changes'}
(docs/'artifacts/delivery-docs-check.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
