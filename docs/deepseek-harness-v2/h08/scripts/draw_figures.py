"""H08 原创矢量图，复用既有640宽纵向视觉规范。"""
from pathlib import Path
from html import escape
import json
ROOT=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8';BLUE,TEAL,AMBER,RED='#DDEDF5','#D9F4E9','#FFF0D7','#FCE5E3'
def text(x,y,s,size=28,weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{escape(s)}</text>'
def box(y,title,lines=(),fill=BLUE,h=150):
 return f'<rect x="28" y="{y}" width="584" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'+text(320,y+44,title,32,700)+''.join(text(320,y+88+38*i,s) for i,s in enumerate(lines))
def arrow(y1,y2):
 return f'<path d="M320 {y1} V{y2}" fill="none" stroke="{LINE}" stroke-width="3" marker-end="url(#arrow)"/>'
def save(n,title,height,p,desc):
 fid=f'h08-0{n}'
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs><style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{height}" fill="{BG}"/>{text(320,55,title,32,700)}{''.join(p)}</svg>'''
 (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf-8')

p=[text(320,108,'模板选择顺序：左项先，右项后')]
for i,(title,line) in enumerate([('web','base → web-app'),('headless','base → headless'),('sdk','base → sdk-app'),('acp','base → acp-app')]):
 p.append(box(150+155*i,title,[line],TEAL,h=125))
p += [box(800,'sdk-minimal：独立完整树',['只有 sdk-minimal Bundle','不叠加 dsh-base'],AMBER,h=175),
       box(1030,'Bundle → Patch → 配置条目',['一份 Bundle 可有多个 Patch 文件','每份清单可贡献多个 Plugin 条目'],BLUE,h=175),arrow(1210,1250),
       box(1270,'Loader → Plugin 的运行',['配置贡献关系，不是进程边界','条目存在仍须检查实际激活'],TEAL,h=175)]
save(1,'Profile 怎样复用不同组合',1500,p,'四种Profile以base为共享第一层，sdk-minimal独立配置；Bundle贡献配置而非一个运行Fiber。')

p=[box(130,'core 插入原始 config',['model: base','temperature: 0.2','retry: { attempts: 2 }'],BLUE,h=225),arrow(360,405),text(320,450,'surface：整 config 替换'),
 box(485,'此刻 config',['model: surface','temperature: 0.4','retry 已消失'],TEAL,h=225),arrow(715,760),text(320,805,'CLI：再次整份替换'),
 box(840,'最终 config',['model: cli','temperature 也已消失'],TEAL,h=185),
 box(1085,'错误预测：深度合并',['model: cli，仍保留 temperature','仍保留 retry —— 不符合本版本'],RED,h=185),
 text(320,1330,'条目外层 id、name 保留'),text(320,1375,'Schema 默认值属于后续加载规则')]
save(2,'Patch 替换的是整个 config',1430,p,'三个阶段展示retry、temperature因完整config替换消失；深合并结果标为错误预测。')

p=[text(320,108,'空根条目列表开始')]
for i,(title,lines) in enumerate([('① 有序 Bundle Patch',['先 Bundle 顺序，再各自文件顺序']),('② Profile 的 Patch',['当前 Profile 用户覆盖']),('③ Home 的 Patch',['共享 Home 用户覆盖']),('④ CLI 的 --patch',['使用启动时已解析的覆盖列表'])]):
 y=155+i*175;p.append(box(y,title,lines,BLUE,h=130));p.append(arrow(y+135,y+167))
p += [box(875,'特例：遥测硬禁用最后追加',['启动开关非空且树有对应条目'],AMBER,h=130),arrow(1010,1050),
 box(1075,'组合后的最终配置树',['仍可能带未求值表达式'],TEAL,h=130),arrow(1210,1250),
 box(1275,'Include / Loader 加载',['导入模块、检查依赖、配置与初始化'],BLUE,h=130),
 box(1460,'运行状态需要另外核对',['ACTIVE / PENDING / FAILED','禁用条目可以保留而不激活'],AMBER,h=175)]
save(3,'从输入文件到运行证据',1690,p,'按四层形成配置，再追加遥测硬禁用特例；Include/Loader加载后才有运行状态证据。')

p=[box(130,'配置文件变化 → 重新组合',['Profile / Home / manifest','有 HMR 才会自动协调'],BLUE,h=175),arrow(310,350),
 box(375,'Entry 更新 → 生命周期处理',['普通 config：同一 Fiber 可重跑','禁用后启用：新建 Fiber','旧资源按所有权清理'],TEAL,h=225),
 box(660,'源码模块变化 → 独立替换路径',['预导入 → 卸载 → 激活替代代码','失败会尝试恢复，恢复也会失败'],BLUE,h=175),
 box(895,'失败必须按阶段看',['解析失败：可保留上次树','应用后失败：新 config 可能保留','FAILED 不保证旧服务恢复'],AMBER,h=225),
 box(1180,'完整进程重启',['重新处理启动环境、参数与应用','无 HMR / 映射变化时可能需要'],BLUE,h=175),
 text(320,1420,'重新加载不自动迁移业务状态'),text(320,1465,'清理资源不等于回滚外部副作用')]
save(4,'变化、清理与重载的边界',1520,p,'配置重组与模块替换是不同路径；解析前失败和应用后失败结果不同，重启再次走完整启动。')

figures=[{'id':f'h08-0{i}','source':f'figures/source/h08-0{i}.svg','image':f'figures/rendered/h08-0{i}.png',
 'rendererPath':f'/course-media/harness-v2/h08/h08-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',
 'purpose':purpose,'provenance':'课程原创SVG，沿用既有字体与配色；教学精选结构，不是官方截图'}
 for i,purpose in [(1,'Profile/Bundle/Plugin角色与minimal例外'),(2,'整个config替换与深合并反例'),(3,'四层输入、特例与运行状态分离'),(4,'重组/模块替换/重启与失败阶段')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Four H08 SVG sources generated')
