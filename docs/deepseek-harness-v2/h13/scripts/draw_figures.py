"""H13 原创教学图。640px 单画布，最小28px中文；PNG由浏览器实际字体渲染。"""
from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1]
INK='#15394B';BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3'
def begin(title,h):
 return [f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{h}" viewBox="0 0 640 {h}" role="img"><title>{escape(title)}</title><defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10" fill="none" stroke="#187A91" stroke-width="2"/></marker></defs><rect width="640" height="{h}" fill="#F3F9F8"/>',f'<text x="32" y="57" font-size="32" font-weight="700" fill="{INK}" font-family="Microsoft YaHei">{escape(title)}</text>']
def text(s,x,y,label,size=28,bold=False):
 s.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>')
def box(s,y,title,lines,fill=BLUE,x=32,w=576):
 h=72+len(lines)*42;s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="15" fill="{fill}" stroke="#78A7AC"/>');text(s,x+20,y+43,title,30,True)
 for i,line in enumerate(lines):text(s,x+20,y+87+i*42,line)
 return y+h
def arrow(s,y,label):
 s.append(f'<path d="M320 {y+9} V{y+65}" fill="none" stroke="#187A91" stroke-width="3" marker-end="url(#a)"/>');text(s,348,y+44,label);return y+90
def save(n,s,h,caption):
 text(s,32,h-28,'固定源码 f3803c9 · 教学简图',28);s.append('</svg>');p=f'figures/h13-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8')
 return {'id':f'h13-0{n}','source':p,'image':p.replace('.svg','.png'),'rendererPath':f'/course-media/harness-v2/h13/h13-0{n}.png','caption':caption}
fig=[]
s=begin('一份定义，四种不同职责',1160)
y=box(s,100,'ToolDefinition：模型声明字段',['name · description','parameters · deferLoading?'])
y=arrow(s,y,'显式投影')
y=box(s,y,'ToolSchema：只有声明数据',['没有 execute、output 或展示回调'],GREEN)
text(s,32,y+60,'以下字段留在进程内，不随此投影发送',28,True)
y=box(s,y+85,'执行信息',['execute · timeoutMs','isConcurrencySafe'],AMBER)
y=box(s,y+24,'规范结果与内容',['output.schema / render','projectContent / finalizeContent'],BLUE)
y=box(s,y+24,'Host 展示',['presentCall / presentResult','与模型内容分开消费'],GREEN)
fig.append(save(1,s,1160,'箭头仅表示 projectToolSchema 字段投影；其余分组表示职责，不是完整执行时序。'))
s=begin('同一注册表，不同作用域视图',1290)
y=box(s,100,'全局工具',['shared · metrics · style'])
text(s,32,y+56,'A / B 都继承全局；自身登记优先',28,True)
box(s,y+82,'代码 Agent A',['自己的工具：','analyze','style = code'],GREEN,x=32,w=280)
box(s,y+82,'文档 Agent B',['自己的工具：','outline','继承 style'],BLUE,x=328,w=280)
y=box(s,590,'A 的两个继承过滤器',['allow: shared, style','deny: shared, style'],AMBER)
y=arrow(s,y,'取交集')
y=box(s,y,'A 剩下 analyze、自己的 style',['自身登记不被这两个限制隐藏'],GREEN)
y=box(s,y+24,'撤销 A 限制，再看子级',['analyze 对子级变成继承工具','子级可再用 deny 隐藏它'],BLUE)
text(s,32,1215,'Scope 路由受信任贡献，不构成安全沙箱',28)
fig.append(save(2,s,1290,'省略插件 Fiber 和注销细节；两张卡对应独立 Scope，父子关系另列。过滤的是继承贡献，包含祖先作用域。'))
s=begin('一个 Step 的准入，不是永久许可',1420)
y=box(s,100,'准备本 Step：捕获模型选择',['agent + modelSelection + signal'])
y=arrow(s,y,'resolve')
y=box(s,y,'逐个检查当前可见注册的 when',['true：收入；false：不收入','抛错或取消：不交出部分集合'],AMBER)
y=arrow(s,y,'完整返回')
y=box(s,y,'ResolvedToolSet 属于这个 Step',['重试复用；不因普通条件翻转重算','下一 Step 重新 resolve'],GREEN)
y=arrow(s,y,'读取或调用')
y=box(s,y,'仍核对当前状态',['同一 agent、同一注册身份','当前可见且集合尚未释放'],BLUE)
y=box(s,y+24,'可能失效',['注销、同名替换、限制或 dispose','旧声明不能让工具自动复活'],RED)
text(s,32,1340,'signal 需配合；不会硬终止任意 Promise',28)
fig.append(save(3,s,1420,'条件判断按可见注册串行等待；图中省略细化失败分支。执行已开始后的控制、策略和调度属于 H14。'))
s=begin('从插件注册到模型提出调用',1480)
y=box(s,100,'插件：register(ToolDefinition)',['Context 决定 Scope 与 Effect 所有者'])
y=arrow(s,y,'Scope 过滤')
y=box(s,y,'AgentLoop：本 Step resolve',['ToolsService 保存完整定义与准入'],GREEN)
y=arrow(s,y,'executor.describe')
y=box(s,y,'SystemPrompt 接收模型工具声明',['Native：当前原始工具 Schema','PTC：run_code + 提示中的 SDK'],BLUE)
y=arrow(s,y,'组装请求')
y=box(s,y,'LLM Request → Runtime → Adapter',['声明使模型知道怎样提出调用','Registry 不替模型决定选哪个工具'],AMBER)
y=arrow(s,y,'模型输出')
y=box(s,y,'ToolCallBlock：模型提议',['id / name / arguments 字符串','执行器接收批次，核对当前资格','不是执行成功的证明'],GREEN)
y=arrow(s,y,'H14 继续')
y=box(s,y,'ToolResultMessage → 下一请求',['实验观察结果，本课不展开流水线'],BLUE)
fig.append(save(4,s,1480,'箭头表示主要数据和控制关系；省略 Runtime 的历史与能力投影细节。PTC 的 SDK 是提示内容，并非逐个原始工具声明。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('4 original SVG sources generated')
