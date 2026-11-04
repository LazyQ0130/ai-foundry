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
 text(s,32,h-28,'固定 f3803c9 · 图中边界以正文为准');s.append('</svg>');p=f'figures/source/h19-0{n}.svg';(R/p).write_text('\n'.join(s),encoding='utf-8');return {'id':f'h19-0{n}','source':p,'image':f'figures/h19-0{n}.png','rendererPath':f'/course-media/harness-v2/h19/h19-0{n}.png','caption':caption}
fig=[]
s=begin('日志保留，模型窗口可以缩短',1390)
y=box(s,100,'完整 Event Log：只追加事实',['旧 user / assistant / tool 仍保留','新增 start → summary → replace','最后追加 end；不删除原文'])
y=arrow(s,y,'折叠')
y=box(s,y,'当前 Surface：按位置替换',['原节点：[system, 5, 8, …, 29, 32]','替换后：[system, 37, 32]','高 Seq37 回到旧范围的位置'],GREEN)
y=arrow(s,y,'派生')
y=box(s,y,'deriveMessages → 后续请求',['system：生效指令','user：带标签的摘要检查点','assistant：保留的近期回答'])
y=box(s,y+30,'summary 本身仅写日志',['来源：[start35, summary36,','               5, 8, 15, 16, 23, 24, 29]','模型不把每个事件都读作消息'],AMBER)
y=box(s,y+30,'JSONL 保存后，新实例重建',['显式 flush；关闭 Agent 和后端','Resume 重建相同模型历史','不再调用旧模型或旧工具'],GREEN)
fig.append(save(1,s,1390,'综合X真实位置：旧事实不删；37是摘要user替换，36是仅日志summary。保存后由新后端实例Resume核对。'))
s=begin('先测量，再决定是否缩减历史',1610)
y=box(s,100,'来源必须分开标注',['W：适配器声明的窗口容量','O：会话输出预留；B：额外余量','压力 P：TokenMeter.measure'])
y=box(s,y+30,'常规阈值与保留预算',['T = floor(min(W × ratio, W−O−B))','R = floor((W−O) × retainRatio)','不是只看 UI 中的一个百分比'],GREEN)
y=box(s,y+30,'例：W10000 / O1000 / B2000',['ratio0.8 → T7000；P7000触发','retainRatio0.16 → R1440','B 默认65536：小窗口需重配'],AMBER)
y=arrow(s,y,'P ≥ T')
y=box(s,y,'先修剪，再重新测量',['可选 Pruner：无需额外模型请求','低于T → 结束；否则选择平衡前缀','保护system首节点与近期尾部'])
y=box(s,y+30,'摘要后仍要重新测量',['摘要输出上限另叫 maxTokens','P仍高 → 有界收敛尝试','不可分单元或固定封装仍可能过大'],GREEN)
y=box(s,y+30,'三个入口要分开',['pre-step：失败警告后继续','模型切换：不达标则拒绝目标请求','overflow：忽略通常保留，进展后重试'],RED)
fig.append(save(2,s,1610,'数字来自resolveCompactSpec。Usage锚点、路由价格和固定启发式共同形成measure；UI参考值不替代该决策。'))
s=begin('一次压缩尝试，事实逐条提交',1510)
y=box(s,100,'同步验证，先登记开始',['范围有效、配对平衡、没有活动锁','compaction/start：数字Turn或null','此后才允许异步摘要让出控制权'])
y=arrow(s,y,'辅助调用')
y=box(s,y,'摘要请求 purpose=compaction',['回放system、选区、工具声明','另加摘要指令；不是用户任务Step','取消 / 失败：保留已提交事实'],GREEN)
y=box(s,y+30,'重验稳定性与缩减幅度',['自动：整个Surface仍相同','手动：选中span仍相同','带框摘要必须严格小于所选价格'])
y=box(s,y+30,'成功的同步相邻提交',['summary（仅日志，含来源与原输出）','user/message replace（改变Surface）','end（仅日志，结束尝试）'],GREEN)
y=box(s,y+30,'失败与结束的不同结果',['summary失败 → 尝试写error end','replace失败 → summary可能已留下','end失败 → 不重试闭合，保留活动锁'],AMBER)
y=box(s,y+30,'检查点由调用路径决定',['手动：闭合尝试后等待Session flush','自动区域：本函数不执行flush','没有真实后端就不能宣称已落盘'],RED)
fig.append(save(3,s,1510,'有日志标记的尝试，不是能整体回滚的数据库事务。end-seed之前的残留start视为旧生命周期证据。'))
s=begin('三种缩减，各自保留什么？',1300)
y=box(s,100,'工具结果修剪：语法式头尾',['条件：文本码点数超过阈值','prune → 新tool/result replace','不调用模型；中间重要信息可能丢失'])
y=box(s,y+30,'历史摘要：抽取较早语义',['start → 辅助LLM → summary','user/message replace → end','保留近期平衡尾部；摘要有成本'],GREEN)
y=box(s,y+30,'图片省略：按出现位置决定',['IMAGE_OFFLOAD_REQUIRED → 选图','image/offload → 消息投影','节点不换；以后请求使用占位文本'],AMBER)
y=box(s,y+30,'相同附件，不等于相同位置',['(消息Seq, 图片index) 精确定位','旧位置不会因换大窗口自动恢复','原附件引用和原事件仍保留'])
y=box(s,y+30,'共同边界',['模型输入减少 ≠ 原始存储变小','重建需相同解释规则与事件','成本、缓存收益需真实Provider测量'],RED)
fig.append(save(4,s,1300,'Pruner字符按Unicode码点，Token启发式按UTF-16；图片是持久投影决定，不是摘要或物理删附件。'))
(R/'evidence/figures.json').write_text(json.dumps(fig,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 H19 SVG sources generated')
