"""H03 原创教学图。SVG 是可复现源；PNG 由实际浏览器导出。"""
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
<style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style>
<rect width="640" height="{height}" fill="{BG}"/>{text(320,55,title,32,700)}{''.join(p)}</svg>'''
 (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8')
for folder in ['figures/source','figures/rendered','figures/qa','evidence']:(ROOT/folder).mkdir(parents=True,exist_ok=True)

p=[text(320,105,'主线：输入接纳，原生工具，配置稳定')]
nodes=[
 ('输入接口与队列',['followup → Inbox 入队','事实：agent/inbox/spliced'],TEAL,160),
 ('① 打开轮次',['事实：turn/start','先开 Turn，再领取与接纳'],TEAL,160),
 ('② 准备候选 Step',['领取 Inbox → 选模型','解析工具集合 → 组装提示材料'],BLUE,160),
 ('决定是否接纳',['agent/pre-step：enter 向下','reject → turn/end：blocked','首次拒绝：零 Step、零请求'],AMBER,198),
 ('③ 打开 Step',['事实：step/start'],TEAL,122),
 ('④ 先准备模型调用',['prepareRequest → llm.prepareCall','绑定适配器与有效配置'],BLUE,160),
 ('⑤ 提交并构造请求',['system / user 消息按需接纳','request/header、context 按需记录','deriveMessages → 冻结请求'],TEAL,198),
 ('⑥ 请求与接收模型流',['适配器 stream → 汇集响应块','实时 start / chunk：尚非最终记录'],BLUE,160),
 ('⑦ 结算助手响应',['先追加 assistant/message','再发 committed end（含 seq）'],TEAL,160),
 ('⑧ 有工具提议时',['tools.execute → tool/call','检查 → 执行允许的操作','tool/result → 后续请求的历史'],BLUE,198),
 ('⑨ 关闭当前 Step',['事实：step/end','没有工具时也经过这里'],TEAL,160),
 ('⑩ 继续，还是结束？',['工具反馈或新输入：回到②','自然结束：检查停止与队列','确认可停 → turn/end'],AMBER,198),
]
y=145;positions=[]
for i,(title,lines,fill,h) in enumerate(nodes):
 positions.append((y,h));p.append(box(36,y,510,h,title,lines,fill))
 if i<len(nodes)-1:p.append(arrow(f'291,{y+h} 291,{y+h+42}'))
 y+=h+46
# 返回的是同一 Turn 的候选 Step 准备，绝不回到 turn/start。
p.append(arrow(f'546,{positions[-1][0]+75} 608,{positions[-1][0]+75} 608,{positions[2][0]+65} 546,{positions[2][0]+65}',True))
p.extend([box(36,y+4,568,198,'旁路：实时观察 ≠ 会话事实',['agent/status · assistant-stream','chunk 不逐条写成会话消息','Session 提交 ≠ 磁盘 flush'],AMBER),text(320,y+250,'蓝：处理  绿：事实  琥珀：边界',28,700),text(320,y+294,'虚线：继续本 Turn 的下一 Step')])
save('h03-01','一次请求：处理、记录与反馈',y+330,p,'输入入队后打开 Turn，接纳前准备，进入 Step 后准备模型并提交请求材料，模型流结算后执行工具，再在同一 Turn 内继续或结束；实时通知与磁盘持久化另有边界。')

p=[text(320,105,'包含关系图；不是线程或部署图')]
p.append(box(28,145,584,365,'Turn A：输入被拒绝',[],AMBER))
p += [text(320,235,'turn/start → 领取与接纳检查'),box(60,265,520,120,'reject：不打开 Step',[],AMBER),text(320,430,'turn/end：blocked'),text(320,478,'零 Step · 零模型请求')]
p.append(box(28,550,584,420,'Turn B：直接回答',[],TEAL))
p += [text(320,638,'turn/start → 接纳'),box(60,666,520,188,'Step 1',['模型请求 → 回答结算','无 Tool Call 也有 Step']),text(320,915,'step/end → 停止检查 → turn/end')]
p.append(box(28,1010,584,775,'Turn C：工具反馈后回答',[],TEAL))
p += [text(320,1098,'turn/start → 接纳'),box(60,1125,520,228,'Step 1',['模型请求 → 读取提议结算','工具：记录调用 → 检查与执行','记录工具结果 → step/end']),arrow('320,1353 320,1399'),box(60,1412,520,188,'Step 2',['请求包含先前工具结果','摘要结算 → step/end']),text(320,1658,'停止检查 → turn/end'),text(320,1706,'一个 Step 可有多个工具调用'),text(320,1751,'重试尝试也可能留在同一 Step')]
p += [text(320,1844,'继续读取另一份资料，再回答：'),text(320,1886,'可增加 Step 3，不必另开 Turn'),text(320,1932,'Turn 结束 ≠ 已达成用户目标',28,700)]
save('h03-02','Turn、Step 与工具的包含关系',1970,p,'三个独立轮次分别说明零步骤拒绝、单步骤回答与两步骤工具反馈；步骤内可以有多个工具或重试尝试。')

def sequence(p,y,title,rows):
 p.append(box(24,y,592,100,title,[],TEAL)); y+=135
 lanes=[80,240,400,560]
 for x,label in zip(lanes,['运行器','模型','工具','会话']):p.append(text(x,y,label,28,700))
 top=y+18;bottom=y+len(rows)*132+25
 for x in lanes:p.append(f'<line x1="{x}" y1="{top}" x2="{x}" y2="{bottom}" stroke="#A3C8CC" stroke-width="2" stroke-dasharray="5 6"/>')
 for i,(a,b,label) in enumerate(rows):
  yy=y+55+i*132
  p.append(f'<rect x="28" y="{yy-28}" width="584" height="44" rx="9" fill="{BG}"/>')
  p.append(text(320,yy,label))
  if a==b:p.append(arrow(f'{lanes[a]},{yy+39} {lanes[a]+38},{yy+39} {lanes[a]+38},{yy+72} {lanes[a]},{yy+72}'))
  else:p.append(arrow(f'{lanes[a]},{yy+52} {lanes[b]},{yy+52}'))
 return bottom+65
p=[text(320,105,'箭头：调用、返回或向会话追加事实')]
y=sequence(p,145,'A｜已提供正文：一个 Step',[
 (0,3,'turn/start；接纳后 step/start'),(0,1,'准备并请求模型（已有正文）'),(1,0,'流式响应：摘要'),(0,3,'追加 assistant/message'),(0,3,'step/end；停止检查后 turn/end')])
y=sequence(p,y,'B｜只给文件名：两个 Step',[
 (0,3,'turn/start；接纳后 step/start'),(0,1,'请求 ①：尚无读取结果'),(1,0,'流式响应：工具调用提议'),(0,3,'先追加 assistant/message'),(0,2,'转交 tools.execute(...)'),(2,3,'tool/call：尚未保证执行'),(2,2,'检查 → 执行允许的读取'),(2,3,'tool/result：成功或错误'),(0,3,'step/end；接纳后 step/start'),(0,1,'请求 ②：历史包含工具结果'),(1,0,'流式响应：根据资料回答'),(0,3,'assistant/message → step/end'),(0,3,'停止检查后追加 turn/end')])
p += [text(320,y,'工具列 = 服务、原生执行器与流水线'),text(320,y+44,'省略按需快照与 UI 通知，详见图 2'),text(320,y+88,'响应提交后才发 committed end',28,700),text(320,y+132,'会话追加不等于磁盘 flush')]
save('h03-03','直接回答与工具反馈：时序对比',y+175,p,'两种精选交互时序。工具请求先成为助手消息，再经工具系统记录调用、检查和执行，结果提交后才能进入下一次模型请求；会话追加与实时显示、落盘有不同边界。')

figures=[{'id':f'h03-0{i}','source':f'figures/source/h03-0{i}.svg','image':f'figures/rendered/h03-0{i}.png','rendererPath':f'/course-media/harness-v2/h03/h03-0{i}.png','commit':'f3803c96974ad4a94195fb97e5c637e9c2a3afe3','kind':kind,'purpose':purpose,'provenance':'原创教学重绘；未使用官方图片或字体文件','license':'本仓库课程素材；代码事实来自官方 MIT 仓库'} for i,kind,purpose in [(1,'flow','处理与记录两条线，接纳与继续边界'),(2,'containment','零/单/多 Step；步骤与工具/尝试的区别'),(3,'sequence','响应结算先于工具分派；反馈进入后续请求')]]
(ROOT/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('H03: three SVG sources generated; PNG export and visual inspection still required')
