"""H07 原创SVG生成器，沿用模块一中文字体与配色；真实浏览器导出PNG。"""
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


p=[text(320,108,'普通非根实例：精选三条路径')]
normal=[('PENDING','等待必需服务'),('LOADING','依赖可用，正在初始化'),('ACTIVE','本次初始化完成'),('UNLOADING','显式释放：等待登记的清理'),('DISPOSED','uid 清空，实例永久移除')]
for i,(name,line) in enumerate(normal):
 y=155+i*172
 p.append(box(36,y,568,128,name,[line],TEAL if i==2 else BLUE,32))
 if i<4:p.append(arrow(f'320,{y+128} 320,{y+163}'))
p += [box(24,1050,592,225,'失败：先清理，再保留错误',['LOADING → UNLOADING → FAILED','apply 或配置校验失败','FAILED 不等于永久移除'],AMBER,30),box(24,1320,592,270,'依赖失效：保留挂载意图',['ACTIVE → UNLOADING → PENDING','服务恢复：PENDING → LOADING','成功后 ACTIVE，仍是同一实例','前提：没有另被显式 dispose'],TEAL,30),text(320,1650,'PENDING / FAILED 也能被显式释放'),text(320,1692,'省略快速变化、重试与根 Fiber 特例')]
save('h07-01','Fiber：状态必须连着原因读',1740,p,'普通插件的正常显式释放、启动失败清理与依赖失效恢复三条精选路径，非完整状态机。')

p=[text(320,108,'获取资源时，就要交出退出方式'),box(36,155,568,140,'日志插件的当前 Fiber',['资源与退出动作归同一所有者'],TEAL)]
for x,title,lines in [(24,'已经自动归属',['ctx.on 登记','返回移除函数']),(336,'需要显式配对',['定时器 / 连接','ctx.effect 包装'])]:
 p += [arrow(f'320,295 320,335 {x+140},335 {x+140},380'),box(x,400,280,180,title,lines,BLUE,30)]
p += [arrow('164,580 164,630 320,630 320,680'),arrow('476,580 476,630 320,630 320,680'),box(36,700,568,165,'插件卸载：启动已登记 Disposer',['逆序启动，异步完成可能交错','等待已登记清理，不等全部 Promise'],TEAL,30),arrow('320,865 320,915'),box(36,940,568,135,'资源按你提供的释放逻辑退出',['清理失败须查日志 / 外部证据'],BLUE,30),box(24,1140,592,220,'反例：原生资源未交出清理入口',['旧定时器继续 tick，连接可能残留','新版本再创建：重复心跳 / 监听','apply 返回不等于资源已退出'],AMBER,30),text(320,1420,'严格顺序：一个 Disposer 内依次 await'),text(320,1462,'撤销 on 不自动取消已开始的回调'),text(320,1504,'教学资源夹具；没有真实外部连接')]
save('h07-02','Effect：资源与退出方式配对',1550,p,'on自动归属与原生定时器/连接显式effect配对，卸载启动清理；未登记清理可能残留。')

p=[text(164,115,'父子所有权',32,700),text(476,115,'必需服务依赖',32,700)]
left=[('父级挂载子级',['父持有子释放登记']),('父级显式释放',['触发子级 dispose']),('子级清理中',['父级等待子级结束']),('父子 DISPOSED',['该实例永久移除']),('另一个兄弟插件',['无此依赖可继续'])]
right=[('提供方服务消失',['Consumer 仍被挂载']),('Consumer 失活',['UNLOADING 清理']),('PENDING 等待',['保留实例 / uid']),('服务恢复后加载',['LOADING → ACTIVE']),('重新登记资源',['同一 Consumer'])]
for col,items,fill in [(24,left,BLUE),(336,right,TEAL)]:
 for i,(title,lines) in enumerate(items):
  y=165+i*230;p.append(box(col,y,280,155,title,lines,fill,28))
  if i<4:
   if col==24 and i==3:
    p += [text(col+140,y+193,'不连所有权边',28)]
   else:p.append(arrow(f'{col+140},{y+155} {col+140},{y+215}'))
p += [text(320,1300,'左：所有权决定结构退出'),text(320,1342,'右：服务可用性决定当前运行'),text(320,1384,'右侧不是 Provider 的孩子'),text(320,1426,'显式 dispose 后不会被依赖恢复唤醒'),text(320,1468,'两种关系可叠加；省略配置组装')]
save('h07-03','父子关系 ≠ 服务依赖关系',1510,p,'左侧父级释放并等待子级清理，另一个无关兄弟可继续；右侧服务消失和恢复驱动同一消费者重新加载，前提是未显式释放消费者。')
figures=[{'id':f'h07-0{i}','source':f'figures/source/h07-0{i}.svg','image':f'figures/rendered/h07-0{i}.png','rendererPath':f'/course-media/harness-v2/h07/h07-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3','kind':kind,'purpose':purpose,'provenance':'原创矢量代码；非完整官方实现，无外部图片/字体文件'} for i,kind,purpose in [(1,'state-paths','六状态的正常/失败/依赖失效精选路径'),(2,'ownership-flow','资源归属、清理与残留反例'),(3,'comparison','父子所有权和服务依赖触发不同')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Three H07 SVG sources generated')
