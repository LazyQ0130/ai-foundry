# Executed in author.py's namespace. Content is authored specifications, not LLM-generated at runtime.
exec(compile((OUT/'scripts/specs.py').read_text('utf-8'),'specs.py','exec'))
exec(compile((OUT/'scripts/specs_advanced.py').read_text('utf-8'),'specs_advanced.py','exec'))
exec(compile((OUT/'scripts/figure_specs.py').read_text('utf-8'),'figure_specs.py','exec'))
exec(compile((OUT/'scripts/concepts.py').read_text('utf-8'),'concepts.py','exec'))
assert len(LESSONS)==30

def file_symbols(path):
    text=(SOURCE/path).read_text('utf-8')
    names=re.findall(r'^export\s+(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:class|function|interface|type)\s+(\w+)',text,re.M)
    return '、'.join(dict.fromkeys(names))[:180] or '声明配置/模块入口（无可调用函数）'

def stage_link(key):
    return f'[{key}](/lesson/stage-{key[1]}/{key})'

def test_cite(path):
    text=(SOURCE/path).read_text('utf-8')
    # First test/describe provides a precise entry, not a claim of runtime execution.
    match=re.search(r'^\s*(?:it|test|describe)(?:\.[\w.]+)?\(',text,re.M)
    needle=text[match.start():].splitlines()[0].strip() if match else ''
    return cite(path,needle)

stage_audit={}
for key in STAGE_DEPTH:
    path=ROOT/f'course-content/stage-{key[1]}/{key}.md'
    text=path.read_text('utf-8'); lines=text.splitlines()
    stage_audit[key]={'path':path.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
      'objective':re.search(r'^objective:\s*"(.*)"$',text,re.M).group(1),
      'objectiveLine':next(i+1 for i,s in enumerate(lines) if s.startswith('objective:')),
      'headings':[{'line':i+1,'text':s} for i,s in enumerate(lines) if s.startswith('## ')],
      'depthAssessment':STAGE_DEPTH[key]}
write('evidence/stage-audit.json',json.dumps(stage_audit,ensure_ascii=False,indent=2))

figure_rows=[]
for l in LESSONS:
    n=int(l['id'][1:])
    for i,(kind,title,purpose,structure) in enumerate(FIGS[n],1):
        fid=f"{l['id']}-{i:02}"
        figure_rows.append(dict(id=fid,lesson=l['id'],kind=kind,title=title,purpose=purpose,structure=structure,
           alt=f'{title}：{structure.replace("；","，")}',caption=f'{title}。{purpose}。',
           status='GENERATED_SAMPLE' if fid in ['H01-01','H03-01','H06-01','H10-01'] else 'PLANNED',
           sourceRefs=[ref(p,n)['id'] for p,n,_ in l['routes']]))
write('evidence/figure-plan.json',json.dumps(figure_rows,ensure_ascii=False,indent=2))

