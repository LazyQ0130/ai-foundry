"""H06 原创SVG生成器，沿用模块一中文字体与配色；真实浏览器导出PNG。"""
from pathlib import Path
from html import escape
import json
ROOT=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8';BLUE,TEAL,AMBER='#DDEDF5','#D9F4E9','#FFF0D7'
for folder in ['figures/source','figures/rendered','figures/qa','evidence']:(ROOT/folder).mkdir(parents=True,exist_ok=True)
def text(x,y,s,size=28,weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{escape(s)}</text>'
def box(x,y,w,h,title,lines=(),fill=BLUE,size=32):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'+text(x+w/2,y+43,title,size,700)+''.join(text(x+w/2,y+85+38*i,s) for i,s in enumerate(lines))
def arrow(points,dashed=False):
 return f'<polyline points="{points}" fill="none" stroke="{LINE}" stroke-width="3"'+(' stroke-dasharray="8 6"' if dashed else '')+' marker-end="url(#arrow)"/>'
def save(fid,title,height,p,desc):
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs><style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{height}" fill="{BG}"/>{text(320,55,title,32,700)}{''.join(p)}</svg>'''
 (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8')

p=[text(320,110,'A｜直接请求一项明确能力',30,700),box(36,150,568,125,'业务消费者',['调用工具服务的方法']),arrow('320,275 320,356'),text(450,325,'请求'),box(36,375,568,130,'工具 Service',['按接口完成操作、返回结果'],TEAL),arrow('604,440 624,440 624,215 604,215',True),text(320,565,'B｜服务内部也可开放参与点',30,700),box(36,605,568,130,'工具服务中的扩展位置',['发布事件名、参数与结果约定']),arrow('320,735 320,811'),box(36,830,568,170,'Cordis 事件分发器',['按模式选择执行与等待规则','将适用监听者接入调用'],TEAL)]
for x,title,sub in [(24,'日志插件','观察记录'),(232,'策略插件','检查决定'),(440,'统计插件','前后计时')]:
 p.append(arrow(f'320,1000 320,1045 {x+88},1045 {x+88},1100'))
 p.append(box(x,1120,176,140,title,[sub],BLUE,30))
p += [text(320,1320,'分支表示参与关系，不保证全部执行'),text(320,1362,'事件也可返回结果；两种方式可组合'),text(320,1404,'实线 = 调用/参与；虚线 = 结果返回'),text(320,1446,'本机教学图，不表示进程或消息队列')]
save('h06-01','Service 调用与事件协作',1490,p,'直接服务调用与可扩展事件协作对照；服务方法内部可以分发事件，分支表示参与关系而非所有模式都执行全部监听器。')

p=[text(320,105,'先问等待什么，再问怎样返回')]
cards=[
 ('emit｜同步调用，不收返回值',['启动：A → B（各自同步前缀）','等待：不等回调返回的 Promise','结果：undefined，不按返回值短路','同步 throw 仍可能中断后续'],BLUE),
 ('parallel｜都开始，等全部',['完成顺序可以 B → A','本版：allSettled 等全部结束','成功空结果；失败 AggregateError','不自动取消其他监听器'],TEAL),
 ('serial｜逐个等待，可停止',['A 完成才开始 B','仅 null / false / undefined 继续','0、空字符串等也会停止','返回首个停止值；全无则空'],BLUE),
 ('bail｜同步判断，可停止',['与 serial 使用同一停止判据','当场判断，不 await','Promise 对象本身会停止','不按将来的兑现值继续'],TEAL),
 ('waterfall｜进入与返回',['进入：A → B → 默认主体','返回：主体 → B → A','next 委托；不调用则跳过下游','取最外层返回；不自动 await'],AMBER),
]
for i,(title,lines,fill) in enumerate(cards):p.append(box(24,145+i*295,592,260,title,lines,fill,30))
p += [text(320,1670,'顺序以选中监听器、无 prepend 为前提'),text(320,1712,'错误传播见正文，不能只读模式名字')]
save('h06-02','五种模式：等待、结果与停止',1760,p,'五张纵向规则卡比较调用顺序、等待、返回与停止，强调三个继续值和Waterfall去程回程。')

p=[text(320,105,'实线向右：进入；虚线向左：返回'),text(320,155,'正常：主体 2，B × 10，A + 1',30,700)]
actors=[(80,'发布者'),(235,'A 外层'),(400,'B 内层'),(565,'主体')]
for x,title in actors:
 p.append(text(x,215,title,28,700));p.append(f'<line x1="{x}" y1="235" x2="{x}" y2="805" stroke="#9FBCC4" stroke-width="2" stroke-dasharray="6 7"/>')
for x1,x2,y,label,dashed in [(80,235,280,'调用',False),(235,400,375,'next()',False),(400,565,470,'next()',False),(565,400,565,'2',True),(400,235,660,'20',True),(235,80,755,'21',True)]:
 p += [arrow(f'{x1},{y} {x2},{y}',dashed),text((x1+x2)/2,y-17,label)]
p += [text(320,865,'B 得到 2 后返回 20；A 再返回 21'),text(320,940,'短路：B 直接返回拒绝',30,700)]
for x,title in actors:
 p.append(text(x,1005,title,28,700));p.append(f'<line x1="{x}" y1="1025" x2="{x}" y2="1465" stroke="#9FBCC4" stroke-width="2" stroke-dasharray="6 7"/>')
p += ['<rect x="500" y="1060" width="130" height="385" rx="14" fill="#E4ECEF"/>',text(565,1220,'主体'),text(565,1265,'未进入')]
for x1,x2,y,label,dashed in [(80,235,1090,'调用',False),(235,400,1185,'next()',False),(400,235,1280,'拒绝',True),(235,80,1390,'包装拒绝',True)]:
 p += [arrow(f'{x1},{y} {x2},{y}',dashed),text((x1+x2)/2,y-17,label)]
p += [text(320,1520,'B 不 next：尚未进入的主体被跳过'),text(320,1562,'A 已进入：仍可处理拒绝再返回'),text(320,1604,'短路不自动绕过所有外层'),text(320,1646,'教学精选时序；省略异步和工具内部')]
save('h06-03','Waterfall：必须画出回程',1690,p,'上半正常A进入B和主体，主体2返回B变20再返回A变21；下半B不调用next，主体未执行，但A仍接到拒绝并处理后返回发布者。')

figures=[{'id':f'h06-0{i}','source':f'figures/source/h06-0{i}.svg','image':f'figures/rendered/h06-0{i}.png','rendererPath':f'/course-media/harness-v2/h06/h06-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3','kind':kind,'purpose':purpose,'provenance':'原创矢量代码，无外部图片/字体文件；教学精选图，非完整官方实现'} for i,kind,purpose in [(1,'comparison','明确服务调用与事件协作可组合'),(2,'comparison','五种模式的等待/返回/停止'),(3,'sequence','Waterfall进入、回程、短路保留外层')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print('Three H06 SVG sources generated')
