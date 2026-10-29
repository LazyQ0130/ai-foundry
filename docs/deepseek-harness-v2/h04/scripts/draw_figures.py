"""H04 原创可复现 SVG；实际浏览器在 QA 脚本中导出二倍 PNG。"""
from pathlib import Path
from html import escape
import json
ROOT=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,TEAL,AMBER='#DDEDF5','#D9F4E9','#FFF0D7'
def text(x,y,s,size=28,weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{escape(s)}</text>'
def box(x,y,w,h,title,lines=(),fill=BLUE):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'+text(x+w/2,y+43,title,32,700)+''.join(text(x+w/2,y+85+38*i,s) for i,s in enumerate(lines))
def arrow(points,dashed=False):
 return f'<polyline points="{points}" fill="none" stroke="{LINE}" stroke-width="3"'+(' stroke-dasharray="8 6"' if dashed else '')+' marker-end="url(#arrow)"/>'
def save(fid,title,height,p,desc):
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs>
<style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{height}" fill="{BG}"/>{text(320,55,title,32,700)}{''.join(p)}</svg>'''
 (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8')
for folder in ['figures/source','figures/rendered','figures/qa','evidence']:(ROOT/folder).mkdir(parents=True,exist_ok=True)

p=[text(320,105,'按交互与生命周期选择，不复制引擎'),box(36,145,568,130,'dsh 启动器',['选择具名 Profile 并准备应用']),arrow('320,275 320,319')]
p.append(arrow('604,210 624,210 624,1500 604,1500',True))
p += ['<rect x="24" y="335" width="592" height="1080" rx="24" fill="white" stroke="#187A91" stroke-width="3"/>',text(320,385,'四种以 base 为基础的模板',32,700),box(44,415,552,160,'base：共享的运行能力',['Agent Loop · LLM · Tools','Session · 策略等配套服务'],TEAL)]
for i,(title,lines) in enumerate([
 ('web = base + web-app',['浏览器界面与 Host 服务','持续服务请求']),('headless = base + headless',['命令行任务与结果输出','一次性任务，完成后退出']),('sdk = base + sdk-app',['SDK JSON-RPC stdio','服务客户端连接']),('acp = base + acp-app',['ACP JSON-RPC stdio','服务编辑器或自动化客户端'])]):p.append(box(44,605+i*195,552,170,title,lines))
p += [box(36,1455,568,270,'sdk-minimal：独立完整树',['仅 dsh-sdk-minimal，不叠 base','显式复用部分相同核心包','同一 SDK stdio 应用层','默认 danger-full-access，非低权限'],AMBER),text(320,1778,'容器 = 模板组成；不是进程或安全边界'),text(320,1820,'虚线：也可选择独立 SDK 树'),text(320,1862,'已有 Profile 可被用户修改')]
save('h04-01','一个 Harness，五种应用组合',1900,p,'四种 Profile 以 base 加应用层组合，sdk-minimal 独立提供配置树而复用部分核心能力；SDK 与 ACP 使用不同 stdio 协议，生命周期按场景区别。')

p=[text(320,105,'主线：固定版本，正常 profile 调用')]
nodes=[
 ('① 解析 dsh 参数',['parseDshArgs → invocation','选 Profile；交接剩余应用参数'],BLUE,160),
 ('分支：配置 dump',['单独组合并打印，不挂载应用','不解析应用 flag，不求值表达式','仍可能初始化 Profile 与根文件'],AMBER,198),
 ('② 加载启动环境',['先确定 Home，再读两份 .env','先校验来源，再接受并保存快照'],TEAL,160),
 ('③ 安装出站代理策略',['runProfile 使用启动环境快照','发生在 Profile 组合之前'],BLUE,160),
 ('④ 准备 Profile',['检查名称、清单；必要时初始化','重写空根 cordis.yml','安装锚点优先解析组合包'],BLUE,198),
 ('⑤ 准备运行组合',['建立包解析与读取 CLI overlay','Bundle → Profile → Home → CLI','还有专门的启动开关处理'],BLUE,198),
 ('⑥ boot 的宿主准备',['创建 Context 与 Loader','提供环境、包解析、参数快照','在配置树条目挂载之前'],TEAL,198),
 ('⑦ 挂载、等待、审查',['根 include 挂载配置条目','等待树结算并检查激活状态','required 失败与 optional 警告分开'],BLUE,198),
 ('⑧ 提交应用就绪信号',['确认未关闭且树仍活跃','Web / 一次性任务 / stdio 应用','后续由应用决定何时处理请求'],TEAL,198),
]
y=145
for i,(title,lines,fill,h) in enumerate(nodes):
 p.append(box(36,y,568,h,title,lines,fill))
 if i<len(nodes)-1:
  # dump 是解释分支，主线从解析直接到环境加载；虚线跳过分支框。
  if i==0:
   p.append(arrow(f'320,{y+h} 320,{y+h+40}'))
   p.append(arrow(f'604,{y+80} 624,{y+80} 624,{y+h+46+198+46+50} 604,{y+h+46+198+46+50}',True))
  elif i!=1:p.append(arrow(f'320,{y+h} 320,{y+h+40}'))
 y+=h+46
p += [text(320,y+5,'① 的虚线是正常启动分支'),text(320,y+49,'dump 在单独路径结束，不向下启动'),text(320,y+93,'图为主要控制流；省略关闭与重载细节')]
save('h04-02','从 dsh 命令到 Agent 应用',y+130,p,'参数解析区分启动和 dump。正常分支先加载环境、安装代理，再准备 Profile/运行组合，经宿主准备和配置树挂载审查后提交应用就绪；dump 不向下启动。')

p=[text(320,105,'先分开两种数据，再判断哪一项生效')]
p.append(box(28,145,584,205,'A｜普通启动环境',['先由进程确定 Harness Home','调用目录 .env 与 Home .env','两份文件先校验，禁止来源即拒绝'],AMBER))
y=390
for title,lines in [('进程继承环境',['普通变量的第一选择']),('调用目录 .env',['第一层缺少该名字时查这里']),('Home .env',['再缺少时查这里；代理有来源例外'])]:
 p.append(box(48,y,544,120,title,lines,TEAL));p.append(arrow(f'320,{y+120} 320,{y+157}'));y+=170
p += [text(320,919,'高 → 低查找；不是后读覆盖前读',28,700),text(320,965,'快照不随 chdir、工作区选择或 HMR 重读')]
p.append(box(28,1010,584,145,'B｜Profile 配置树',['从空根开始，按顺序应用修改'],AMBER))
for i,(title,lines) in enumerate([
 ('Bundle patch 列表',['按 manifest 的 bundles 顺序']),('Profile 用户 patch',['profiles/name/cordis.patch.yml']),('Home 用户 patch',['Home/cordis.patch.yml']),('CLI 的 --patch',['按 argv 顺序；内容本次启动固定'])]):
 yy=1195+i*170;p.append(box(48,yy,544,120,title,lines))
 if i<3:p.append(arrow(f'320,{yy+120} 320,{yy+157}'))
p += [text(320,1905,'后层可改同一行；config 整体替换',28,700),text(320,1949,'应用 flag 要靠保留的配置表达式读取'),box(28,1990,584,210,'另看负责方的专门规则',['启动还有遥测关闭补丁等处理','受管凭据：文档 → 继承 → dotenv','dump 不等于全部生效值或自动脱敏'],AMBER),text(320,2254,'Web 配置可重组；环境与 argv 需重启')]
save('h04-03','运行配置：来源与作用',2300,p,'普通环境从继承、项目到Home查找并先检查来源；配置树从空根按Bundle、Profile、Home与CLI顺序应用。受管凭据和启动策略另有负责方，dump不能表示全部运行值。')
figures=[{'id':f'h04-0{i}','source':f'figures/source/h04-0{i}.svg','image':f'figures/rendered/h04-0{i}.png','rendererPath':f'/course-media/harness-v2/h04/h04-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3','kind':kind,'purpose':purpose,'provenance':'原创代码绘图，无官方截图/外部图片/字体文件'} for i,kind,purpose in [(1,'composition','五入口的组成、传输、生命周期与 minimal 例外'),(2,'flow','参数、环境、代理、组合、准备、挂载与就绪；dump 旁支'),(3,'source-map','环境与配置的不同优先级；快照、凭据、dump 边界')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('H04 three SVG generated; PNG export and review still required')