a=['# 《深入 DeepSeek Harness：从 Agent 原理到复杂智能体架构》研发蓝图 V2.0',
f'作者基线：2026-10-28；源码 Commit `{COMMIT}`；文档状态：内部研发设计，非正式 30 讲正文。',
'''## 定位与学习成果

课程以真实源码的问题驱动阅读为主。学员完成后应能用证据解释一次请求如何组装、执行、受策略约束并恢复；能够定位扩展点、追踪资源所有权、辨别日志与投影，并对未经验证的结论保留边界。阅读不追求全仓覆盖，也不以重新翻译官方文档或复刻完整 Agent 产品作为成果。

核心 H01–H24 构成六个四讲模块，拓展 H25–H30 分支深化。先宏观追踪，再建立插件语言，然后逐段进入引擎、工具、日志、协作与工程门禁。H03 是导航级主线，H10/H11/H12 才分别细读循环、请求与流；H16 是能力地图，H27 才细读 MCP；H24 建证据方法，H29 才做观测归因，避免重复。

入学不以购买 Stage 1–4 为条件。可通过免费随文基础回顾及本目录 Mock 实验补足必需知识；原课链接仅供已有权限者选学，不复制受保护大段正文。TypeScript 的 import/export、联合类型、泛型、async/await、AsyncIterable、try/finally 为额外阅读门槛，H02/H05/H12 提供 10–20 分钟可选补课卡。

## 先修图谱与学习路线

```mermaid
flowchart TD
  S1[需求、复现、diff 与版本] --> H2[H01-H04 全貌与入口]
  S2[HTTP、校验、持久化与身份] --> H5[H05-H08 插件与组合]
  H2 --> H5 --> H9[H09-H12 核心引擎]
  S3[Provider、流、Context 与评估] --> H9
  H9 --> H13[H13-H16 工具与边界]
  S4[受限 Loop、审批、MCP、Run/Step] --> H13
  H13 --> H17[H17-H20 日志与可靠性]
  H17 --> H21[H21-H24 协作与综合证据]
  H21 --> H25[H25 插件]
  H21 --> H26[H26 Provider]
  H21 --> H27[H27 MCP]
  H27 --> H28[H28 浏览器/桌面]
  H21 --> H29[H29 可观测性]
  H21 --> H30[H30 Monorepo/CI]
```

每个模块以一项零 API 费用的小实验验收。按逐讲区间加总，核心约 37.5–51.3 小时，拓展约 11.3–15.5 小时；这是含阅读和实验的估算，非课时承诺。H10/H11/H14/H15/H18/H19/H20 建议分两次，H22 分三段，不以压缩安全或异常分支来凑课时。

## 30 讲目录

| 编号 | 模块 | 课题 | 预计时长 |
| --- | --- | --- | --- |''']
for l in LESSONS:a.append(f"| [{l['id']}](#{l['id'].lower()}) | {l['module']} | {l['title']} | {l['time']} |")
a.append('''
## 逐讲设计的阅读约定

以下每讲 20 个字段均为研发规格。源码入口是固定 Commit 的真实链接，引用编号可在 B 报告及 source-index.json 中查回；链接行区间是阅读锚点，函数较长时继续读到函数结尾。具体调用链只描述选定主线，不宣称所有组合都必经同一实现。字段 11 同时包含数据结构、分段精读与设计取舍。字段 15 的答案是思考题要点，实践完整参考方案另见 G。

验证层级：`STATIC_VERIFIED` 是文件、符号、相关逻辑及测试位置的静态核对；实际执行证据只认 evidence 中的记录。禁止把“定位了测试”写成“官方测试通过”。''')
for l in LESSONS:
    n=int(l['id'][1:]); stages=l['stage'].split(',')
    route='\n'.join(f"{i}. {cite(p,needle)} — `{needle or file_symbols(p)}`；{why}。" for i,(p,needle,why) in enumerate(l['routes'],1))
    docs='、'.join(cite(p,'',10) for p in l['docs'])
    figs='；'.join(f"{r['id']} {r['kind']}《{r['title']}》：{r['purpose']}" for r in figure_rows if r['lesson']==l['id'])
    tests='\n'.join('- '+test_cite(p) for p in l['tests'])
    a.extend([f"\n## {l['id']}\n\n### 1. 课程编号\n\n{l['id']}（{'核心' if n<=24 else '拓展'}）。",
       f"### 2. 课程名称\n\n{l['title']}",f"### 3. 所属模块\n\n{l['module']}",
       f"### 4. 推荐前置知识\n\n{l['pre']}。",f"### 5. 与 Stage 1–4 的对应关系\n\n{'、'.join(stage_link(s) for s in stages)}。基础回顾约 {REVIEWS[n][0]} 分钟：{REVIEWS[n][1]}\n\n旧课深度：{STAGE_DEPTH[stages[0]]}本讲增量：{REVIEWS[n][2]}。无原课权限者使用 C 手册自足回顾。",
       f"### 6. 本节要解决的真实工程问题\n\n{l['problem']}",f"### 7. 本节唯一核心目标\n\n{l['goal']}",
       f"### 8. 重点技术概念\n\n{l['concepts']}。",f"### 9. 需要额外解释的难懂术语\n\n{l['terms']}。首次出现使用 C 手册七步结构，先问题后定义。",
       f"### 10. 推荐的通俗讲解案例\n\n{l['case']}类比之后必须指出边界，不把故事当实现证据。",
       f"### 11. 官方源码文件及关键函数\n\n先读官方材料：{docs}。\n\n{route}\n\n**重要数据结构：**{l['structures']}\n\n**关键代码分段讲法：**{l['explain']}\n\n**实际调用链：**{l['chain']}\n\n**设计取舍：**{l['trade']}",
       f"### 12. 推荐源码阅读顺序\n\n按字段 11 的 1→{len(l['routes'])} 阅读。每一步先写输入、输出、状态变化和失败分支，再按“为什么”的理由转入下一文件；先读契约再读实现，最后对照下面的测试。不要通读包内所有文件。",
       f"### 13. 主要架构图或教学配图\n\n{figs}。完整结构、alt 和制作状态见 D。",
       f"### 14. 小规模实践任务\n\n{l['lab']}完整参考路径和预期输出见 [G 实践手册](G-exercises-and-answers.md#{l['id'].lower()})；全部标为教学简化。",
       f"### 15. 思考题与参考答案要点\n\n{l['question']}\n\n参考答案：{l['answer']}",
       f"### 16. 关键风险及常见误解\n\n{l['risk']}",f"### 17. 验收方式\n\n{l['accept']}\n\n对应官方测试（已定位并静态核对，非声称本轮运行）：\n\n{tests}",
       f"### 18. 预计学习时长\n\n{l['time']}；包含基础回顾、源码、实验与核对，不含安装/网络等待。",
       f"### 19. 与前后课程的衔接\n\n{l['bridge']}",
       f"### 20. 源码依据与验证状态\n\n固定 Commit `{COMMIT}`；上述文件/符号/测试引用为 STATIC_VERIFIED。{('H06 的 Cordis、H07 的监听器回收、H17 的 detached Session 以及 H13–H15 原生内存工具流水线有库级实际探针；精确范围见 official-probes.json。' if n in [6,7,13,14,15,17] else '本讲端到端官方运行未验证；教学实验通过也不替代官方集成。')}真实 Provider、原生沙箱、完整官方测试及真实 GUI/跨进程恢复仍未运行。"
    ])
