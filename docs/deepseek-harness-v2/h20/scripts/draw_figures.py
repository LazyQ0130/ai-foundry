from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1];INK='#15394B';BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3'
(R/'figures/source').mkdir(parents=True,exist_ok=True)
def begin(title,h):
 return [f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{h}" viewBox="0 0 640 {h}" role="img"><title>{escape(title)}</title><defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10" fill="none" stroke="#187A91" stroke-width="2"/></marker></defs><rect width="640" height="{h}" fill="#F3F9F8"/>',f'<text x="32" y="57" font-size="32" font-weight="700" fill="{INK}" font-family="Microsoft YaHei">{escape(title)}</text>']
def text(s,x,y,label,size=28,bold=False):s.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>')
def box(s,y,title,lines,fill=BLUE):
 h=72+len(lines)*42;s.append(f'<rect x="32" y="{y}" width="576" height="{h}" rx="15" fill="{fill}" stroke="#78A7AC"/>');text(s,52,y+43,title,30,True)
 for i,line in enumerate(lines):text(s,52,y+87+i*42,line)
 return y+h
def arrow(s,y,label='派生'):
 s.append(f'<path d="M320 {y+9} V{y+65}" fill="none" stroke="#187A91" stroke-width="3" marker-end="url(#a)"/>');text(s,350,y+44,label);return y+90
def save(n,s,h,caption):
 old=h;h=max(h,y+100);s[0]=s[0].replace(f'height="{old}"',f'height="{h}"').replace(f'640 {old}',f'640 {h}');
 text(s,32,h-28,'固定 f3803c9 · 图中边界以正文为准');s.append('</svg>');p=f'figures/source/h20-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8');return {'id':f'h20-0{n}','source':p,'image':f'figures/h20-0{n}.png','rendererPath':f'/course-media/harness-v2/h20/h20-0{n}.png','caption':caption}
fig=[]
s=begin('失败在哪一层，恢复就看哪一层',1450)
y=box(s,100,'模型请求：终止失败事实',['RATE_LIMIT / SERVER / TRANSPORT','失败 Attempt → request-error','按提供方策略过滤、预算与等待'])
y=box(s,y+30,'工具业务：执行过，结果是错误',['主体抛错可结算为 tool/result','模型可收到错误，再解释或换方案','不自动进入模型请求重试'],GREEN)
y=box(s,y+30,'策略 / 基础设施：看实际边界',['单工具 hook 错误可变成错误结果','模型 middleware 错误仍向外抛','调度失败先排空，再由 Step 修复'],AMBER)
y=box(s,y+30,'主动取消：任务控制权已改变',['发出 AbortSignal，停止新增工作','已启动操作协作退出并结算','取消请求 ≠ 已经完全停稳'],RED)
y=box(s,y+30,'进程中断：读持久有效前缀',['Resume → 缺结果 / 开放边界修复','不重放旧模型与工具副作用','先核外部状态，再决定是否再做'])
fig.append(save(1,s,1450,'故障分类是决策起点。每条事实的记录、模型可见性、重试与副作用要分别取证；不是所有错误都到request-error。'))
s=begin('同一个 Step，新的请求 Attempt',1710)
y=box(s,100,'已打开 Turn / Step',['A:rate-limit 的 step/start = Seq3','失败分片只归属这次 Attempt','Seq8 assistant/attempt 已结算'])
y=arrow(s,y,'恢复点')
y=box(s,y,'agent/request-error Waterfall',['失败码、provider、捕获策略、signal','normal：合格码和预算才处理','always：先等待下游恢复'],GREEN)
y=box(s,y+30,'Seq9 llm/retry：先登记计划',['retryId / policyKey / retry1 / 500ms','仅日志，不进入模型消息','Session append 不等于磁盘屏障'],AMBER)
y=arrow(s,y,'可取消等待')
y=box(s,y,'等待分支',['取消 / 释放：清计时器，无 started','正常结束：Seq10 retry-started','这个事件不证明新请求已成功'],RED)
y=box(s,y+30,'重新准备请求，不重接用户消息',['不重跑 pre-step / 工具准入 / assemble','刷新运行时上下文，派生当前 Surface','新的请求仍属原 Turn / Step'])
y=box(s,y+30,'成功与真正关闭',['Seq11 assistant/message','Seq12 step/end → Seq13 turn/end','本地保存检查点须另按路径 flush'],GREEN)
fig.append(save(2,s,1710,'数字来自真实A轨迹。计划、等待结束、请求尝试、最终成功分别是不同事实；本课用虚拟时间推进真实定时器调用。'))
s=begin('取消信号发出后，还欠哪些工作？',1560)
y=box(s,100,'agent.cancel：协作式请求',['当前活动 AbortController 中止','默认清 Inbox；keepInbox 可保留','不会强杀任意 Promise 或进程'],RED)
y=box(s,y+30,'模型流：安全前缀与 Attempt',['中断可保留非空 text / reasoning','工具调用块不作为可执行前缀','没有安全块则只记 assistant/attempt'])
y=box(s,y+30,'退避与恢复委派',['本插件计时器可取消并移除','已进入下游仍须等待其结算','不合作的下游可能阻止完全停稳'],AMBER)
y=box(s,y+30,'工具批次：停止补位，排空已启动',['未派发 → ABORTED_BEFORE_DISPATCH','主体已开始 → 等待，再选结果','已提交结果不删除；按模型序写入'],GREEN)
y=arrow(s,y,'收尾')
y=box(s,y,'关闭当前控制边界',['必要的保守工具结果 → step/end','turn/end aborted 记录取消原因','whenIdle 等待整个活动完全停稳'])
y=box(s,y+30,'Handle.dispose 还承担生命周期',['disposed cause cancel → 等停稳','退出作用域、关闭 writer、撤登记','cancel 本身不销毁整个 Agent'],AMBER)
fig.append(save(3,s,1560,'取消是控制信号，不是成功证明或副作用回滚。started工具不响应signal时，平台仍等待其Promise；本课门控后明确放行。'))
s=begin('缺少工具结果，能不能再执行？',1510)
y=box(s,100,'综合X：真实工具提议 Seq11',['提出 write-fixture 与 read-fixture','Seq12 仅记录第一项 tool/call','内存假副作用已发生：计数1'])
y=box(s,y+30,'保存精确开放前缀到新副本',['原任务随后取消并正常排空','副本不含任何后续 tool/result','这是逻辑中断夹具，不是真杀进程'],AMBER)
y=box(s,y+30,'真实 Resume 的保守闭合',['Seq13：TOOL_OUTCOME_UNKNOWN','Seq14：TOOL_NOT_STARTED','Seq15 step/end；Seq16 interrupted'],GREEN)
y=box(s,y+30,'两种事实不能合并',['UNKNOWN：有开始，最终结果没记录','NOT_STARTED：日志没证明已开始','不是外部世界从未发生的保证'])
y=box(s,y+30,'先检查外部状态与操作语义',['只读：仍需要时可考虑重读','幂等：核业务键与已有结果','非幂等未知：核对、确认或停止'],RED)
y=box(s,y+30,'事实可重建，不等于动作重放',['恢复旧模型0次、旧工具0次','假外部计数仍为1，不自动重写','后续请求读配对完整的当前历史'],GREEN)
fig.append(save(4,s,1510,'同一原始前缀在原任务与中断副本拥有不同未来。副本的合成结果保留未知性；幂等键示例是教学策略，不是Harness对所有工具的自动保证。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 H20 SVG sources generated')
