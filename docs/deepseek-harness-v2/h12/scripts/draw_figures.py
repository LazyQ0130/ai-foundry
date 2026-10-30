"""H12原创分段SVG；640宽、最小28px；PNG由真实浏览器导出。"""
from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parents[1]
INK,LINE,BG='#15394B','#187A91','#F3F9F8'
BLUE,GREEN,AMBER,RED='#DDEDF5','#D9F4E9','#FFF0D7','#FCE5E3'
def text(x,y,s,size=28,bold=False):return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" text-anchor="middle">{escape(s)}</text>'
def save(n,title,intro,cards,foot,desc,connected=False):
 y=150;parts=[text(320,55,title,32,True),text(320,108,intro)]
 for i,(name,lines,color) in enumerate(cards):
  h=90+42*len(lines)
  parts += [f'<rect x="28" y="{y}" width="584" height="{h}" rx="18" fill="{color}" stroke="{LINE}" stroke-width="2"/>',text(320,y+44,name,32,True)]
  parts += [text(320,y+91+42*k,s) for k,s in enumerate(lines)]
  if connected and i<len(cards)-1:parts.append(f'<path d="M320 {y+h+4} V{y+h+46}" stroke="{LINE}" stroke-width="3" marker-end="url(#a)"/>')
  y+=h+60
 for s in foot:parts.append(text(320,y,s));y+=42
 fid=f'h12-0{n}'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="{y+28}" viewBox="0 0 640 {y+28}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="a" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8" fill="{LINE}"/></marker></defs><style>text{{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:{INK}}}</style><rect width="640" height="{y+28}" fill="{BG}"/>{"".join(parts)}</svg>'
 (R/'figures/source'/f'{fid}.svg').write_text(svg,encoding='utf8',newline='\n')
save(1,'统一入口，保留协议边界','并列职责卡：关系不是执行时间轴',[
 ('Loop → LlmRuntime',['H11形成messages与tools','prepareCall绑定路由、能力与默认','一次分发 → llm/stream Waterfall'],BLUE),
 ('Provider 与 Model',['provider选择已登记的路由','model是该路由下的模型标识','目录展示不等于核心请求白名单'],AMBER),
 ('DeepSeek Adapter',['请求 → Messages协议','SSE帧 → 原生事件 → translate','thinking/tool_use → 共同内容块'],GREEN),
 ('pi-ai Adapter',['请求 → 库的模型上下文','text_delta/toolcall_end → 公共流','对象参数在完成块中再序列化'],GREEN),
 ('共同出口：StreamChunk',['按index关联文本、推理、工具','usage在finish前；终态后结束','Loop无需理解两家原生事件名'],BLUE),
],['接口统一不保证模型能力相同','本课真实运行组件；未接外部API'],
 'Runtime管理公共入口与注册，Adapter分别转换Messages或pi-ai事件；Provider路由与Model模型标识分开，目录不是统一白名单。')
save(2,'交错分片，各回各的块','index关联块；顺序采用首次出现',[
 ('① 文本7 → 推理2',['text(7)：先读','reasoning(2)：检查资料','已见顺序：7、2'],BLUE),
 ('② 工具4开始，文本7继续',['call id=read-1；name=read_fixture','args(4)：{"path":','text(7)：先读README'],AMBER),
 ('③ 工具4参数继续 → block-end',['追加："README.md"}','完整块成为权威结果','已关闭块忽略迟到delta/再关闭'],GREEN),
 ('④ usage → finish(tool-calls)',['块顺序7、2、4，不按数值排序','text / reasoning / tool-call分开','组装完成仍不等于工具已执行'],BLUE),
],['另一路max-tokens：去掉全部工具','已关闭合法工具也不例外','live帧index另指交付序号'],
 'A的真实输入按7、2、4首次出现组装，工具参数分两段，block-end给权威整块；不同index可交错，图中只显示改变的状态。',True)
save(3,'实时帧，到匹配的Session事实','向下是本课已验证的接纳顺序',[
 ('外层流句柄取得 → start',['取消检查通过才发布start','尚无chunk也可以已有start'],BLUE),
 ('每片：Accumulator先快照',['保存原分片边界与时间','同份快照 → BlockAssembler','再发本地chunk帧给实时消费者'],GREEN),
 ('Loop决定结算类型',['正常结果 / 取消安全前缀 → message','失败或无安全前缀 → attempt','实时看见不证明这里已经完成'],AMBER),
 ('尝试Session append',['成功：取得已接纳事件seq','失败：无匹配成功事实，重抛错误','此处不是磁盘flush证明'],BLUE),
 ('发布end：两个互斥结果',['成功 → committed + eventType + seq','拒绝 → abandoned','工具只在成功内容结算后衔接'],GREEN),
],['Assembler给内容，Accumulator记流','紧凑流嵌入结算，不逐片写Session','完整持久化与恢复留H17–H18'],
 '真实AssistantStreamAttempt先快照后组装和实时发布，Loop提交匹配事件成功后才发committed end，失败发abandoned。',True)
save(4,'同样结束，记录可以不同','各卡独立；默认没有恢复监听器',[
 ('正常stop / tool-calls',['assistant/message → committed','读取结构化调用后才可能执行工具','无工具时成为completed候选'],GREEN),
 ('error / 仅提供方aborted',['本地signal未取消的失败终态','assistant/attempt → committed','草稿不入正常Assistant历史'],RED),
 ('本地signal取消',['有非空白text/reasoning：','interrupted message → committed','无安全前缀：attempt → committed'],AMBER),
 ('max-tokens',['Assembler去掉全部tool-call','其余内容message → committed','不执行工具；max-tokens停止候选'],BLUE),
 ('结算拒绝 / 最终组装失败',['无成功的匹配Assistant事实','实时end → abandoned','已有chunk不证明提交成功'],RED),
],['明确retry决策才开启下次Attempt','同Step重试不重复接纳用户','所有committed只指Session接纳'],
 '对照正常、失败、本地取消、max-tokens与写入拒绝，区分持久结果类型和临时end；未描画完整恢复策略。')
figures=[dict(id=f'h12-0{i}',source=f'figures/source/h12-0{i}.svg',image=f'figures/rendered/h12-0{i}.png',rendererPath=f'/course-media/harness-v2/h12/h12-0{i}.png',commit='f3803c96974ad4a94195fb97e5c637e9c2a3afe3',purpose=p,provenance='H12原创SVG；沿用H09-H11配色、中文字体与纵向分段；图中注明简化范围') for i,p in [(1,'Runtime和多Adapter关系'),(2,'交错分片到内容块'),(3,'实时与结算边界'),(4,'独立终态分支')]]
(R/'evidence/figures.json').write_text(json.dumps(figures,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print('Four original H12 SVGs generated')
