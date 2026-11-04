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
    path=f'figures/source/h21-0{n}.svg';(R/path).write_text(svg,encoding='utf-8')
    return {'id':f'h21-0{n}','source':path,'image':f'figures/h21-0{n}.png','rendererPath':f'/course-media/harness-v2/h21/h21-0{n}.png','caption':caption}
def t(x,y,label,size=28,bold=False):return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>'
figures=[figure(1,'委派能力：谁负责哪一层',[
 ('父 Agent 与模型工具',['Tool Registry 控制声明和可见性','模型提议 → 官方委派工具调用','工具只先返回 childId'],BLUE,None),
 ('Subagent Runtime',['ctx.subagents：具名 Provider 注册','验证能力、精确父身份与请求','内部 Manager 承担统一管理'],GREEN,'调用'),
 ('Provider 提供不同后端',['本地：只准备空 seed 或历史 seed','外部：start 返回一次执行句柄','不是所有后端都能继续收消息'],AMBER,'按名选择'),
 ('Manager 与 Agent Factory 协作',['Manager 持有容量、身份与 Handle','通过 agents.create / resume 创建','Factory 才负责真实 Agent 初始化'],BLUE,'本地分支'),
 ('子级执行及回传',['子级有自己的 Agent、Scope、Session','Manager 捕获结果、等待资源清理','parent 通知 / caller 直接取结果'],GREEN,'管理执行'),
 ],'职责与协作图；不是完整时序。Provider不直接创建本地Agent；Factory与委派服务是两个能力。'),
 figure(2,'Spawn 与 Fork：只选一次历史',[
 ('父级正处于 Turn 2',['Turn 1 已完成：Seq0～10','Turn 2 当前输入与流：仍未完成','图中数字来自实践 C 的受控轨迹'],BLUE,None),
 ('Spawn：全新 Session',['继承父级事件数 = 0','descriptor → 初始任务入 Inbox','提示词须包含子任务所需材料'],GREEN,None),
 ('Fork Subagent：已完成前缀',['继承 Seq0～10，共11条','Seq11 end-seed，Seq12 descriptor','随后才是子级任务与自己的 Turn'],AMBER,None),
 ('快照以后，各自追加',['父级结束 Turn 2，不会自动同步','子级独立写自己的回答与工具结果','新 Scope；历史不授予工具权限'],GREEN,None),
 ('普通 Session Fork 另有规则',['可以选择当前开放轮次内的切点','分支合成闭合，不自动加入子目录','不能把 H18 切点规则套给 Provider'],RED,None),
 ],'历史对比图；没有持续同步箭头。没有任何已完成Turn时，Fork Provider也返回空seed。'),
 figure(3,'Activation 与两种结果交付',[
 ('准入与接受初始任务',['选 Provider → 检查能力与深度','预留容量 → 创建 → Inbox 接受','start 事件可能早于消息接受'],BLUE,None),
 ('startActivation 返回',['childId / 本地 messageId','result Promise / dispose()','委派工具此时只给 started subagent'],AMBER,'返回回执'),
 ('后台工作独立推进',['父级可继续当前 Turn 或回 idle','子级运行，可能收到后续消息','自然结算需查 Inbox 和所拥有后代'],GREEN,'后台执行'),
 ('捕获、清理、再交付',['本地最终 flush 为尽力而为','捕获结果 → 释放 Handle → 归还槽','资源清理完成后才交付结果'],BLUE,'结算'),
 ('delivery = parent',['Manager 投递 subagent-settled 通知','父运行时 steer；父空闲时 queue','通知不是原委派工具的最终结果'],GREEN,None),
 ('delivery = caller',['调用者 await activation.result','不额外发送父级完成通知','两种方式都保留本地子目录事实'],AMBER,None),
 ('interrupt 与 dispose 分开',['interrupt 请求停当前工作并保队列','dispose 关闭本次及所拥有后代','result 与清理错误分层报告'],RED,None),
 ],'精选时序；两种delivery是互斥选择。显式dispose可提前走停止路径，不必等自然结束。'),
 figure(4,'Session、Scope 与所有权',[
 ('当前运行对象',['父 Agent ← Registry owner → 子 Agent','Manager 持有精确子 AgentHandle','运行树与历史谱系分别取证'],BLUE,None),
 ('共享 Host，不同 Agent Scope',['父局部工具 parent_only','子局部工具 child_only','共享服务不等于共享所有注册'],GREEN,None),
 ('两个持久 Session',['父：工具回执、relay、结算通知','子：descriptor、自己的执行事实','Fork 的继承前缀不算子级新工作'],AMBER,None),
 ('发现目录由父级拥有',['父 Session 写 subagent/catalog','读历史目录无需启动子 Agent','普通 Session 分支不会自动入册'],BLUE,None),
 ('同一 childId，不同执行期',['第一次结束：Agent 退出 Registry','持久 Session 留存，可冷恢复','下一次 Activation 有新的 runId'],GREEN,None),
 ('需要逐层核对的边界',['Scope 是注册及可见性机制','同进程不是独立 OS 安全沙箱','权限依赖真实组合和执行策略'],RED,None),
 ],'关系结构图；Registry owner、结构Fiber、持久parentSession、Activation持有者分层。图不授予权限或保证外部进程停稳。')]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('4 reproducible SVG figures generated')
