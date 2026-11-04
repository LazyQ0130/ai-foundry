from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import hashlib,json
HERE=Path(__file__).resolve().parents[1];BASE=HERE.parent
rows=[]
for h in range(17,21):
 course=f'h{h}';out=HERE/'evidence'/course/'visual';figs=json.loads((BASE/course/'evidence/figures.json').read_text(encoding='utf-8'))
 for mode in ['master','320']:
  images=[]
  for f in figs:
   p=out/f['image'] if mode=='master' else out/f'figures/qa/{f["id"]}-320.png'
   im=Image.open(p).convert('RGB');im.thumbnail((640,2200))
   images.append((f['id'],im))
   if mode=='master':
    old=BASE/course/f['image'];rows.append({'id':f['id'],'source':str(BASE/course/f['source']),'sourceSha256':hashlib.sha256((BASE/course/f['source']).read_bytes()).hexdigest(),'originalPngSha256':hashlib.sha256(old.read_bytes()).hexdigest(),'rerenderSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'byteIdentical':old.read_bytes()==p.read_bytes()})
  height=max(i.height for _,i in images)+45
  canvas=Image.new('RGB',(len(images)*660,height),'#e2e8f0');d=ImageDraw.Draw(canvas)
  for n,(label,im) in enumerate(images):d.text((n*660+10,10),label+' '+mode,fill='black');canvas.paste(im,(n*660+10,35))
  canvas.save(HERE/f'evidence/{course}-{mode}-contact.png')
(HERE/'evidence/figure-rerender.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('16 figures; byte-identical rerenders:',sum(x['byteIdentical'] for x in rows))
