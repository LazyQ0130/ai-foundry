"""H10原创矢量源；640宽、文字至少28px；浏览器另渲PNG并检查文字边界。"""
from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,GREEN,AMBER,RED='#DDEDF5','#D9F4E9','#FFF0D7','#FCE5E3'
def text(x,y,s,size=28,weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{escape(s)}</text>'
def card(y,title,lines,fill=BLUE):
 h=90+42*len(lines)
 return (f'<rect x="28" y="{y}" width="584" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'+text(320,y+44,title,32,700)+''.join(text(320,y+91+42*i,s) for i,s in enumerate(lines)), h)
def arrow(y1,y2):
 return f'<path d="M320 {y1} V{y2}" fill="none" stroke="{LINE}" stroke-width="3" marker-end="url(#arrow)"/>'
def save(n,title,intro,cards,foot,desc,connected=False):
 y=150;p=[text(320,55,title,32,700),text(320,108,intro)]
 for i,(t,ls,color) in enumerate(cards):
  s,h=card(y,t,ls,color);p.append(s)
  if connected and i<len(cards)-1:p.append(arrow(y+h+4,y+h+46))
  y+=h+60
 for line in foot:p.append(text(320,y,line));y+=42
 fid=f'h10-0{n}'
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{y+28}" viewBox="0 0 640 {y+28}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs><style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{y+28}" fill="{BG}"/>{''.join(p)}</svg>'''
 (R/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8')

save(1,'四种单位，分别数边界','以下每张卡都是独立的一个Turn',[
 ('零Step：首次拒绝',['turn/start → pre-step拒绝','turn/end：blocked','没有step/start，也没请求模型'],RED),
 ('一个Step：直接回答',['Step 1：Attempt 1 → 回答','零工具，completed'],BLUE),
 ('多个Step：两次工具反馈',['Step 1：请求 → 读README','Step 2：请求 → 读TEST','Step 3：请求 → 最终回答','同一Turn，三次判断，两个工具'],GREEN),
 ('一个Step内部：请求重试',['Step 1：Attempt 1失败','记录assistant/attempt','监听器retry → Attempt 2成功','只开一次Step，不重复接纳用户'],AMBER),
 ('一个Step可以有多个工具',['Step 1：一份输出 → 工具A、B','两份结果提交后，Step 2回答','两个工具 ≠ 两个含工具的Step'],BLUE),
],['Attempt按实际请求观察','assistant/attempt不是所有尝试的清单'],
 '独立场景分别展示零一多Step；重试在同Step；同份输出可有多个工具调用。')

save(2,'活动占用与输入路线','Phase不是Fiber状态，也不是公开status',[
 ('idle：保存lastTurn',['唤醒 → 先占running → 启动Driver','inject只入队，仍然等待'],BLUE),
 ('maintenance：独占维护',['公开status仍是idle','保存abort与wakeRequested','唤醒先锁存；结束后复查并放行'],AMBER),
 ('running：已有一个Driver',['保存abort、turn、step','新输入进入Inbox，不再开Driver','活动收束 → idle；需要时再唤醒'],GREEN),
 ('正常活动中的输入路由',['followup → next-turn；唤醒','steer → next-step；唤醒','inject → next-step；不唤醒'],BLUE),
 ('Turn开头怎样领取？',['① 全部next-step：I、S','② 一个next-turn：F1','返回I、S、F1；F2仍待下一轮'],GREEN),
 ('领取与消息接纳分开',['splice事实先提交 → claimed通知','候选接纳 + 请求准备成功','之后才提交普通user/message'],AMBER),
],['图按未取消活动绘制','abort后唤醒转投next-turn，见正文'],
 '三种Phase和公开status差异；正常输入路由、维护锁存；领取先nextstep全量再nextturn一条。')

save(3,'一个Turn，三个Step','箭头连接的卡片按时间向下读取',[
 ('用户 → Agent入口 → Driver',['followup任务 → 入Inbox并唤醒','Driver → Session：turn/start'],BLUE),
 ('每个候选Step都先准备',['Driver：领取 → 模型选择快照','解析工具 → Prompt组装','agent/pre-step决定是否接纳'],AMBER),
 ('Step 1：获取README',['Driver → Session：step/start','准备请求并绑定；检查取消','提交系统提示与本次用户输入','Session历史 → 请求1 → LLM','LLM → Driver：读README','Driver → Session：Assistant','Driver → Tools：执行读取','Tools → Session：call、result','Driver → Session：step/end'],GREEN),
 ('Step 2：检查测试',['再次准备候选 → step/start','请求准备 → 按需提交 → 派生历史','请求2含README结果 → LLM','LLM → Driver：读TEST','Driver → Session：Assistant','Driver → Tools：执行读取','Tools → Session：call、result','Driver → Session：step/end'],GREEN),
 ('Step 3：生成答复',['再次准备候选 → step/start','请求准备 → 按需提交 → 派生历史','请求3含两份结果 → LLM','LLM → Driver：最终答复，无工具','Driver → Session：Assistant','Driver → Session：step/end'],BLUE),
 ('结束候选，还要复查输入',['completed且next-step为空','通知turn-stopping → 再检查为空','Driver → Session：turn/end','Agent公开status回idle，实例保留'],AMBER),
],['Assistant为assistant/message的简写','省略逐块流、请求头差异和Prompt内部'],
 '用户经Agent入Inbox唤醒Driver；三个Step包含准备提交请求Assistant工具与边界；Session结果进入下一请求，最后停止复查。',True)

save(4,'边界不同，结尾也不同','下列每行独立；均先确认Turn已开始',[
 ('正常答复',['step/start → 准备与提交 → 请求','Assistant结算 → step/end','无后续输入 → turn/end completed'],GREEN),
 ('首次pre-step拒绝',['turn/start → 领取 → reject','零Step；零请求；无用户消息','turn/end blocked'],RED),
 ('pre-step等待处取消',['取消 → 释放门 → 检查信号','零Step；零请求；无消息接纳','turn/end aborted'],RED),
 ('agent/request等待处取消',['已有step/start，尚未提交输入','零请求 → step/end','turn/end aborted'],AMBER),
 ('流给出partial后取消',['已接纳输入；一Step、一请求','interrupted Assistant → step/end','turn/end aborted'],AMBER),
 ('规范化请求失败，允许retry',['同Step：失败 → assistant/attempt','监听器retry → 再请求 → Assistant','step/end → turn/end completed'],BLUE),
 ('同类失败，无retry决策',['失败 → assistant/attempt','step/end → turn/end error','不能把所有throw都画成重试'],RED),
 ('工具主体抛错的本课夹具',['Step 1提交错误tool/result','Step 2据此回答无法读取','turn/end completed ≠ 业务成功'],AMBER),
],['无Step与无请求是两个不同判断','图只覆盖列明路径；更深恢复留H20'],
 '独立对比正常拒绝三处取消重试和错误工具结果，突出Step与请求消息接纳边界、重试条件。')
figures=[dict(id=f'h10-0{i}',source=f'figures/source/h10-0{i}.svg',image=f'figures/rendered/h10-0{i}.png',rendererPath=f'/course-media/harness-v2/h10/h10-0{i}.png',commit='f3803c96974ad4a94195fb97e5c637e9c2a3afe3',purpose=p,provenance='课程原创SVG；不覆盖旧版全课程图或H03/H09图；PNG由本课QA脚本生成') for i,p in [(1,'边界计数与同Step重试'),(2,'Phase与Inbox领取接纳'),(3,'多Step完整请求与提交时序'),(4,'停止取消失败重试对照')]]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Four original H10 SVG files written')
