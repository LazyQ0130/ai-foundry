from pathlib import Path
from xml.sax.saxutils import escape
HERE=Path(__file__).resolve().parents[1]
specs=[
 ('event-log','事实、读模型与执行边界',[
 ('runtime','Agent / Scope / 当前控制信号',['Factory准备并发布运行对象','Turn → Step → 请求Attempt']),
 ('fact','Session.append 接纳事实',['检查归属 → 无损快照 / 冻结','验证Surface计划 → push → 通知']),
 ('view','三个并列读法',['Surface → deriveMessages','Projection → 业务state / view','header / toolHistory → 请求封装']),
 ('runtime','当前模型请求 / 受控Adapter',['普通失败 → attempt → 恢复链','成功 → assistant/message']),
 ('runtime','成功提议才进入工具批次',['登记call → prepare / dispatch','等待主体 → 模型序result']),
 ('fact','结果进入后续Step历史',['下一请求从当时前缀派生','工具效果不由日志自动回滚'])]),
 ('persistence','保存、持权重读与分支',[
 ('fact','Session已提交事件',['内存已接受；不是物理同步','只有活writer才路由到缓冲']),
 ('runtime','Handle持写权 / 路由排空',['Session或服务flush：','drainLive → handle.flush']),
 ('durable','后端屏障成功的前缀',['通用append允许延后物理写','JSONL批次write + sync更强']),
 ('runtime','close / 新后端open(write)',['等待排空并释放所有权','取得新写权 → read有效前缀']),
 ('fact','开放语义修复 / 新生命周期',['缺结果 → Step / Turn结束','构造marker → 发布新Agent']),
 ('view','独立选择：Resume 或 Fork',['Resume重建已有身份继续','Fork含切点 → 子marker / closer','普通Fork不自动持久或委派'])]),
 ('compaction-retry','输入取舍与请求恢复',[
 ('view','Meter测当前Surface及封装',['W容量 / O预留 / B余量','T=floor(min(W×ratio,W−O−B))']),
 ('runtime','常规压力 / 路由切换 / Overflow',['各入口条件和失败处理不同','选区保护system首节点与工具对']),
 ('fact','压缩事实与Surface双层',['start → 辅助摘要 → 重验','summary → user replace → end','原始事件保留；非整体回滚']),
 ('runtime','失败Attempt → request-error',['normal：资格 / 预算 / 退避','always：先等下游，无成功保证']),
 ('runtime','谁接手取决于Waterfall',['Basic预算独立且要求输入进展','注册顺序可改变恢复决定']),
 ('view','同Step重新prepare / derive',['不重接用户，不重跑所有工具','retry仅计划；started仅等待完成'])]),
 ('cancel-recovery','取消与未知副作用',[
 ('runtime','cancel发信号 / 默认清Inbox',['keepInbox仅保留待处理输入','请求发出不等于完全停稳']),
 ('runtime','观察并转发signal',['Adapter / Retry / Compaction','工具停止补位，已启动先排空']),
 ('fact','按实际分支结算',['安全文本前缀或attempt','已有结果保留；未派发合成失败','Step / Turn闭合后whenIdle']),
 ('runtime','Handle.dispose继续生命周期退出',['Scope → writer.close → 撤登记','无通用强杀或外部回滚保证']),
 ('fact','中断前缀的保守恢复',['无call：NOT_STARTED','有call缺结果：UNKNOWN','不覆盖已知结果，不重放旧工具']),
 ('external','核外部状态再决定下一步',['只读 / 外部强制幂等键 / 核对','非幂等未知：请决定或停止'])])]
colors={'runtime':'#dceff6','fact':'#e0f3eb','view':'#e4ecff','durable':'#fff1cf','external':'#fbe4df'}
for name,title,panels in specs:
 height=180+sum(88+len(lines)*39 for _,_,lines in panels)+55*(len(panels)-1)+90
 y=135;parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}"><title>{escape(title)}</title><rect width="640" height="{height}" fill="#f5fafb"/><style>text{{font-family:Microsoft YaHei,Arial,sans-serif;fill:#123849;font-size:28px}}.title{{font-weight:bold;font-size:32px}}.head{{font-weight:bold}}</style><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#087e92"/></marker></defs><text class="title" x="30" y="48">{escape(title)}</text><text x="30" y="94">职责路径；分支/回环见配套流程图</text>']
 for i,(kind,head,lines) in enumerate(panels):
  bh=88+len(lines)*39
  parts.append(f'<rect x="30" y="{y}" width="580" height="{bh}" rx="16" fill="{colors[kind]}" stroke="#8db4be"/><text class="head" x="50" y="{y+43}">{escape(head)}</text>')
  for k,line in enumerate(lines):parts.append(f'<text x="50" y="{y+86+k*39}">{escape(line)}</text>')
  y+=bh
  if i<len(panels)-1:parts.append(f'<path d="M320,{y+6} L320,{y+45}" stroke="#087e92" stroke-width="4" marker-end="url(#a)"/>');y+=55
 parts.append(f'<text x="30" y="{height-33}">固定 f3803c9；保证均依赖正文条件</text></svg>')
 p=HERE/f'figures/source/{name}.svg';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(''.join(parts),encoding='utf-8')
print('4 SVG source diagrams generated')
