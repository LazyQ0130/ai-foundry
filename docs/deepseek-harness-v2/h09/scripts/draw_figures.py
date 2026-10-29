"""H09原创SVG；沿用640宽、28px以上文字、中文字体与既定配色。"""
from pathlib import Path
from html import escape
import json
ROOT=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,TEAL,AMBER,RED='#DDEDF5','#D9F4E9','#FFF0D7','#FCE5E3'
def text(x,y,s,size=28,weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{escape(s)}</text>'
def box(y,title,lines=(),fill=BLUE,h=150,x=28,w=584):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'+text(x+w/2,y+44,title,32,700)+''.join(text(x+w/2,y+88+38*i,s) for i,s in enumerate(lines))
def arrow(y1,y2,label=''):
 return f'<path d="M320 {y1} V{y2}" fill="none" stroke="{LINE}" stroke-width="3" marker-end="url(#arrow)"/>'+(text(475,(y1+y2)/2+8,label) if label else '')
def save(n,title,height,p,desc):
 fid=f'h09-0{n}'
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs><style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{height}" fill="{BG}"/>{text(320,55,title,32,700)}{''.join(p)}</svg>'''
 (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8')

p=[text(320,108,'公开入口：调用方 ctx.agents'),
 box(145,'Registry：实时登记与委托',['create / resume 携带 ownerCtx'],BLUE,h=135),arrow(285,335,'委托'),
 box(350,'Factory：准备具体实例',['默认 AgentLoop 提供实现','Session + Agent + Scope'],TEAL,h=175),arrow(530,580,'创建成功'),
 box(595,'AgentHandle',['agent：公开运行接口','dispose：该实例的释放入口'],BLUE,h=175),
 box(825,'另一条入口：只查询',['get / list / roots → 裸 Agent','查询不会取得 Handle.dispose'],BLUE,h=175),
 box(1055,'内部：共同生命周期收尾',['Handle / 调用方卸载 / 工厂卸载','汇到同一 teardown 等待边界'],AMBER,h=175),
 text(320,1295,'API能力纪律，不是插件安全沙箱'),text(320,1340,'箭头是创建链；查询卡是独立支路')]
save(1,'创建、查询与释放能力',1395,p,'Registry委托Factory创建返回Handle；查询独立返回Agent；默认loop内部把三个释放入口汇合。')

p=[text(320,108,'默认工厂内部：自上而下表示先后')]
steps=[('① Session准备 + 可选写句柄',['create：新建；resume：读取重建'],BLUE,140),
 ('② 所有权台账 → Agent与Scope',['先有清理联系，再取得作用域'],AMBER,140),
 ('③ Session入Store并通知',['session/created：同步完成后可写'],TEAL,140),
 ('④ setup等待 → 可选同步commit',['Agent尚未入Registry','作用域贡献按注册API立即生效'],AMBER,180),
 ('⑤ Agent进入Registry',['显式记录 parentAgent'],TEAL,140),
 ('⑥ agent/created 串行等待',['此前setup已完成；待办仍等待'],BLUE,140),
 ('⑦ ready → 退出维护活动',['放行已排队唤醒；创建成功返回','不保证调用方先于首轮工作执行'],AMBER,180)]
y=150
for i,(title,lines,fill,h) in enumerate(steps):
 p.append(box(y,title,lines,fill,h=h))
 if i<len(steps)-1:p.append(arrow(y+h+5,y+h+45))
 y+=h+65
p += [text(320,y+15,'初始化内失败：按已取得资源转图四')]
save(2,'Agent创建与发布时序',y+80,p,'Session先登记并同步通知，setup及commit后Agent登记，再等serial通知；最后退出维护并返回，不能把get当准备完成。')

p=[text(320,108,'同一个新Agent，可以有五种不同关系')]
cards=[('调用方 Context / Fiber：P',['create所绑定的运行归属','P卸载会推动实例收尾'],BLUE),
 ('Handle持有者：面板M',['M保存释放能力，可以主动关闭','转交引用不解除P的结构责任'],TEAL),
 ('运行时父级 parentAgent：A',['显式进入 entry.owner','isOwnedBy比较确切Agent对象'],BLUE),
 ('历史父级 parentSession：X',['持久会话元数据','不会自动变成当前运行时父级'],TEAL),
 ('当前发起方：A或没有',['进程本地因果归因','不是授权，也不是存活证明'],BLUE)]
for i,(title,lines,fill) in enumerate(cards):p.append(box(150+i*225,title,lines,fill,h=185))
p += [box(1310,'另外还有工厂的结构责任',['提供方退出，也要停止并等待实例'],AMBER,h=140),
 text(320,1510,'卡片间没有默认级联销毁箭头'),text(320,1555,'运行时父级也不自动绑定Scope父链')]
save(3,'父级、持有与资源归属',1610,p,'五个身份分别取证；显式parentAgent、历史谱系、调用方和归因不相互推导，工厂也有生命周期责任。')

p=[box(135,'正常关闭',['Handle.dispose'],BLUE,h=145,x=28,w=280),box(135,'初始化内失败',['setup / 通知 / 取消'],RED,h=145,x=332,w=280),
 '<path d="M168 285 V320 H472 V285 M320 320 V365" fill="none" stroke="'+LINE+'" stroke-width="3" marker-end="url(#arrow)"/>',
 box(380,'共同的内部teardown',['若发布通知在途，先等其收束','cancel(disposed) → whenIdle'],AMBER,h=185),arrow(570,615),
 box(630,'撤销Scope注册',['等待作用域退出'],TEAL,h=140),arrow(775,820),
 box(835,'关闭可选Session写句柄',['等待该写通道close'],TEAL,h=140),arrow(980,1025),
 box(1040,'移除Agent → agent/disposed',['此时Session仍暂时在Store'],BLUE,h=140),arrow(1185,1230),
 box(1245,'移除Session → session/disposed',['退出追踪；不等于删除持久历史'],BLUE,h=140),
 box(1440,'失败只配对已开始的创建通知',['setup失败：仅Session退出边','Agent通知失败：两种退出边'],AMBER,h=185),
 text(320,1690,'各等待段失败仍尝试后续清理'),text(320,1735,'正常释放报告收集错误；初始化保留原错')]
save(4,'销毁与失败补偿流程',1790,p,'正常关闭和失败共用teardown；先等发布与工作，Scope、写句柄、Agent、Session依序清理，通知按已开始的创建边配对。')

figures=[{'id':f'h09-0{i}','source':f'figures/source/h09-0{i}.svg','image':f'figures/rendered/h09-0{i}.png',
 'rendererPath':f'/course-media/harness-v2/h09/h09-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',
 'purpose':p,'provenance':'课程原创SVG；既有配色/中文字体/纵向结构；不是官方截图'}
 for i,p in [(1,'创建查询释放能力'),(2,'Session/setup/Agent发布先后'),(3,'五种身份和共同结构责任'),(4,'正常退出和失败配对清理')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Four H09 SVG sources generated')
