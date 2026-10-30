"""H11原创SVG，640宽、最小28px；PNG由真实浏览器生成并核文字几何。"""
from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,GREEN,AMBER,RED='#DDEDF5','#D9F4E9','#FFF0D7','#FCE5E3'
def text(x,y,s,size=28,bold=False):return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" text-anchor="middle">{escape(s)}</text>'
def save(n,title,intro,cards,foot,desc,connected=False,separate_last=False):
 y=150;parts=[text(320,55,title,32,True),text(320,108,intro)]
 for i,(name,lines,color) in enumerate(cards):
  h=90+42*len(lines)
  parts+=[f'<rect x="28" y="{y}" width="584" height="{h}" rx="18" fill="{color}" stroke="{LINE}" stroke-width="2"/>',text(320,y+44,name,32,True)]
  parts += [text(320,y+91+42*k,s) for k,s in enumerate(lines)]
  if connected and i<len(cards)-1 and not (separate_last and i==len(cards)-2):parts.append(f'<path d="M320 {y+h+4} V{y+h+46}" stroke="{LINE}" stroke-width="3" marker-end="url(#a)"/>')
  y+=h+60
 for s in foot:parts.append(text(320,y,s));y+=42
 fid=f'h11-0{n}'
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{y+28}" viewBox="0 0 640 {y+28}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="a" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs><style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{y+28}" fill="{BG}"/>{''.join(parts)}</svg>'''
 (R/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8',newline='\n')
save(1,'模型请求里，不只有一段Prompt','卡片并列表示来源与去向，不是时序',[
 ('Section + Variable',['插件登记段；组装求文本与变量值','renderPrompt → 系统指令文本','按需system/message → messages'],BLUE),
 ('Runtime Context',['环境服务贡献当前事实','刷新 → renderContextSections','带来源user/message → messages'],GREEN),
 ('Tool Schema',['Tools可见集合 → 执行器描述','PromptAssembly.tools保持独立','request/header按需记录 → tools'],AMBER),
 ('用户任务 + 先前交互',['已接纳输入、助手、工具结果','Session.deriveMessages()','与有效系统节点共同形成历史'],BLUE),
 ('公共模型请求',['messages：派生并冻结的消息','tools：本次工具声明','没有单独system字段包办指令'],GREEN),
],['变量表不是一条独立消息','Session接纳不等于磁盘flush','供应商协议转换留H12'],
 '五类材料按不同路径到达公共请求；系统文本由系统消息承载，运行事实由带来源用户快照承载，Schema为独立tools字段。')
save(2,'变量求值、段排序、文本渲染','本例无展示改序；省略内置空Persona段',[
 ('登记：加载顺序不决定文本顺序',['zeta(20) → Alpha(20) → first(-10)','另有empty(30)，文本为空'],BLUE),
 ('assemble先求变量值',['variables.tone = 简洁','外部随后改成详细，旧值仍保留'],AMBER),
 ('规范化段顺序，再求段文本',['first → Alpha → zeta → empty','先order；同order按名称代码单元','Alpha：A：用{{tone}}语言回答'],GREEN),
 ('renderPrompt：完成插值与连接',['你是代码助手','A：用简洁语言回答','Z：补充说明','删除空字符串段；段间用空行'],GREEN),
 ('独立分支：另一轮有complete',['组装返回前恢复唯一complete段','多个有效complete → 组装失败','仍有变量/工具求值与Waterfall'],AMBER),
],['未知或无值引用：明确失败','interpolate=false：字面文本保留'],
 '实际A示例展示先变量求值后规范化段、组装保留占位符与render输出；complete卡是另一次组装的独立分支，不与前面的render相连。',True,True)
save(3,'同一服务，不同Agent视图','以下是并列视图；不是三个执行阶段',[
 ('全局默认',['Persona：全局助手 {{language}}','language = 默认语言','共同指令 + read、audit工具'],BLUE),
 ('Agent A：同名覆盖 + 工具限制',['Persona：助手A {{language}}','language = 中文；audit被限制','结果：助手A 中文；只见read'],GREEN),
 ('Agent B：自己的同名覆盖',['Persona：Assistant B {{language}}','language = English','结果：B English；见read、audit'],GREEN),
 ('撤销A的两项覆盖',['A下一次组装回到全局默认','B与全局登记未被改写','不是直接修改所有Agent配置'],AMBER),
 ('区分两种工具层次',['匿名Tool Provider：叠加贡献','Tools定义/限制：计算可见集合','展示Waterfall不取得工具所有权'],BLUE),
],['read/audit是本课固定工具名的简写','Scope不是权限或操作系统沙箱'],
 '全局与A/B作用域分别形成模型输入；段变量同名覆盖，A工具差异来自真实Tools限制；匿名Provider本身叠加。')
save(4,'从组装，到这次真实公共请求','按箭头向下读；系统与Context分开render',[
 ('候选Step：工具集合与组装',['捕获模型选择 → tools.resolve','带Agent/scope/toolSet → assemble'],BLUE),
 ('agent/pre-step接纳判断',['默认路径渲染Context候选','尚未step/start；可拒绝或失败'],AMBER),
 ('正式step/start → renderPrompt',['先取得本Step系统文本','此处插值失败：1Step，零请求'],BLUE),
 ('prepareRequest → prepareCall',['绑定本次路线与有效能力','准备中取消：不接纳本次消息'],AMBER),
 ('刷新并渲染动态事实',['refreshContext → renderContextSections','不重做段/变量/工具/Waterfall'],GREEN),
 ('协调并提交system/message',['不变可沿用；能力决定更新形态','完整文本为空要清除旧有效指令'],BLUE),
 ('接纳用户输入与运行快照',['普通任务与runtime-context分来源','首次接纳避免重试重复用户任务'],GREEN),
 ('派生并冻结 → 交给模型边界',['Session.deriveMessages → messages','工具声明独立放在tools','请求没有单独system字段'],BLUE),
],['图省略流式与工具执行；留后续课','只有retry决策才回请求准备','重试不重跑assemble与pre-step'],
 '实际Loop先assemble、pre-step、step/start、renderPrompt，再prepareCall、refreshContext、渲染动态快照、提交系统和用户消息、derive并冻结公共请求。',True)
figures=[dict(id=f'h11-0{i}',source=f'figures/source/h11-0{i}.svg',image=f'figures/rendered/h11-0{i}.png',rendererPath=f'/course-media/harness-v2/h11/h11-0{i}.png',commit='f3803c96974ad4a94195fb97e5c637e9c2a3afe3',purpose=p,provenance='课程原创SVG；保留既定配色/中文字体/纵向分段；不覆盖旧课图片') for i,p in [(1,'模型输入来源与去向'),(2,'注册排序变量求值与渲染'),(3,'全局与Agent覆盖及工具区别'),(4,'组装到请求实际时序')]]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print('Four original H11 SVG sources written')
