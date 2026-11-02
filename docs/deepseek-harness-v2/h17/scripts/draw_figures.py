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
def arrow(s,y,label='派生'):
 s.append(f'<path d="M320 {y+9} V{y+65}" fill="none" stroke="#187A91" stroke-width="3" marker-end="url(#a)"/>');text(s,350,y+44,label);return y+90
def save(n,s,h,caption):
 text(s,32,h-28,'固定 f3803c9 · 图中边界以正文为准');s.append('</svg>');p=f'figures/source/h17-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8');return {'id':f'h17-0{n}','source':p,'image':f'figures/h17-0{n}.png','rendererPath':f'/course-media/harness-v2/h17/h17-0{n}.png','caption':caption}
fig=[];s=begin('保存结果，还是保存发生过的事？',1230)
y=box(s,100,'方案一：只保存当前状态',['任务 = 已完成','能读当前值；旧变化需另外记录'])
y=box(s,y+30,'方案二：保存有序事实',['任务创建 → 开始 → 进度 50%','→ 任务完成'],GREEN)
y=arrow(s,y,'折叠 fold')
y=box(s,y,'按格式、顺序和规则计算',['初始：未开始','遇开始：运行中；遇完成：已完成'])
y=box(s,y+30,'当前读模型：任务 = 已完成',['可从同一前缀重新计算','读模型不是另一份独立真源'],AMBER)
y=box(s,y+30,'教学类比的限制',['这不是核心 SessionEventMap 词汇','重建状态不会重做外部副作用'],RED)
fig.append(save(1,s,1230,'上半部比较两种保存对象；下半部只展开事件方案。待办事件为教学类比，实际实验用真实 turn/start、turn/end。'))
s=begin('日志保留，模型可见顺序可以变化',1550)
y=box(s,100,'B：仅追加事件日志',['0 system；1 user；2 assistant','3 attempt；4 tool result；5 空developer','后来追加 6：替换当前节点 1 到 2'])
y=arrow(s,y,'Surface规则')
y=box(s,y,'替换前 → 替换后',['[0, 1, 2, 4, 5] → [0, 6, 4, 5]','端点为当前节点；两端均包含','sourceEventSeqs 必须覆盖 1、2'],GREEN)
y=arrow(s,y,'消息派生')
y=box(s,y,'deriveMessages() 的三条消息',['0：system；6：user 摘要','4：tool；5 空节点不产生 Message','3 attempt 从未加入 Surface'])
y=box(s,y+30,'7 条事实仍全部保留',['事件 1、2 被遮蔽，没有物理删除','节点顺序不同于日志追加顺序'],AMBER)
y=box(s,y+30,'不把 Surface 当人类聊天档案',['展示历史另选 append-origin 事实','图示省略插件消息投影扩展'],RED)
fig.append(save(2,s,1550,'实践B第一次合法替换的精确节点。原日志由6条增长为7条，模型消息由4条变3条；Surface节点5因空内容不产出消息。'))
s=begin('同一份事实，多个有规则的读视图',1530)
y=box(s,100,'Session 已提交事件前缀',['按 seq 连续；保留原始事实','Header 元数据位于事件日志之外'])
y=box(s,y+30,'读法一：模型历史',['Surface 决定节点与顺序','deriveMessages 把节点变为 Message'],BLUE)
y=box(s,y+30,'读法二：任务状态 Projection',['init：idle；turn/start：running','turn/end：completed 或 error','无关事件返回同一状态引用'],GREEN)
y=box(s,y+30,'读法三：请求与工具历史',['最新 request/header → 配置 / Schema','ToolHistoryProjection → 历史声明','不依赖现在的 Tool Registry'],BLUE)
y=box(s,y+30,'注册表驱动，领域单元只计算',['await register → handle.stateOf','snapshot 返回同一 seq 的全量视图','onChanged 受状态和 view 引用门控'],AMBER)
y=box(s,y+30,'缓存不是独立真源',['按正确事件格式与版本重算','持久存储是另一项能力'],RED)
fig.append(save(3,s,1530,'三个读法共享一份前缀，框为并列读模型，不是先后调用链。模型历史由Surface负责，不能把它说成随意注册的业务Projection。'))
s=begin('真实执行：实时、提交与检查点',1740)
y=box(s,100,'D：第一个请求之前',['0 / 2 inbox：仅日志；1 turn/start','3 step/start；4 system；5 user','6 request/header；7 request/context'])
y=box(s,y+30,'请求一与实时响应',['Loop读取前缀 [0, 8)','实时 start / chunk 没有 Session seq','8 assistant/message：结算工具提议'],GREEN)
y=box(s,y+30,'工具接手与结果提交',['9 tool/call：仅日志','tools/result：运行时观察，无 seq','10 tool/result：模型可见结果'],BLUE)
y=box(s,y+30,'下一 Step 与最终回答',['11 step/end；12 step/start','请求二读取前缀 [0, 13)','13 assistant/message：最终回答'],GREEN)
y=box(s,y+30,'结束不是磁盘保证',['14 step/end；15 turn/end','图中16条事实已在内存提交','仅日志事件不会全部变聊天消息'],AMBER)
y=box(s,y+30,'单独的耐久性边界',['调用 ctx.sessions.flush(session)','等待实际后端承诺；本例无后端','本图不表示 fsync 已发生'],RED)
fig.append(save(4,s,1740,'按实践D真实seq分段；框内按顺序，跨框为时间推进。实时帧、Session事实与flush边界分列，flush框表示概念接口，未在该Loop夹具挂持久后端。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 H17 SVG sources generated')