write('A-blueprint-v2.md','\n\n'.join(a))

c=['# 知识复习与概念讲解手册',
'''## 如何使用基础回顾

正文用一段 3–8 分钟的“你可能已经做过”回顾连接新问题。复习只包含当讲所需的旧模型与一个对比问题；大段细节放在 deepdive。未购买原课者也能靠本课免费回顾与 Mock fixture 继续，不要求重新开通。原课链接沿现有 `/lesson/:stageSlug/:lessonId`，访问仍由平台原权限判断；本轮不修改这些权限。

调查覆盖 Stage 1 正式 6 讲、Stage 2 的 8 讲、Stage 3 的 7 讲、Stage 4 的 8 讲，另有不计数的 s1-l0。依据是当前正文的目标、解释段落、故障任务和验收，不把蓝图或目录当正文事实。原课路径/目标行号/全篇哈希/标题清单保存在 evidence/stage-audit.json。Capstone 采用产品问题→契约/架构→任务→故障验证→限制说明的体例，示例核对 C3/C5 的私有资料、状态与失败恢复教学；不把 Capstone 设为强制前置。

## 既有课深度审计

| 原课 | 实际教到的深度 | 新课不能默认已学 |
| --- | --- | --- |''']
for k,v in STAGE_DEPTH.items():
    item=stage_audit[k]
    c.append(f"| {stage_link(k)} · [{item['path']}:{item['objectiveLine']}](../../{item['path']}) | {v} | Cordis/事件溯源/PTC/多编译图均需按本课重新解释 |")
