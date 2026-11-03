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
 text(s,32,h-28,'固定 f3803c9 · 图中边界以正文为准');s.append('</svg>');p=f'figures/source/h18-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8');return {'id':f'h18-0{n}','source':p,'image':f'figures/h18-0{n}.png','rendererPath':f'/course-media/harness-v2/h18/h18-0{n}.png','caption':caption}
fig=[];s=begin('谁持有历史，谁拥有写入通道？',1500)
y=box(s,100,'运行对象：Store 与 Session',['SessionStore → 活跃 Session','内存事件日志 → 派生消息','Agent 使用 Session 推进工作'])
y=box(s,y+30,'工厂取得存储通道',['Persistence.create / open(write)','每个会话取得自己的 Handle','普通 sessions.create 不自动落盘'],GREEN)
y=box(s,y+30,'存储能力与具体提供方',['SessionPersistence 是契约','JSONL Backend 实现该服务','不存在按 ID 随意 append 的入口'])
y=box(s,y+30,'同一 Handle 接口，两种模式',['read：观察，不取得写权','write：可读、单写者、有退出义务','close：排空工作并释放写权'],AMBER)
y=box(s,y+30,'磁盘产物与运行实例分开',['Header + 连续逻辑事件','Agent 退出不删除已存历史','恢复不找回旧 Promise 或连接'],RED)
fig.append(save(1,s,1500,'职责分层而非多个进程。工厂取得逐会话writer，Backend路由事件；普通Session存在并不证明已有写句柄。'))
s=begin('何时看得见，何时承诺保存？',1700)
y=box(s,100,'通用 Handle 契约',['append：接受、有序、同实例可见','flush：后端承诺的耐久屏障','不能要求所有后端 append 都同步'])
y=box(s,y+30,'真实 Session 的实时写路径',['Session.append：内存提交','session/event：提交后的通知','有活跃 writer 才进入路由缓冲'],GREEN)
y=arrow(s,y,'入队')
y=box(s,y,'JSONL 路由缓冲',['首事件开启固定 200ms 窗口','后来事件不重置截止时间','失败保留；显式屏障重试'])
y=arrow(s,y,'批写')
y=box(s,y,'JSONL 的更强批次实现',['写入行 / 帧，再 await sync','首次：同步暂存 + 无覆盖发布','这些是具体后端实现，非通用最低线'],GREEN)
y=box(s,y+30,'Session / 服务级 flush',['先 drainLive，再 handle.flush','直接 handle.flush 不负责路由排空','无 writer 时布尔 true 仍不证落盘'],AMBER)
y=box(s,y+30,'Close 与保证边界',['close 自己排空，再释放写权','不删除历史，不回滚外部副作用','本课没有真实断电测试'],RED)
fig.append(save(2,s,1700,'上方通用契约，下方JSONL路由路径。200ms是内部批写窗口；同步实现经过源码核读，真实往返不等于断电认证。'))
s=begin('有效字节，与未结束的任务',1630)
y=box(s,100,'第一关：物理有效前缀',['半行 / 撕裂帧 → 后端读取有效记录','read 不改文件；新 append 前修尾','完整已提交损坏不能一律丢最后行'])
y=box(s,y+30,'正常关闭的 Turn',['原始 turn/end 已存在','interruptedTurnClosers → []','保留历史，不重复造结果'],GREEN)
y=box(s,y+30,'开放尾：只有 Assistant 提议',['无对应 tool/call','补 TOOL_NOT_STARTED 错误结果','没有可引用的 call Seq'])
y=box(s,y+30,'开放尾：有 call，缺结果',['补 TOOL_OUTCOME_UNKNOWN','sourceEventSeqs 引用已记 call','未知结果不授权重做副作用'],AMBER)
y=box(s,y+30,'再关闭尚未结束的边界',['缺 Step 结尾 → step/end','开放 Turn → turn/end interrupted','普通批次追加；原前缀不改'],GREEN)
y=box(s,y+30,'恢复范围有限',['不追溯修复已闭合 Step 的缺结果','不恢复外部连接 / 实时草稿','不保证外部操作恰好执行一次'],RED)
fig.append(save(3,s,1630,'正常和两种开放尾是独立分支。先由后端得到有效字节记录，再由Agent恢复层追加语义closer；不删除完整旧事实。'))
s=begin('共同过去，分支拥有独立未来',1470)
y=box(s,100,'X：从源事件 Seq9 分支',['源原始日志 16 条；9 是 tool/call','包含切点：复制 0～9 共 10 条','inheritedEventCount = 10'])
y=arrow(s,y,'构造 seed')
y=box(s,y,'子会话自有事件',['10：end-seed { inherited: true }','11：UNKNOWN 结果，引用 call9','12：step/end；13：turn/end forked'],GREEN)
y=box(s,y+30,'子初始 14 条，继承仍为 10',['marker 与 closer 不算继承','父可能在切点后已经完成工具','Fork 的结果说明必须提醒这一点'],AMBER)
y=box(s,y+30,'两条未来分别追加',['父：原16 → 恢复17 → 新任务26','子：分支14 → 新任务23','新用户输入不会串入另一份日志'],GREEN)
y=box(s,y+30,'新身份，不重做旧动作',['普通 Fork 不自动设置 parentSession','不自动创建 runtime 子 Agent','持久分支需工厂取得自己的 writer'],RED)
fig.append(save(4,s,1470,'精确采用X的Seq9切点：marker先于forked closer。父子未来独立，没有工具重放箭头；普通Fork与持久Agent分支接线分开解释。'))
(R/'figures/source').mkdir(parents=True,exist_ok=True)
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 H18 SVG sources generated')
