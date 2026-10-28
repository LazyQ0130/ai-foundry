"""Deterministic vector teaching diagrams. Original artwork, no external assets."""
from pathlib import Path
from html import escape
import json
OUT=Path(__file__).resolve().parents[1]
BG='#F3F9F8';INK='#15394B';LINE='#187A91';BLUE='#DDEDF5';TEAL='#D9F4E9';AMBER='#FFF0D7'
parts=[]
def t(x,y,text,size=30,anchor='middle',weight=400):
    parts.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" font-weight="{weight}" fill="{INK}">{escape(text)}</text>')
def box(x,y,w,h,fill=BLUE,r=18):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{LINE}" stroke-width="2"/>')
def arrow(path,dashed=False,both=False):
    parts.append(f'<path d="{path}" fill="none" stroke="{LINE}" stroke-width="3" marker-end="url(#arr)"'+(' marker-start="url(#back)"' if both else '')+(' stroke-dasharray="8 6"' if dashed else '')+'/>')
def begin(fid,title,height,desc):
    global parts
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc">',f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>',
      '<defs><marker id="arr" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1 L10 6 L1 11" fill="none" stroke="#187A91" stroke-width="2"/></marker><marker id="back" viewBox="0 0 12 12" refX="2" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M11 1 L2 6 L11 11" fill="none" stroke="#187A91" stroke-width="2"/></marker></defs>',
      f'<rect width="640" height="{height}" fill="{BG}" rx="24"/>','<g font-family="Microsoft YaHei,Arial,sans-serif">']
    t(320,64,title,34,weight=700)
    t(320,110,'AI Foundry · 源码基线 f3803c9',28)
def finish(fid):
    parts.extend(['</g>','</svg>'])
    (OUT/f'figures/source/{fid}.svg').write_text('\n'.join(parts)+'\n',encoding='utf-8')

begin('h01-01','LLM、Agent 与 Harness',1000,'Harness 提供运行环境与组合机制；Agent 围绕任务运行循环并调用模型；LLM 负责判断与生成。嵌套框表示职责关系，不是物理部署。')
box(32,154,576,696,TEAL)
t(64,206,'Harness：运行环境与组合',32,'start',700)
box(64,250,512,424,BLUE)
t(96,303,'Agent：围绕任务运行循环',30,'start',700)
box(96,346,448,208,'#F3F9F8')
t(320,403,'LLM：判断与生成',32,weight=700)
t(320,455,'回答，或提出工具调用',28)
t(320,503,'提议仍需 Runtime 处理',28)
t(320,610,'组织请求、工具与停止条件',28)
t(320,735,'模型适配 · 工具 · 日志 · 策略',28)
t(320,788,'资源所有权与生命周期',28)
t(320,908,'框表示职责；模型服务可能在远端',28)
t(320,954,'存在审批与沙箱 ≠ 已审计的生产安全',28)
finish('h01-01')

begin('h03-01','DeepSeek Harness 执行架构',1160,'Profile 和 Bundle 组装插件树；AgentLoop 通过 Inbox 驱动 Turn 与 Step，并调用 LLM、工具和 Session。能力连线不表示固定执行顺序。')
box(48,148,544,112,TEAL);t(320,192,'Profile / Bundle / Patch',32,weight=700);t(320,234,'在启动时组合插件树',28)
arrow('M320 264 V326');t(440,304,'组装',28)
box(48,332,544,140,BLUE);t(320,379,'AgentLoop + Inbox',34,weight=700);t(320,428,'Turn / Step · 请求与工具阶段',28)
parts.append(f'<path d="M48 402 H28 V986" fill="none" stroke="{LINE}" stroke-width="3"/>')
for y,label,sub,fill in [(548,'LLM 适配器','prepareCall / stream',BLUE),(724,'工具系统','Registry → Executor → Pipeline',TEAL),(900,'Session','事件日志 → Surface → 模型历史',BLUE)]:
    box(80,y,512,118,fill);t(336,y+44,label,32,weight=700);t(336,y+88,sub,28)
    arrow(f'M30 {y+58} H76',both=True)
t(320,1070,'连线：能力调用 / 数据往返，非步骤顺序',28)
t(320,1116,'此图省略作用域、提示词与具体策略插件',28)
finish('h03-01')

begin('h06-01','Cordis：Waterfall 环绕分发',986,'A 调用 next 后进入 B，B 调用 next 后进入默认实现；结果先返回 B 再返回 A。不调用 next 的监听器短路下游。Waterfall 可返回 Promise。')
for x,label in [(104,'监听器 A'),(320,'监听器 B'),(536,'默认实现')]:
    box(x-92,152,184,70,BLUE,12);t(x,198,label,32,weight=700)
    parts.append(f'<path d="M{x} 224 V684" stroke="{LINE}" stroke-width="2" stroke-dasharray="7 7"/>')
t(104,264,'A before',27)
arrow('M110 300 H312');t(212,286,'next()',28)
t(320,352,'B before',27)
arrow('M326 390 H528');t(428,376,'next()',28)
t(536,440,'body',28)
arrow('M530 478 H328');t(428,465,'返回结果',28)
t(320,530,'B after',27)
arrow('M314 570 H112');t(212,557,'返回结果',28)
t(104,626,'A after',27)
box(48,722,544,148,AMBER)
t(320,771,'某层不调用 next()',32,weight=700)
t(320,823,'后续监听器与默认实现都不运行',28)
t(320,930,'waterfall 可返回 Promise，调用方再 await',28)
finish('h06-01')

begin('h10-01','Agent Loop：Turn 与 Step',1640,'Turn 在输入领取前打开。准入拒绝或首条空输入可不进入 Step；正常 Step 包含模型请求和可选工具批次；还欠请求或有 next-step 输入则继续。turn-stopping 可以补入工作，最后记录 turn/end。')
box(96,150,448,88,TEAL);t(320,205,'turn/start：打开轮次',32,weight=700)
arrow('M320 242 V292')
box(96,300,448,136,BLUE);t(320,347,'领取 Inbox 输入',32,weight=700);t(320,390,'resolve / assemble / preStep',28)
arrow('M320 440 V492');t(426,474,'允许进入',28)
box(96,500,448,88,TEAL);t(320,555,'step/start',32,weight=700)
arrow('M320 592 V642')
box(96,650,448,180,BLUE);t(320,698,'模型请求与流式结算',32,weight=700);t(320,748,'prepare → stream → settle',28);t(320,794,'有工具则经执行器处理批次',28)
arrow('M320 834 V882')
box(96,890,448,80,TEAL);t(320,941,'step/end',32,weight=700)
arrow('M320 974 V1022')
box(96,1030,448,116,AMBER);t(320,1077,'还欠请求，或有',32,weight=700);t(320,1121,'next-step 输入？',30)
arrow('M548 1088 H612 V370 H550');t(566,1020,'是',28)
arrow('M320 1150 V1198');t(386,1180,'否',28)
box(96,1206,448,104,BLUE);t(320,1252,'agent/turn-stopping',32,weight=700);t(320,1289,'新增输入则再进入 preStep',28)
arrow('M548 1258 H612 V1090',dashed=True)
arrow('M320 1314 V1354')
box(96,1362,448,80,TEAL);t(320,1413,'turn/end：关闭轮次',32,weight=700)
box(48,1482,544,116,AMBER);t(320,1527,'另一条合法路径：零 Step',30,weight=700);t(320,1571,'首个 preStep 拒绝 / 输入改写为空',28)
finish('h10-01')
print('Generated 4 original SVG sources')
