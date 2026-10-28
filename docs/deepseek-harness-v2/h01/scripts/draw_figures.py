"""H01 原创教学 SVG。只写入 H01 目录，中文字由 Chrome 使用系统字体栅格化。"""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
INK, LINE, BG = '#15394B', '#187A91', '#F3F9F8'
BLUE, TEAL, AMBER = '#DDEDF5', '#D9F4E9', '#FFF0D7'

def text(x, y, value, size=28, weight=400, anchor='middle'):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'

def box(x, y, w, h, fill, title, lines=()):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'
    s += text(x+w/2, y+43, title, 30, 700)
    for i, line in enumerate(lines): s += text(x+w/2, y+85+i*38, line)
    return s

def arrow(points, both=False):
    return f'<polyline points="{points}" fill="none" stroke="{LINE}" stroke-width="3" marker-end="url(#arrow)"'+(' marker-start="url(#back)"' if both else '')+'/>'

def save(fid, title, height, parts, subtitle):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{height}" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(subtitle)}</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker><marker id="back" markerWidth="9" markerHeight="9" refX="0" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M8,0 L0,4 L8,8" fill="{LINE}"/></marker></defs>
<style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style>
<rect width="640" height="{height}" fill="{BG}"/>
{text(320,55,title,32,700)}
{''.join(parts)}
</svg>'''
    (ROOT/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf-8')

# 职责关系图：嵌套不是网络部署边界。
p=[text(320,99,'同一个“读取说明 → 保存笔记”任务'),
   '<rect x="24" y="130" width="592" height="836" rx="24" fill="white" stroke="#187A91" stroke-width="3"/>',
   text(320,179,'Harness：组织运行环境',32,700),
   text(320,221,'模型接入 · 工具管理 · 运行记录'),
   '<rect x="46" y="250" width="548" height="530" rx="20" fill="#F3F9F8" stroke="#187A91" stroke-dasharray="8 5"/>',
   text(320,297,'Agent：围绕目标组织行动',30,700),
   box(78,326,484,130,BLUE,'LLM：提出下一步', ['比较说明，或提出保存调用']),
   arrow('200,456 200,520'),arrow('440,520 440,456'),
   text(145,497,'提议'),text(505,497,'反馈'),
   box(78,520,484,130,TEAL,'Runtime：控制怎样运行',['检查 · 分派 · 记录 · 停止']),
   arrow('320,650 320,700',True),
   text(320,744,'工具：通过检查后，实际操作'),
   text(320,833,'策略给出规则，程序落实边界',30,700),
   text(320,880,'模型输出“已批准”不等于授权'),
   text(320,926,'本图按职责组织，不是进程部署图')]
save('h01-01','建议如何变成一次受控行动',994,p,'LLM 提议经 Runtime 检查后才执行工具，反馈参与后续判断；Harness 提供组合与运行机制。')

# 对比图：不把 Stage 4 全貌等同于教学 A。
p=[box(36,104,568,136,BLUE,'循环主线',['模型提议 → 工具结果 → 再判断']),
   text(320,286,'任务变长后，还要回答什么？',30,700)]
rows=[('运行记录','停在哪里？哪些动作确实发生过？',TEAL),
      ('执行前把关','参数合格？有权执行？需要审批？',AMBER),
      ('故障与停止','继续还是停下？写入结果是否未知？',TEAL),
      ('上下文与状态','哪些历史进入下一次模型请求？',BLUE),
      ('能力组合','换模型、换工具，哪些规则继续复用？',BLUE)]
for n,(title,line,fill) in enumerate(rows):p.append(box(36,320+n*145,568,123,fill,title,[line]))
p += [text(320,1090,'实验 B 只演示前三项的内存缩影',28,700),text(320,1134,'Stage 4 已覆盖其中多项工程能力'),text(320,1178,'具备某项机制 ≠ 已证明可靠或安全')]
save('h01-02','循环是主线，工程还要补上什么',1212,p,'从循环主线扩展到运行记录、执行前把关、故障停止、上下文状态和能力组合。')

# 协作图：外侧两条线不穿过内侧卡片，Session 不被误画为唯一尾节点。
p=[text(320,98,'默认实现的职责协作，不是完整时序'),
   box(80,126,480,118,BLUE,'AgentRegistry',['通过登记的工厂委托创建']),
   arrow('320,244 320,304'),
   box(80,304,480,132,TEAL,'默认 AgentLoop',['推进步骤，协调下面四项能力']),
   arrow('108,436 108,522',True),arrow('366,436 366,522',True),
   text(216,485,'组装 / 返回'),text(492,485,'请求 / 输出'),
   arrow('80,370 18,370 18,877 42,877',True),
   arrow('560,370 622,370 622,877 598,877',True),
   box(42,522,260,178,BLUE,'SystemPrompt',['提示词片段','与工具说明']),
   box(338,522,260,178,BLUE,'LLM',['模型适配','与响应流']),
   box(42,790,260,178,TEAL,'Session',['追加运行事实','派生模型历史']),
   box(338,790,260,178,AMBER,'Tools',['登记与执行','策略与守卫']),
   text(320,746,'双向线：能力调用与数据返回'),
   text(320,1020,'模型输出先回循环，再进入工具服务',28,700),
   text(320,1064,'Session 记录贯穿运行，不是最后一步'),
   text(320,1110,'省略审批与存储提供方等扩展组件'),
   text(320,1155,'依据：固定 Commit 的架构文档与源码')]
save('h01-03','DeepSeek Harness 核心怎样协作',1188,p,'AgentRegistry 委托默认循环创建，循环与 SystemPrompt、LLM、Session、Tools 协作。')

manifest=[
 {'id':'h01-01','type':'职责关系图','purpose':'分开提议、执行与组织职责，避免严格部署层级误解','claims':['S01','S03','S04','S05','S06'],'caption':'图 1｜按职责理解四个词。'},
 {'id':'h01-02','type':'问题对照图','purpose':'从反馈循环推导工程需求；标清实验与 Stage 4 范围','claims':['S02','S05','S06','S07','S08','S09'],'caption':'图 2｜循环主线与工程能力。'},
 {'id':'h01-03','type':'模块协作图','purpose':'建立接口与服务地图，阻止模型直接执行工具和日志尾节点误读','claims':['S03','S04','S04a','S05','S06','S07','S08','S08a'],'caption':'图 3｜锁定版本的核心协作概览。'},
]
for f in manifest:
 f['source']=f"figures/source/{f['id']}.svg";f['image']=f"figures/rendered/{f['id']}.png"
 f['rendererPath']=f"/course-media/harness-v2/h01/{f['id']}.png"
 f['origin']='AI Foundry 原创教学重绘；未复制官方图片；事实见源码核对清单'
(ROOT/'evidence/figures.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('3 reproducible SVG sources and figure manifest generated')
