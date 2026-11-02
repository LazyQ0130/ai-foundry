from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1];INK='#15394B';BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3'
def begin(title,h):
 return [f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{h}" viewBox="0 0 640 {h}" role="img"><title>{escape(title)}</title><defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10" fill="none" stroke="#187A91" stroke-width="2"/></marker></defs><rect width="640" height="{h}" fill="#F3F9F8"/>',f'<text x="32" y="57" font-size="32" font-weight="700" fill="{INK}" font-family="Microsoft YaHei">{escape(title)}</text>']
def text(s,x,y,label,size=28,bold=False):s.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>')
def box(s,y,title,lines,fill=BLUE):
 h=72+len(lines)*42;s.append(f'<rect x="32" y="{y}" width="576" height="{h}" rx="15" fill="{fill}" stroke="#78A7AC"/>');text(s,52,y+43,title,30,True)
 for i,line in enumerate(lines):text(s,52,y+87+i*42,line)
 return y+h
def arrow(s,y,label=''):
 s.append(f'<path d="M320 {y+9} V{y+65}" fill="none" stroke="#187A91" stroke-width="3" marker-end="url(#a)"/>');text(s,350,y+44,label);return y+90
def save(n,s,h,caption):
 text(s,32,h-28,'固定源码 f3803c9 · 教学简图',28);s.append('</svg>');p=f'figures/h14-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8')
 return {'id':f'h14-0{n}','source':p,'image':p.replace('.svg','.png'),'rendererPath':f'/course-media/harness-v2/h14/h14-0{n}.png','caption':caption}
fig=[];s=begin('工具批次：成功主线与失败出口',1480)
y=box(s,100,'ToolCallBlock[] → Native 批次',['解析参数；有 log 时先记 tool/call'])
y=arrow(s,y,'prepare')
y=box(s,y,'快照参数，再作前置决策',['pre → ask 通道（需要时）→ guard','参数 Schema 尚未因此全部通过'],AMBER)
y=arrow(s,y,'dispatch')
y=box(s,y,'tools/execute 包住工具定义',['defineTool 包装校验参数，再入主体','成功值 → 校输出 → render / meta'],GREEN)
y=arrow(s,y,'complete')
y=box(s,y,'project → post → finalize',['候选与最终结果均有物化检查','最终 tools/result 观察已冻结结果'],BLUE)
y=arrow(s,y,'有 log')
y=box(s,y,'按模型顺序提交 tool/result',['附加上下文由批次收集，再交 Loop'])
y=box(s,y+26,'分支不全走成功主线',['deny：跳主体，仍进 project / post','pre 或 wrapper 抛错：跳这两项','批次 skip：合成结果，不进流水线'],RED)
fig.append(save(1,s,1480,'实线为成功路径控制流；分支框说明跳过阶段，不将所有错误画成同一出口。输出校验由共享流水线，输入Schema由defineTool执行包装负责。'))
s=begin('三个 Waterfall，不同控制权',1320)
y=box(s,100,'tools/pre-execute',['next() 取得下游决策；可短路','allow / deny / ask / cancel'],AMBER)
y=arrow(s,y,'最终 allow')
y=box(s,y,'guard：单调拒绝或不表态',['在前置决策和审批解析之后','不是另一个可随意授权的 Waterfall'],RED)
y=arrow(s,y,'未拒绝')
y=box(s,y,'tools/execute',['next() 等待工具；外层前后包装','工具异常与 wrapper 异常出口不同'],GREEN)
y=arrow(s,y,'projectContent')
y=box(s,y,'tools/post-execute',['accept：保留或替换 content / value','block：转失败；随后 finalize'],BLUE)
y=box(s,y+26,'委托纪律',['await / return next()；每层至多一次','普通拒绝可被已进入外层改写','guard 拒绝不因此重新开放主体'],AMBER)
fig.append(save(2,s,1320,'仅表示允许路径的阶段位置；deny/ask/cancel及异常按正文分支表处理。单调约束属于守卫接口与正常调用契约，不是进程沙箱。'))
s=begin('主体完成顺序，不是结果提交顺序',1220)
y=box(s,100,'模型调用顺序：A → B → C',['A / B 可并发；C 必须独占','本例上限2，Promise门闩控制结束'])
y=arrow(s,y,'补入池')
y=box(s,y,'A、B 均已启动，尚未完成',['C 等待当前并发组结算'],GREEN)
y=arrow(s,y,'放行 B')
y=box(s,y,'B 先完成，A 仍在途',['B 的最终 complete / 提交还在等 A'],AMBER)
y=arrow(s,y,'再放行 A')
y=box(s,y,'依次完成与提交 A、B',['tools/result 观察也按模型顺序','两项提交后才启动独占 C'],BLUE)
y=arrow(s,y,'放行 C')
y=box(s,y,'完成：B → A → C',['提交：A → B → C'],GREEN)
fig.append(save(3,s,1220,'图内“完成”区分主体结束与pipeline.complete；事件来自实践B的真实Loop/Native/Session。滚动补位和重分类另有对照，不把这个屏障例子当固定分组算法。'))
s=begin('执行期结果、观察与 Session 事实',1400)
y=box(s,100,'规范值：{title, chars}',['output.schema 校验；执行期冻结','render 生成 content；meta另行投影'],GREEN)
y=arrow(s,y,'内容策略')
y=box(s,y,'project → post → finalize',['改 content 不自动改 value / meta','换 value 则重新校验、渲染与投影'],AMBER)
y=arrow(s,y,'物化与冻结')
y=box(s,y,'tools/result：运行时观察',['exec 与权威结果已冻结','监听失败被记录，不改权威结果'],BLUE)
y=arrow(s,y,'有 log 才写')
y=box(s,y,'tool/result：Session 事实',['message：toolCallId、content、isError','data.error / data.meta 按需记录','不全量保存规范 value'],GREEN)
y=box(s,y+26,'additionalContexts：另一条通道',['按调用顺序收集，交下一步骤队列','Loop 接纳时才追加 user/message','不是塞进 tool/result 的正文'],BLUE)
text(s,32,1320,'内存记录被接受，不等于磁盘已 flush',28)
fig.append(save(4,s,1400,'箭头表示产物传递与结算位置，附加上下文单列为另一通道。无log不生成根级调用/结果日志；取消skip的合成结果不经过tools/result观察。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 H14 SVG generated')
