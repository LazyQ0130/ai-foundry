from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1];(R/'figures/source').mkdir(parents=True,exist_ok=True)
INK='#15394B';BLUE='#DDEDF5';GREEN='#D9F4E9';AMBER='#FFF0D7';RED='#FCE5E3';GRAY='#E9EDF1'
def t(x,y,label,size=28,bold=False):return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{INK}" font-family="Microsoft YaHei">{escape(label)}</text>'
def figure(n,title,cards,caption):
 y=110;parts=[]
 for heading,lines,color,edge in cards:
  if parts and edge:
   parts.append(f'<path d="M320 {y} V{y+52}" stroke="#187A91" stroke-width="3" fill="none" marker-end="url(#a)"/>');parts.append(t(350,y+33,edge));y+=78
  h=72+42*len(lines);parts.append(f'<rect x="32" y="{y}" width="576" height="{h}" rx="15" fill="{color}" stroke="#78A7AC"/>');parts.append(t(52,y+43,heading,30,True))
  for i,line in enumerate(lines):parts.append(t(52,y+87+42*i,line))
  y+=h+24
 height=y+80
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img"><title>{escape(title)}</title><defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10" fill="none" stroke="#187A91" stroke-width="2"/></marker></defs><rect width="640" height="{height}" fill="#F3F9F8"/>'+t(32,57,title,32,True)+''.join(parts)+t(32,height-28,'固定 f3803c9 · 实测范围与限制见正文')+'</svg>'
 path=f'figures/source/h24-0{n}.svg';(R/path).write_text(svg,encoding='utf-8')
 return dict(id=f'h24-0{n}',source=path,image=f'figures/h24-0{n}.png',rendererPath=f'/course-media/harness-v2/h24/h24-0{n}.png',caption=caption)
figures=[figure(1,'测试金字塔：证据逐层扩展',[
 ('小对象：函数、组件、合同',['真实 Cordis / 官方单组件','C：Tool 管线、Loader 合同','低成本；未连接的边界仍未知'],BLUE,None),
 ('D：真实多组件的局部链',['作者 YAML → Loader / AppBoot','SDK / Loop / Tools / JSONL','模型受控；不是完整发行树'],GREEN,'连接起来'),
 ('E：完整交付 Profile 入口',['正式 lib / exports / Node 入口','Keyless Mock Provider 可独标','本轮 E 正向集成：未验证'],GRAY,'补发行边界'),
 ('不同产品入口，各自留证',['CLI / SDK / ACP / 产品 Web','真实浏览器 ≠ jsdom / 教材预览','局部成功不自动互相覆盖'],AMBER,None),
 ('外部 Provider 再单独检验',['真实模型、互联网、用量与账单','无密钥 E 不等真实 Provider E2E','测试数量与覆盖率都非正确率'],GRAY,None),
 ],'课程A–E是证据级，不是官方测试车道的同名定义；动态最高D。'),
 figure(2,'真实加载与受控回放链',[
 ('真实作者 Profile / Loader',['manifest + YAML / inject / ACTIVE','不是手工 prepare 挂核心服务','不是完整 base / sdk-minimal'],GREEN,None),
 ('受控模型边界，按场景选择',['MockAdapter 或官方 LLM Replay','真实 Runtime + HTTP Mock Server','脚本固定；不测模型判断质量'],AMBER,'加载后'),
 ('真实 AgentLoop → Tools',['Turn / Step / Request / Attempt','固定 safe 参数与授权目录','工具 body / guard 分开观察'],GREEN,'模型提议'),
 ('Session / JSONL 与外部文件',['CallId → Tool Result → 下一请求','日志关闭后恢复并 deriveMessages','独立重读 config 与未修改文件'],GREEN,'实际执行'),
 ('不可变预期，分别比较',['Session Snapshot / 身份规范化','prompt / schema sidecar 完整比较','workspace.expected；不自动刷新'],BLUE,'对照证据'),
 ],'绿色是真实官方组件；黄色是受控模型/故障边界；原始证据不由作者报告替代。'),
 figure(3,'事件时间线：先选同一次运行',[
 ('D1：受控恢复，SDK 已接纳',['Request 1 → 429 / RATE_LIMIT','llm/retry → llm/retry-started','Retry-After 线值 1 秒，明确接受'],AMBER,None),
 ('D1：下一 Attempt 与工具',['Request 2 → write_fixture 提议','tool/call → tool/result，CallId 对齐','Request 3 真实输入包含工具结果'],GREEN,'恢复'),
 ('D1：闭合与独立读回',['Turn completed；shutdown 响应','等实际进程 exit0，再读完整 JSONL','新 Session 消息前缀等于模型输入'],BLUE,'检查终态'),
 ('D4：另一场景，工具失败对照',['工具 isError，模型仍自称已修改','目标文件不存在，writes 为 0','测试 PASS；任务验收 NO-GO'],RED,None),
 ('诊断的不同观察面',['Session：已记录事实；Client：通知','实时 raw 与历史结果可见性不同','Trajectory 是视图；本地日志非上传'],BLUE,None),
 ],'D1恢复链与D4失败对照分别画出；没有虚构一个聚合故障轨迹。'),
 figure(4,'从 C/D 走向产品验收',[
 ('已执行：限定范围的 C/D',['23 项 = C9 / D14；X 复用 D1','真实 SDK 子进程 / JSONL / 回环','作者核心 YAML；模型与工具受控'],GREEN,None),
 ('已知 P1：默认退出未闭合',['SDK + HTTP：Windows 原生断言','测试 exit 钩子可自然退出','钩子通过不覆盖默认分支'],RED,None),
 ('缺口：正式完整应用 E',['built / 发行 Profile 正向未运行','ACP / 产品 Web 需各自入口证据','教材 Chrome 检查不能冒充产品'],GRAY,None),
 ('缺口：外部与实际效果',['真实 Provider / 性能 / 计费','真实学员试读、耗时、独立外审','均未验证，不能靠数量补齐'],GRAY,None),
 ('验收矩阵与四项硬门禁',['越权 / 未批准写入必须为 0','取消后新动作 / 虚报验证为 0','已知 P0 / P1 → NO-GO'],BLUE,None),
 ],'已有绿色证据保留，已知P1与未验证项分别记录；本轮整体NO-GO。')]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('4 reproducible SVG figures generated')