c.extend(['''
## H01–H30 知识衔接矩阵

“基础回顾”自足，原课链接都是可选。每行的新增目标由固定源码支持；没有对应旧课的 Cordis/Surface/Activation 等内容属于首次教学。

| 新课知识点 | 已有 Stage 与深度 | 复习什么 / 时长 | 新增什么 | 原课入口是否值得提供 |
| --- | --- | --- | --- | --- |'''])
for l in LESSONS:
    keys=l['stage'].split(',')
    review=REVIEWS[int(l['id'][1:])]
    c.append(f"| {l['id']} {l['concepts']} | {'；'.join(k+'：'+STAGE_DEPTH[k] for k in keys)} | {review[1]} / {review[0]} 分钟 | {review[2]}；目标：{l['goal']} | 值得，{'、'.join(stage_link(k) for k in keys)}，可选、仍需原课权限 |")
c.extend(['''
## 首次概念的七步教学卡

卡中的缩影一律是**教学简化**，不是官方兼容 API。正式课首次遇到概念时按问题→类比→定义→真实代码→类比局限→图/案例→检查问题展开；无需机械地把七个小标题全部展示给学生。对未列入的新增术语也须按同一标准补卡。以下每张都有固定源码入口。'''])
for term,lesson,problem,analogy,definition,p,needle,boundary,mini,check in CONCEPTS:
    c.extend([f'### {term} · {lesson}',f'1. **先说解决什么：**{problem}',f'2. **类比：**{analogy}',f'3. **技术定义：**{definition}',f'4. **回到源码：**{cite(p,needle)}。沿该函数/类型和 A 蓝图所列调用链核对，不把类比当设计动机。',f'5. **类比边界与常见误解：**{boundary}',f'6. **教学简化图/代码：**`{mini}`。关联图按 D 的对应课时索引；运行案例见 G。',f'7. **检查理解：**{check}'])
c.append('''
## 贯穿案例怎样递进

用虚构“研究一份公开技术说明”的任务串起 H01/H03/H10/H14/H17：先只有问题与模型回答，再增加一次只读搜索，再观察工具准入和结果，最后从日志重建。H15 加入“想保存一份笔记但被守卫拒绝”的变体；H18 只给日志，不偷偷重发写请求；H21 将两份公开说明分别委派给两个 Mock 子任务。每次只改变一个变量，避免学员同时理解新业务与新架构。

不使用“像流水线一样顺次处理”概括所有事件；Waterfall 画返回方向，serial 说明 bail；不使用“日志就是聊天记录”省略 surface/projection；不把 SQL Run/Step 与本仓库 Session 同名替换；不把摘要压缩当无损删减。
''')
write('C-knowledge-and-concepts.md','\n\n'.join(c))

