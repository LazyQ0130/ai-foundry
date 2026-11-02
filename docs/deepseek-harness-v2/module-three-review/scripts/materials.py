from pathlib import Path
import hashlib,json,re,xml.etree.ElementTree as ET
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]; REPO=ROOT.parents[2]; E=ROOT/'evidence'
inventory=[];figures=[];previews=[];metrics=[]
for h in ['h09','h10','h11','h12']:
 paths=list((ROOT.parent/h).rglob('*'))+list((REPO/f'course-content/internal/deepseek-harness/{h}').rglob('*'))
 for p in sorted(p for p in paths if p.is_file()):inventory.append({'path':p.relative_to(REPO).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 for p in sorted((ROOT.parent/h/'figures/source').glob('*.svg')):
  svg=ET.fromstring(p.read_text(encoding='utf-8'));texts=[e.text for e in svg.iter() if e.tag.endswith('text')]
  figures.append({'id':p.stem,'path':p.relative_to(REPO).as_posix(),'texts':texts,'viewBox':svg.attrib['viewBox'],'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'pngSha256':hashlib.sha256((p.parent.parent/'rendered'/f'{p.stem}.png').read_bytes()).hexdigest()})
 html=(ROOT.parent/h/'reading-preview.html').read_text(encoding='utf-8')
 previews.append({'course':h,'bytes':len(html.encode()),'details':len(re.findall('<details',html)),'images':len(re.findall('<img ',html)),'headings':re.findall(r'<h[23][^>]*>(.*?)</h[23]>',html),'verification':'fresh check-content SSR equality against actual LessonMarkdown passed in baseline'})
 raw=(REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md').read_text(encoding='utf-8')
 body=raw.split('---',2)[2];default=re.sub(r':::deepdive[^\n]*\n.*?\n:::', '',body,flags=re.S)
 def cjk(s):
  s=re.sub(r'```[^\n]*\n.*?```','',s,flags=re.S);s=re.sub(r'<!--.*?-->','',s,flags=re.S);s=re.sub(r'https?://[^\s)]+','',s)
  return len(re.findall(r'[\u4e00-\u9fff]',s))
 codes=re.findall(r'```[^\n]*\n(.*?)```',body,re.S)
 refs=[(m[0],int(m[1]),int(m[2] or m[1])) for m in re.findall(r'/blob/[0-9a-f]{40}/([^\s)#]+)#L(\d+)(?:-L(\d+))?',body)]
 ranges={}
 for path,start,end in refs:ranges.setdefault(path,set()).update(range(start,end+1))
 metrics.append({'course':h,'allBodyCjk':cjk(body),'defaultBodyCjk':cjk(default),'codeBlocks':len(codes),'codeLines':sum(len(c.rstrip('\n').splitlines()) for c in codes),'details':len(re.findall(':::deepdive',body)),'linkedSourceRanges':refs,'linkedUniqueLines':sum(len(s) for s in ranges.values()),'linkedUniqueFiles':len(ranges),'coreConceptGroups':{'h09':4,'h10':6,'h11':5,'h12':7}[h],'coreFiles':5,'figures':4,'practices':3 if h=='h09' else 4,'thoughts':7 if h=='h09' else 8 if h=='h10' else 10})
 for size,kind in [(320,'mobile'),(640,'master')]:
  imgs=[]
  for n in range(1,5):
   p=E/'baseline'/h/'visual'/f'{h}-{n:02d}-{320 if kind=="mobile" else "master"}.png'
   im=Image.open(p).convert('RGB');im.thumbnail((size,10000));imgs.append(im)
  sheet=Image.new('RGB',(sum(i.width for i in imgs),max(i.height for i in imgs)+30),'white');d=ImageDraw.Draw(sheet);x=0
  for n,im in enumerate(imgs):sheet.paste(im,(x,30));d.text((x+8,8),f'{h}-{n+1:02d} {kind}',fill='black');x+=im.width
  sheet.save(E/f'{h}-{kind}-contact.png')
(E/'material-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'figure-texts.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'preview-inventory.json').write_text(json.dumps(previews,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'workload.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'inventory':len(inventory),'figures':len(figures),'metrics':metrics},ensure_ascii=False))
