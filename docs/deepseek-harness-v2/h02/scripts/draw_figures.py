"""H02 原创职责地图、查找路线与分层关系图。只写 H02。"""
from pathlib import Path
from html import escape
import json
ROOT=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,TEAL,AMBER='#DDEDF5','#D9F4E9','#FFF0D7'
def text(x,y,s,size=28,weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{escape(s)}</text>'
def box(x,y,w,h,title,lines=(),fill=BLUE):
 out=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'+text(x+w/2,y+43,title,32,700)
 return out+''.join(text(x+w/2,y+85+38*i,s) for i,s in enumerate(lines))
def arrow(points,dashed=False):
 return f'<polyline points="{points}" fill="none" stroke="{LINE}" stroke-width="3"'+(' stroke-dasharray="8 6"' if dashed else '')+' marker-end="url(#arrow)"/>'
def save(fid,title,height,parts,desc):
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs>
<style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style>
<rect width="640" height="{height}" fill="{BG}"/>{text(320,55,title,32,700)}
{''.join(parts)}</svg>'''
 (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf-8')

p=[text(320,101,'按问题选区，不按文件夹顺序通读'),
 box(36,135,568,170,'根清单：先确认成员与工具链',['package.json','pnpm-workspace.yaml']),
 box(36,345,568,170,'apps：入口与载体',['cli 命令 · web 浏览器入口','desktop / desktop-host 桌面载体']),
 '<rect x="24" y="555" width="592" height="805" rx="24" fill="white" stroke="#187A91" stroke-width="3"/>',
 text(320,601,'packages：选读分组',32,700),
 box(48,625,544,150,'core / 主干包',['agent、agent-loop、tools、session'],TEAL),
 box(48,805,544,150,'能力组 / 契约、实现与工具',['fs、shell、llm、mcp、session …']),
 box(48,985,544,150,'组合与启动',['bundle / 配置组合层','boot / 启动与装配辅助'],AMBER),
 box(48,1165,544,150,'util / test-support',['共享基础 / 测试支持']),
 box(36,1400,568,170,'仓库级基础与工程验证',['vendor/：依赖源码','scripts/：构建与检查脚本']),
 box(36,1610,568,170,'文档：先全局，再子系统与包',['docs/architecture · docs/subsystems','各分组与各包的 README']),
 text(320,1830,'core 是分组；core/tools 才是包',28,700),
 text(320,1874,'apps 中也有独立索引生成器'),
 text(320,1918,'容器表示源码归属，不表示部署边界')]
save('h02-01','仓库地图：从职责找到阅读区域',1950,p,'根清单、apps、packages 两级能力、组合与公共基础、文档和测试构成问题导向地图。')

p=[text(320,101,'例：原生模式执行一个工具调用'),text(320,143,'虚线 = 下一处查找，不是函数调用')]
nodes=[('用户功能与入口',['dsh 命令 → runCli','apps/cli/src/bin.ts'],BLUE),
 ('组合：确认原生实现参与',['headless 模板 → base patch','packages/bundle/base/'],AMBER),
 ('服务：谁接收执行请求？',['ToolsService.execute','packages/core/tools/src/index.ts'],TEAL),
 ('接口：先读输入与输出',['ToolExecutor','packages/core/tools/src/executor.ts'],BLUE),
 ('实现：原生执行器包',['packages/core/tool-executor-native/','apply() / NativeToolExecutor.execute()'],TEAL),
 ('测试：全仓搜索具体符号',['packages/core/agent-loop/tests/','tool-executors.spec.ts'],BLUE)]
for i,(title,lines,fill) in enumerate(nodes):
 y=184+i*260;p.append(box(36,y,568,190,title,lines,fill))
 if i<5:p.append(arrow(f'320,{y+190} 320,{y+251}',True))
p += [text(320,1745,'先核身份，再核实现，最后核断言',28,700),text(320,1789,'已安装 ≠ 已挂载；读到测试 ≠ 已运行')]
save('h02-02','从功能反向找到接口、实现与测试',1824,p,'从真实原生工具能力出发，经应用入口、组合、服务、契约、提供方，找到跨包测试。')

p=[text(320,101,'先说明节点和箭头分别表示什么')]
panels=[('源码依赖','原生执行器包','工具服务包','类型 / 值导入','导入方 → 被导入模块',BLUE),
 ('构建引用','执行器项目','tools 项目','项目引用','当前项目 → 被引用项目',AMBER),
 ('运行时调用','工具服务对象','原生执行器对象','调用 execute','前提：已选中原生执行器',TEAL)]
for i,(title,left,right,action,note,fill) in enumerate(panels):
 y=150+i*300
 p += [f'<rect x="24" y="{y}" width="592" height="264" rx="20" fill="white" stroke="{LINE}" stroke-width="2"/>',
       text(320,y+44,title,32,700),box(42,y+85,260,82,left,[],fill),box(338,y+85,260,82,right,[],fill),
       arrow(f'302,{y+126} 338,{y+126}',i==1),text(320,y+208,action,28,700),text(320,y+246,note)]
p += [text(320,1105,'运行期还会登记对象、调用共享函数'),text(320,1150,'反向调用 ≠ 包一定反向 import',28,700),text(320,1194,'一对包可以同时具有多种关系')]
save('h02-03','三种关系，不共用一个依赖箭头',1230,p,'静态导入和构建引用指向工具包或项目，运行时工具服务调用当前选中的原生执行器。')

figures=[
 {'id':'h02-01','kind':'职责地图','purpose':'把入口、主干、能力、组合、公共基础与文档测试放到不同阅读区域','claims':['S01','S02','S03','S04','S05']},
 {'id':'h02-02','kind':'功能反查路线','purpose':'训练场景→入口→配置→契约与实现→跨包测试的证据跳转','claims':['S06','S07','S08','S09','S10','S11']},
 {'id':'h02-03','kind':'分层关系对照','purpose':'同一功能区分 import、Project Reference、运行时分派方向','claims':['S09','S10','S12']},
]
for f in figures:
 f.update(source=f"figures/source/{f['id']}.svg",image=f"figures/rendered/{f['id']}.png",rendererPath=f"/course-media/harness-v2/h02/{f['id']}.png",origin='AI Foundry 原创教学重绘；事实锁定 f3803c9；不复制官方图')
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('H02: 3 SVG sources and figure manifest generated')
