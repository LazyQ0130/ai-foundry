"""把四份实际 SSR 预览生成到保留夹具，逐字比较当前交付，补足静态页时效证据。"""
from pathlib import Path
import hashlib,json,runpy
HERE=Path(__file__).resolve().parent
helper=runpy.run_path(str(HERE/'run-audit.py'),run_name='audit_preview_helpers')
ROOT=helper['ROOT'];E=helper['E'];scratch=helper['SCRATCH'];rows=[]
for h in ['h01','h02','h03','h04']:
 expected=scratch/(h+'-expected.html')
 p=helper['derived'](h,'make-reading-preview.tsx',h+'-expected.tsx',[("resolve(root,'reading-preview.html')",json.dumps(expected.as_posix()))])
 helper['ts']([p],h+'-preview-sync.txt')
 current=ROOT.parent/h/'reading-preview.html'
 assert expected.read_bytes()==current.read_bytes(),h
 rows.append({'lesson':h,'status':'EXACT_MATCH_WITH_CURRENT_SSR','previewSha256':hashlib.sha256(current.read_bytes()).hexdigest(),'generatorSha256':hashlib.sha256((ROOT.parent/h/'scripts/make-reading-preview.tsx').read_bytes()).hexdigest()})
(E/'preview-sync.json').write_text(json.dumps({'status':'PASS','method':'actual unchanged lesson preview generator, absolute imports/root and audit-only target; byte comparison','rows':rows,'scratchRetained':str(scratch)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: four current reading previews byte-match current actual parser/SSR/CSS output')
