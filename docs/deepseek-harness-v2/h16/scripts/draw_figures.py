from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1];INK='#15394B';BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3'
(R/'figures/qa').mkdir(parents=True,exist_ok=True)
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
 text(s,32,h-28,'固定源码 f3803c9 · 条件组合教学图',28);s.append('</svg>');p=f'figures/h16-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8');return {'id':f'h16-0{n}','source':p,'image':p.replace('.svg','.png'),'rendererPath':f'/course-media/harness-v2/h16/h16-0{n}.png','caption':caption}
fig=[];s=begin('同一个工具入口，不同能力边界',1420)
y=box(s,100,'Agent 当前 Step',['可见 Schema → 提出 ToolCallBlock'])
y=arrow(s,y,'调用')
y=box(s,y,'Tools Registry / Native / Pipeline',['名称与身份；步骤准入；执行与结果','统一协议不代表统一权限'],AMBER)
y=arrow(s,y,'分派')
y=box(s,y,'File / Shell',['tool-fs → ctx.fs → 文件后端','tool-pwsh / bash → ctx.shell'],BLUE)
y=box(s,y+26,'Web',['tool-web → ctx.web → Search / Fetch','按调用选择提供方；步骤另查 ready'],GREEN)
y=box(s,y+26,'MCP',['每服务器 client 把发现结果注册成工具','调用 → SDK → 配置的 Server'],BLUE)
y=box(s,y+26,'具体能力各自拥有约束与资源',['File 版本条件；Shell 进程与 Jobs','Web 网络目标；MCP 连接与作用域','注册、准入、执行不可合成一个状态'],RED)
fig.append(save(1,s,1420,'上半部箭头为调用控制；下半部是不同能力分支。缺后端、条件不满足或连接失效，对注册与执行的影响分别判断。'))
s=begin('三种角色，四类能力的接线',1500)
y=box(s,100,'Definition：约定能做什么',['能力服务契约 ≠ 单个 ToolDefinition','Provider 落实能力；Consumer 声明工具'])
y=box(s,y+26,'File',['契约：FileSystem（ctx.fs）','提供方：fs-local 或 fs-sandbox','消费者：tool-fs'],BLUE)
y=box(s,y+26,'Shell',['契约：ShellExecutor（ctx.shell）','提供方：local 或 sandbox 执行器','消费者：tool-bash 或 tool-pwsh'],GREEN)
y=box(s,y+26,'Web',['契约与选择：WebRuntime（ctx.web）','提供方：独立 Search / Fetch 实现','消费者：tool-web'],BLUE)
y=box(s,y+26,'MCP：桥接而非通用 ctx.mcp',['外部 Server + SDK + 每服务器连接','client 注册适配后的 ToolDefinition','资源另由 ctx.mcpResources 分派'],AMBER)
y=box(s,y+26,'这些角色不强迫每家族同构',['同名工具协议不复制后端能力','替换执行环境后要重新判断保证'],RED)
fig.append(save(2,s,1500,'每个框说明角色归属，不表示同步调用顺序。WebRuntime同时拥有提供方注册与选择；MCP没有通用ctx.mcp服务，资源服务另列。'))
s=begin('注册、准入与连接，分别变化',1630)
y=box(s,100,'Web：工具已按配置注册',['ready=false → 本 Step 不准入','选择失败 → ready 为 true','调用时再报告结构化选择错误'],BLUE)
y=box(s,y+26,'Web：执行时选择提供方',['显式 ID 可用则选它','未指定：必须恰好一个可用','无提供方不等于工具已被卸载'],GREEN)
y=box(s,y+26,'MCP：连接 → 发现 → 发布',['先取完整工具清单，才切换注册','发现失败：保留上代工具','注册冲突：回滚本服务器新一代'],BLUE)
y=box(s,y+26,'MCP：断线后不必立刻消失',['重连关闭：保留旧工具，调用失败','重连开启：等待并尝试新连接','重试预算耗尽：撤销服务器工具'],AMBER)
y=box(s,y+26,'资源工具有另一条生命周期',['有可见服务器注册时存在','连接失效不自动撤销服务器条目','调用先按 Agent Scope 找服务器'],GREEN)
y=box(s,y+26,'本轮运行与未运行分开',['Web：内存提供方；不发网络请求','MCP：真实本地 stdio 与一次重连','完整重连竞态留待 H27'],RED)
fig.append(save(3,s,1630,'Web和MCP为两组独立状态，不是彼此调用。发现阶段失败与注册阶段冲突有不同回滚结果；MCP断线与共享资源工具撤销也不是同一事件。'))
s=begin('综合夹具：五次调用进入历史',1630)
y=box(s,100,'真实 AgentLoop 装配本 Step',['Scope 只允许五个指定工具','模型回复由脚本 Adapter 提供'])
y=arrow(s,y,'调用批次')
y=box(s,y,'1 File → 2 Shell',['File：真实工具 / 后端读取新夹具','Shell：真实工具 + Mock Executor','不启动 Bash / PowerShell 命令'],BLUE)
y=arrow(s,y,'顺序示例')
y=box(s,y,'3 Search → 4 Fetch → 5 MCP',['Web：真实 Runtime + 离线提供方','MCP：实际 SDK / stdio / 本地 Server'],GREEN)
y=arrow(s,y,'结算')
y=box(s,y,'工具结果 → Session → 下一请求',['实际 tool/call 与 tool/result','第二 Session 重建请求前缀核对','脚本 Adapter 据工具历史生成说明'],BLUE)
y=box(s,y+26,'拒绝分支：远端还声明 write',['本地允许集合没有这个工具','工具结果失败；服务器计数仍为 0','发现不能自行扩大本地权限'],RED)
fig.append(save(4,s,1630,'箭头是本轮maxParallelToolCalls=1的受控顺序示例，不是框架固定调度。模型、Shell和Web为替身，File与MCP本地stdio实际运行；不是完整E应用。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 H16 original SVG generated')
