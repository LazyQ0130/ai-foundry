from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1]; INK='#15394B'; BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3'
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
 text(s,32,h-28,'固定源码 f3803c9 · 条件组合教学图',28);s.append('</svg>');p=f'figures/h15-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8')
 return {'id':f'h15-0{n}','source':p,'image':p.replace('.svg','.png'),'rendererPath':f'/course-media/harness-v2/h15/h15-0{n}.png','caption':caption}
fig=[];s=begin('先分责任，再判断一次调用',1520)
y=box(s,100,'Registry：能看见、能提出吗？',['Schema 说明形状；可见不等于授权'])
y=arrow(s,y,'流水线')
y=box(s,y,'pre → 必要时审批 → guard',['普通策略可协作；守卫只拒绝','批准后仍可能被守卫拦住'],AMBER)
y=arrow(s,y,'允许主体')
y=box(s,y,'能力实现按组合选择执行边界',['Shell：策略 → 子进程沙箱 runner','文件：观察意图 → 受限 fs 后端'],GREEN)
y=box(s,y+26,'两条能力路径，不互相替代',['进程沙箱约束子进程文件效果','fs 围栏约束可信实现中的目标路径','观察插件提供版本条件；后端检查'],BLUE)
y=box(s,y+26,'Session 审计：记录请求与决定',['approval/asked ↔ approval/decided','不是所有操作都自动产生审批事件'],GREEN)
y=box(s,y+26,'保证取决于真实部署',['缺组件、绕过调用或卸载策略','都会改变此次调用实际经过的检查'],RED)
fig.append(save(1,s,1520,'上半部箭头是通用工具允许路径；下半部两种能力按各自消费者接线，不是一条必经总链。Session 审批审计横跨请求过程。'))
s=begin('一次审批，四种闭合结果',1440)
y=box(s,100,'有效 Turn 内 request(req)',['新审批 ID；关联可选 callId','先提交 approval/asked'])
y=arrow(s,y,'decide')
y=box(s,y,'先检查取消，再检查策略',['已取消 → cancelled','never → rejected；不问应答者'],AMBER)
y=arrow(s,y,'ask')
y=box(s,y,'approval/request Waterfall',['负责则答；否则 next()','缺失、抛错、非法答案 → unavailable'],BLUE)
y=box(s,y+26,'只有 allowed-once 才授权本请求',['rejected：拒绝；cancelled：撤回','unavailable：无可靠决定，拒绝'],GREEN)
y=arrow(s,y,'提交决定')
y=box(s,y,'approval/decided 使用同一审批 ID',['正常配对后才返回结果','取消后迟到批准不改变原结果'],BLUE)
y=box(s,y+26,'失败出口',['无有效 Turn：抛错，不开启请求','审计提交失败：不得返回未记录授权'],RED)
fig.append(save(2,s,1440,'正常调用的审计对使用服务生成的审批 ID，工具 callId 用于另一个关联。应答者接收的 req 没有这个审批 ID 字段。'))
s=begin('文件效果模式与完整度分开看',1440)
y=box(s,100,'read-only',['要求拒绝文件写入','POSIX 必要接收器等后端例外'],BLUE)
y=box(s,y+26,'workspace-write',['工作区 + 显式额外根 + 临时区域','不等于只看得见工作区'],GREEN)
y=box(s,y+26,'danger-full-access',['消费方绕过文件沙箱约束','本课只静态分析，不用它做写实验'],RED)
y=box(s,y+26,'另一维：enforcement',['full：承诺的文件效果完整强制','partial：只强制其中一部分'],AMBER)
y=box(s,y+26,'平台与后端事实',['Linux：bwrap 或 Landlock','macOS：Seatbelt','Windows：ACL 受限令牌，partial'],BLUE)
y=box(s,y+26,'不在模式词汇中的承诺',['网络、全部进程能力与系统隔离','无可用后端：失败关闭，不裸跑'],RED)
fig.append(save(3,s,1440,'三个模式描述文件效果。full/partial 是后端对这些效果的报告；旧 Landlock ABI 也可能 partial。图内平台实现来自静态源码，非本轮原生 runner 实测。'))
s=begin('观察、版本条件与重新读取',1450)
y=box(s,100,'消费者读取并发出 fs/observed',['记录 present(version) 或 absent','直接 ctx.fs.readText 不自动发事件'])
y=arrow(s,y,'编辑意图')
y=box(s,y,'观察插件按 Session 对象查状态',['未见 → FS_NOT_OBSERVED','确认缺失 → FS_NOT_FOUND','存在 → 返回先前版本'],AMBER)
y=arrow(s,y,'后端检查')
y=box(s,y,'版本未变：匹配并原子发布',['版本不同 → FS_STALE_VERSION','重新读取并重新判断，再尝试'],GREEN)
y=box(s,y+26,'write 的规则不同',['未见或缺失 → createIfAbsent','已有文件不能被这种创建盲目覆盖'],BLUE)
y=box(s,y+26,'生命周期与边界',['新 Session 对象无旧 WeakMap 状态','卸载观察插件，版本条件不再自动给出','原子发布不消除所有外部 TOCTOU'],RED)
fig.append(save(4,s,1450,'须有消费者正确分发 fs 事件、观察插件以及遵守 expected 的后端。进程内目标锁、版本检查和原子发布降低风险，不等于与任意外部写入者的无竞态事务。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 original H15 SVG generated')
