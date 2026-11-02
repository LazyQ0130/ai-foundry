from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[1];Q=R/'figures/qa'
for h in range(13,17):
 for n in range(1,5):
  key=f'h{h}-{n:02d}'
  a=Image.open(Q/(key+'-regenerated.png')).convert('RGB');a=a.resize((700,round(a.height*700/a.width)))
  b=Image.open(Q/(key+'-320.png')).convert('RGB')
  canvas=Image.new('RGB',(1044,max(a.height,b.height)+40),'#f1f5f9');d=ImageDraw.Draw(canvas);d.text((8,8),key+' | original at 700px',fill='black');d.text((720,8),'actual 320px lesson',fill='black');canvas.paste(a,(8,32));canvas.paste(b,(716,32));canvas.save(Q/(key+'-review-pair.png'))
print('16 original/mobile review pairs')
