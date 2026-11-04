from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1]
(R/'figures/source').mkdir(parents=True,exist_ok=True)
(R/'figures').mkdir(exist_ok=True)
INK='#15394B';BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3'
def figure(n,title,cards,caption):
    y=110;parts=[]
    for heading,lines,color,edge in cards:
        if parts and edge:
            parts.append(f'<path d="M320 {y} V{y+52}" stroke="#187A91" stroke-width="3" fill="none" marker-end="url(#a)"/>')
            parts.append(t(350,y+33,edge));y+=78
        h=72+42*len(lines)
        parts.append(f'<rect x="32" y="{y}" width="576" height="{h}" rx="15" fill="{color}" stroke="#78A7AC"/>')
        parts.append(t(52,y+43,heading,30,True))
        for i,line in enumerate(lines):parts.append(t(52,y+87+42*i,line))
        y+=h+24
    height=y+80
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img"><title>{escape(title)}</title><defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10" fill="none" stroke="#187A91" stroke-width="2"/></marker></defs><rect width="640" height="{height}" fill="#F3F9F8"/>'+t(32,57,title,32,True)+''.join(parts)+t(32,height-28,'固定 f3803c9 · 边界与条件见正文')+'</svg>'
    path=f'figures/source/h23-0{n}.svg';(R/path).write_text(svg,encoding='utf-8')
    return {'id':f'h23-0{n}','source':path,'image':f'figures/h23-0{n}.png','rendererPath':f'/course-media/harness-v2/h23/h23-0{n}.png','caption':caption}
def t(x,y,label,size=28,bold=False):return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>'
figures=[figure(1,'入口不同，共享核心执行能力',[
 ('CLI：选择应用组合并启动',['dsh web / headless / sdk / acp','Profile = Bundle + Patch 组合','CLI 启动器不是终端聊天界面'],BLUE,None),
 ('Web：Client 与 Host 分工',['Client：模块加载、界面、交互','Connection：HTTP RPC + WS 流','Host：Gateway → SessionController'],GREEN,None),
 ('SDK：另一套 stdio 协议',['HarnessClient 持有运行时子进程','DeepSeekHarness 包装运行区间','JSON-RPC：请求 / 响应 / 通知'],AMBER,None),
 ('共享的领域能力',['AgentLoop / Tools / LlmRuntime','Agent：活动；Session：历史事实','不同 Profile 可以启用不同能力'],BLUE,None),
 ('ACP：独立协议接入分支',['标准 Agent Client Protocol 适配','不是 SDK method 的别名','不推导所有入口权限完全相同'],GREEN,None),
 ],'职责结构而非一条必经调用链；Web应用Remote与SDK协议分别接入领域能力。'),
 figure(2,'Web 的控制去程与状态回程',[
 ('Client 提交 Remote 调用',['remote.session.prompt(request)','Connection RPC 带 rpcId 与 args','模型提议与 Host 权限另分层'],BLUE,None),
 ('Host Connection → Gateway',['HTTP 信任与认证先决定 Peer','公开方法 / 参数 / 资源 / 访问检查','非 owner 可被 remote-access 拒绝'],AMBER,'控制去程'),
 ('SessionController → Agent',['解析 Session，必要时显式激活','prompt 入队 → accepted 回执','回执不表示模型或任务已完成'],GREEN,'业务命令'),
 ('AgentLoop → Session',['模型 / 工具执行，追加领域事实','实时 Assistant 帧另有 revision','内存事件不等磁盘屏障'],BLUE,'执行'),
 ('follow：先快照，再未覆盖增量',['监听先建立，再读 opening snapshot','cursor 与 live baseline 各自跟进','新连接重拉，不重跑历史工具'],GREEN,'状态回程'),
 ],'精选双向路径；真实Web流在 /api/remote.mux 上复用，课程实验使用明确的受控载体。'),
 figure(3,'SDK：回执、活动区间和进程',[
 ('客户端启动独立 Node 子进程',['选择 SDK Profile 或明确入口','stdout 只放换行 JSON-RPC 帧','持有者负责关闭与确认退出'],BLUE,None),
 ('initialize → 路由预检',['cwd / provider / model / capabilities','握手成功才允许 prompt','失败不暗换真实 Provider'],GREEN,'请求 / 响应'),
 ('session/prompt → messageId',['只确认这条消息进入 Inbox','通知无 id；响应关联请求 id','session.event 只报新追加事实'],AMBER,'入队'),
 ('选择等待边界',['run：回执到根 Agent 下一次 idle','wait：再检查受管后代与根级活动','结果不是单 Prompt 的因果凭证'],BLUE,'执行 / 通知'),
 ('shutdown → 清理 → 退出',['关闭子级与 Agent，释放写入者','客户端关闭阶梯确认进程退出','close 不删除持久 Session'],GREEN,'结束'),
 ('新客户端 resumeSession(savedId)',['相同存储 / 工作区，读取既有历史','恢复本身不提交新 Prompt','session(id) 只创建惰性句柄'],AMBER,None),
 ],'SDK时序摘要；本版本没有轮次中取消方法，不能编造session/cancel。'),
 figure(4,'四层状态，恢复对象分别核对',[
 ('Connection Generation',['客户端本地递增，旧源先排空','丢线 / 重连不等 Session 被删除','旧代际迟到 ready 不得覆盖新代'],BLUE,None),
 ('实时 Agent 与 Assistant Stream',['Agent 可 running / idle / 不存在','revision 是实时帧连续编号','缺帧 → 重建 baseline，不补造历史'],GREEN,None),
 ('Session 与持久化 Backend',['seq 是领域事件位置，不是连接号','历史查询可不激活 Agent','append / flush / writer close 分层'],AMBER,None),
 ('重连、Resume、新任务分开',['Web：重新获取快照与未覆盖增量','SDK Resume：取得历史并重建 Agent','新 Prompt 才开始新的输入工作'],BLUE,None),
 ('不能据界面或回执推导的结论',['收到 chunk 不等于完整回答已保存','断开不等于工作已停稳或已撤销','恢复历史不恢复旧外部资源句柄'],RED,None),
 ],'状态对照；控制回执、实时更新和持久确认不是同一事实。')]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('4 reproducible SVG figures generated')
