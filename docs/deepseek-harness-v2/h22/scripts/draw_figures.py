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
    path=f'figures/source/h22-0{n}.svg';(R/path).write_text(svg,encoding='utf-8')
    return {'id':f'h22-0{n}','source':path,'image':f'figures/h22-0{n}.png','rendererPath':f'/course-media/harness-v2/h22/h22-0{n}.png','caption':caption}
def t(x,y,label,size=28,bold=False):return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>'
figures=[figure(1,'一次审查的能力分层',[
 ('父 Agent → Workflow Tool',['模型提交 JavaScript + JSON meta','前台：等待整项结果再返回','后台：可选 Jobs 先回 jobId'],BLUE,None),
 ('WorkflowEngine 服务契约',['ctx.workflowEngine 单一实现','start → WorkflowRun 由调用者持有','不是具名 Provider 注册表'],GREEN,'调用'),
 ('PTC 引擎与独立受限进程',['guest 执行 agent / parallel / pipeline','Host Binding 跨边界传 JSON','VM 不是 OS 沙箱；文件策略另管'],AMBER,'真实执行'),
 ('Subagent Runtime → 子级 A / B / C',['整次运行选一个 subagentProvider','每个子级使用 caller delivery','所有子级归同一个确切父 Agent'],BLUE,'启动与等待'),
 ('四种任务抽象按生命周期组合',['Workflow：本次依赖与聚合','Jobs：后台工作与输出游标','Goal：目标推进；Schedule：定时触发'],GREEN,None),
 ],'职责结构；进程边界只标在 PTC 层。Goal 与 Schedule 可组合，不是 Workflow 的内置阶段。'),
 figure(2,'并发、逐项依赖与汇总屏障',[
 ('parallel：独立工作同时推进',['输入 [A, B]；先完成 B，再完成 A','输出仍然 [A结果, B结果]','并发槽限制 agent，不限制普通函数'],BLUE,None),
 ('pipeline：每项内按顺序',['A1 → A2；B1 → B2','A2 可以早于 B1 完成而开始','回调收到 previous、item、index'],GREEN,None),
 ('A 与 B 都结束后，才能做 C',['const [a,b] = await parallel(...)','这次 await 才建立汇总屏障','再 pipeline([{a,b}], stageC)'],AMBER,None),
 ('phase 只描述进度',['phase("Synthesize") 不会等待 A/B','必须由 await 写清真实依赖','普通失败为 null，汇总前检查空值'],RED,None),
 ],'关系对照；每项箭头表示该项内部 await，不表示不同条目的阶段锁。'),
 figure(3,'WorkflowRun 的结算与释放',[
 ('start 前：可以直接抛错',['meta / 解析 / Provider / 总量校验','未建立 run，不发布 workflow/start','脚本必须是 JavaScript 函数体'],BLUE,None),
 ('建立并持有 WorkflowRun',['发布 start → PTC → 子级 Activation','result 以 WorkflowResult 结算','completed / error / cancelled'],GREEN,'开始执行'),
 ('取消是请求，不是停稳证明',['cancel 发信号并请求释放已发布子级','在途 start 仍须等待并处理晚到句柄','同步切片限制不等于整项超时'],AMBER,None),
 ('驱动 finally 排空受管工作',['停止受管进程，等待 pending host call','dispose 已接受子级；补配对观察边','result 结算后发布 workflow/end'],BLUE,'结算清理'),
 ('持有者仍须 await dispose()',['重复调用共享同一个 Promise','清理异常存在警告分支','不保证任意不合作外部后端停稳'],RED,'统一出口'),
 ],'精选生命周期；校验失败不进入运行。普通子级任务失败可产生 null，不必变成工作流 fatal error。'),
 figure(4,'实时事件、Session 与后台路径',[
 ('workflow/*：实时观察',['start / end；phase / log','agent-start / agent-end','end 不携带最终 value'],BLUE,None),
 ('Tool 根调用：父 Session 日志',['tool-workflow/run-start 与 run-end','agent-start 与 agent-end','只写四类 log-only 记录'],GREEN,None),
 ('前台：最终工具结果进模型历史',['等待 result → dispose → ToolResult','只交聚合值，非子级全部历史','phase / log 不自动成为模型输入'],AMBER,None),
 ('后台：Jobs 拥有运行',['立即交 jobId / runId；输出环含 log','job_output 隐去 observer log','完成通知 / job_kill 由 Jobs 管理'],BLUE,None),
 ('持久事实不等于脚本检查点',['Session 可保留部分执行事实','本地 Job 表与句柄是进程内状态','重启不恢复 guest 栈或中间 Promise'],RED,None),
 ],'观察与记录的分路；仅根工具调用记录四类日志，未画成所有 workflow 事件自动持久化。')]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('4 reproducible SVG figures generated')
