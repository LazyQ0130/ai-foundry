"""H05 原创矢量教学图。沿用第一模块色彩/字体；PNG 由真实浏览器导出。"""
from pathlib import Path
from html import escape
import json
ROOT=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,TEAL,AMBER='#DDEDF5','#D9F4E9','#FFF0D7'
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

p=[text(320,105,'同一项目助手，两种组织方式'),text(164,160,'紧耦合',32,700),text(476,160,'按服务连接',32,700)]
p+=['<rect x="24" y="185" width="280" height="930" rx="22" fill="white" stroke="#187A91" stroke-width="3"/>',text(164,238,'AgentRuntime',30,700),text(164,281,'业务选择实现')]
p+=[box(338,185,278,135,'业务消费者',['按约定使用能力'],TEAL),text(476,375,'服务约定与提供方',28,700)]
for i,(a,b) in enumerate([('模型调用','模型插件'),('文件操作','文件插件'),('工具登记','工具插件'),('会话记录','会话插件'),('日志记录','日志插件')]):
 y=405+i*138
 p.append(box(40,y,248,115,a,['实现写在类内'],BLUE,30))
 p.append(box(378,y,238,115,b,['可选择实现'],TEAL,30))
 p.append(arrow(f'352,320 352,{y+56} 378,{y+56}'))
p += [box(24,1155,592,160,'变化的影响范围',['左：能力变更需进入同一类','右：接口兼容时，优先改装配与提供方'],AMBER),text(320,1365,'包含框 = 代码职责；线 = 能力依赖'),text(320,1407,'插件化仍需兼容测试，也增加组合成本')]
save('h05-01','换能力，修改应该落在哪里？',1450,p,'左右对比：紧耦合类内含五项能力；插件化消费者通过约定依赖不同提供方。仅表达职责与能力依赖，不是完整官方架构。')

p=[text(320,105,'三个动作：声明、提供、调用'),box(36,145,568,180,'编译期：声明合并',['Context 增加 greeter 的类型','只供检查与补全，不创建服务'],AMBER),text(320,375,'以下才是本次运行的接线',28,700)]
p += [box(36,420,568,170,'提供方插件',['挂载 GreeterService 类','构造器 super(ctx, \'greeter\')'],BLUE),arrow('320,590 320,661'),text(474,635,'注册实例'),box(36,680,568,180,'Context 的服务入口',['greeter → 已提供的能力','服务可用后，依赖者才可启动'],TEAL)]
p += [box(36,1030,568,180,'消费者插件',['inject = [\'greeter\']：声明需要','apply 内通过 ctx.greeter 调用'],BLUE),arrow('320,1030 320,872'),text(466,957,'调用 greet'),arrow('604,1115 624,1115 624,770 604,770',True),text(320,1270,'实线 = 注册或调用；虚线 = 依赖条件'),text(320,1312,'类型信息没有通往注册的箭头'),text(320,1354,'教学简图；省略回收与作用域解析')]
save('h05-02','Context、Service 与 Plugin',1400,p,'编译期声明与运行时分开。提供方登记实例，消费者声明依赖后经上下文调用。实线是注册或调用，虚线是依赖条件。')

p=[text(320,105,'本例：先挂消费者，再挂提供方')]
nodes=[
 ('① 定义模块',['类型声明与类定义先准备好','导入模块不自动挂载服务'],BLUE),
 ('② 挂载消费者',['ctx.plugin(consumer)','宿主读取 inject 与 apply'],BLUE),
 ('③ 缺少 greeter：PENDING',['消费者入口不执行，调用为 0','若一直没有提供方，就停在这里'],AMBER),
 ('④ 挂载提供方',['apply 再挂载服务类','构造器登记 greeter 实例'],BLUE),
 ('⑤ 提供方完成，服务可用',['重新检查所需服务','本例依赖全部满足'],TEAL),
 ('⑥ 消费者执行 apply',['ctx.greeter.greet(\'world\')','输出 Hello, world!'],TEAL),
]
for i,(title,lines,fill) in enumerate(nodes):
 y=145+i*235;p.append(box(36,y,568,180,title,lines,fill))
 if i<len(nodes)-1:p.append(arrow(f'320,{y+180} 320,{y+225}'))
p += [text(320,1570,'纵线 = 本例选定顺序，并非必须先等待'),text(320,1612,'先挂提供方也可；依赖决定启动条件'),text(320,1654,'教学精选流程，未展开 Loader 与卸载')]
save('h05-03','最小插件：从定义到调用',1700,p,'以消费者先挂载为例：模块定义、挂载、依赖缺失时PENDING，提供方完成且服务可用后，消费者才执行入口并调用。一直缺失就不继续。')

figures=[{'id':f'h05-0{i}','source':f'figures/source/h05-0{i}.svg','image':f'figures/rendered/h05-0{i}.png','rendererPath':f'/course-media/harness-v2/h05/h05-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3','kind':kind,'purpose':purpose,'provenance':'原创代码绘图，无外部图片或字体文件；教学简化非完整官方实现'} for i,kind,purpose in [(1,'comparison','区分职责包含、服务依赖与替换影响'),(2,'relationship','类型声明不注册；区分依赖、注册与调用'),(3,'flow','定义与挂载不同；以消费者先挂展示等待与调用')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Three H05 SVG sources generated')