d=['# 教学配图规划与视觉规范',f'共 {len(figure_rows)} 张图，覆盖 30 讲；每讲 1–2 张，首批实制 4 张。其余明确为 PLANNED，没有占位图片嵌入。',
'''## 视觉规范

延续现有 teaching-visual-v2 的浅青白背景、深蓝文字和青绿主线：背景 #F3F9F8，正文 #15394B，主线 #187A91，正常 #D9F4E9，待判定 #FFF0D7，错误 #FCE5E3。颜色同时配文字/线型，不能仅凭红绿识别。系统关系用容器/实线，事件通知用标注虚线，调用和返回需独立标注；所有箭头须被源码或明确的教学简化说明支持。

首批使用可编辑 SVG，由 scripts/draw_figures.py 确定性生成，scripts/render_figures.mjs 在本机 Chromium 渲染为 PNG。基础 viewBox 宽 640；主标签 32–34，说明 28，保持单列或短时序；移动端约 288px 内容宽时关键标签至少约 14px，辅助标签至少约 12px。最终 PNG 以 2 倍像素输出，320/390/1440 视口检查溢出、截断、中文字体和原图入口。图的高宽可随内容增加，不把复杂图挤成一张横幅。

图中模型、Loop、工具、持久事实用稳定文字标识。禁止机器人/科幻背景替代技术结构，禁止伪造真实软件截图。关系图是职责抽象；流程图必须说明省略了哪些异常/策略分支。新增复杂路径另拆图。

alt 描述信息与关系，caption 用一两句解释当前阅读重点；长图的全部可达分支还应在正文有文本等价说明。SVG 保留 title/desc；PNG 对应 alt/caption 记录在 figure-plan.json。每张图都记录代码来源 Commit 与引用编号；图形是本课程原创绘制，官方源码 MIT、第三方素材另核许可。首批无引用官方截图、字体文件或外部图片。

## Renderer V2 兼容核对

`src/components/LessonMarkdown.tsx` 已将 Markdown img 渲染为 lesson-figure，title 优先作为 caption，支持懒加载和“查看原图 ↗”。因此图示放大已有基础能力，无需本轮开发。`src/lib/lessonMarkdown.ts` 的 lessonUrl 只接受 `/course-media/` 与 HTTPS 图片；本地 docs 路径不会作为线上课程图片 src 生效。CSS 限制最大宽度并保持高宽比。

本轮实图保存在 **docs/deepseek-harness-v2/figures**，只在作者离线 QA server 中映射虚拟 `/course-media/harness-v2/` 路径。没有写 public。正式制课若判定为可公开的技术图，审查后才能复制到 public/course-media/harness-v2；受保护图、整课截图和答案不得放入该目录，需另提鉴权资源接口方案。未注册任何下载 asset。

未来标准嵌入写法（示例是约定，非声称已部署路径）：

```md
![Turn 在输入准入前打开，拒绝或空输入可零 Step；工具调用通常引出后续 Step](/course-media/harness-v2/h10-01.png "Turn 与 Step：先确定工作，再进入模型和工具阶段")
```

严格接口图优先 SVG/可控绘图；只有情境插画确有教学价值时才用图像生成，并记录人工核对。代码行高亮/行号目前没有专用能力：暂用短围栏+固定 GitHub 行链接。多面板响应式图可先拆图；内联 Mermaid 未集成时一律预渲染图片，不添加执行脚本。

## 完整图目录

| 图号 / 课时 | 类型与标题 | 教学目的 | 必含结构 | 状态 |
| --- | --- | --- | --- | --- |''']
for r in figure_rows:d.append(f"| {r['id']} | {r['kind']}《{r['title']}》 | {r['purpose']} | {r['structure']} | {r['status']} |")
d.append('''
## 首批成图与来源

四张图均由本目录脚本制作。PNG、SVG、alt、caption、Commit 与证据引用列于 figure-plan.json；实际几何/字体/视口检查结果与截图列于 figures/qa 和 evidence/visual-qa.json。结果只在脚本成功并经人工看图后才记 PASS。
''')
for r in figure_rows:
    if r['status']=='GENERATED_SAMPLE':
        stem=r['id'].lower()
        d.append(f"### {r['id']} {r['title']}\n\n![{r['alt']}](figures/rendered/{stem}.png \"{r['caption']}\")\n\n[SVG 源文件](figures/source/{stem}.svg)；生成脚本 draw_figures.py / render_figures.mjs。来源编号：{', '.join(r['sourceRefs'])}。")
write('D-visual-plan.md','\n\n'.join(d))
write('evidence/lesson-specs.json',json.dumps(LESSONS,ensure_ascii=False,indent=2))

if __name__ == '__main__':
    pass
