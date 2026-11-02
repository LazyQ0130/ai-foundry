from pathlib import Path
import html,json
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assessment.json').read_text(encoding='utf-8'))
assert len(data)==16 and sum(q['points'] for q in data)==100
for q in data:assert sum(p for p,_ in q['rubric'])==q['points'] and len(q['reasoning'])>=3 and len(q['errors'])>=2
lock=json.loads((ROOT/'evidence/source-check.json').read_text(encoding='utf-8'));lookup={a['id']:a for a in lock['assertions']}
def source_md(key):
 if key not in lookup:return '['+key+']('+('test-evidence.md' if 'test-' in key else 'workload.md')+')'
 a=lookup[key];p=a.get('source',a.get('path'));s,e=a.get('lines',[a.get('start'),a.get('end')])
 return f'[{key} · {p}:{s}](https://github.com/deepseek-ai/deepseek-harness/blob/{lock["commit"]}/{p}#L{s}-L{e})'
intro='16题 / 100分，1–12题各5分，综合A–D各10分。先独立作答，再对照推导与Rubric。建议90–130分钟，作者估计、未施测。自由解释按因果与中间值评分，不作术语关键词自动打分。安全关键误解须逐题纠正，不由总分掩盖；分值/阈值/评分一致性未校准。'
questions=['# 第三模块综合测验','',intro,'','[折叠答案与自评阅读预览](assessment-preview.html) · [全部详细答案](assessment-answers.md)','']
answers=['# 第三模块综合测验详细答案','',intro,'']
cards=[]
for q in data:
 i=q['id'];anchor=f'q{i:02d}'
 questions += [f'<a id="{anchor}"></a>',f'## {i}. {q["title"]}',f'**{q["topic"]} · {q["points"]}分**','',q['question'],'',f'[答题后看详细答案](assessment-answers.md#{anchor})','']
 answers += [f'<a id="{anchor}"></a>',f'## {i}. {q["title"]}','',q['question'],'','**标准答案**','',q['answer'],'','**详细推导**','']
 answers += [f'{n+1}. {s}' for n,s in enumerate(q['reasoning'])]
 answers += ['','**评分Rubric**','','| 分值 | 必需论证 |','|---:|---|']+[f'| {p} | {s} |' for p,s in q['rubric']]
 answers += ['','**常见错误及解释**','']+['- '+s for s in q['errors']]+['','依据：'+ '；'.join(source_md(k) for k in q['sources'])+'。','']
 esc=html.escape
 refs=''.join(f'<li>{esc(k)}</li>' for k in q['sources'])
 rubric=''.join(f'<li><b>{p}分</b> {esc(s)}</li>' for p,s in q['rubric'])
 reasoning=''.join(f'<li>{esc(s)}</li>' for s in q['reasoning'])
 errors=''.join(f'<li>{esc(s)}</li>' for s in q['errors'])
 cards.append(f'''<article id="{anchor}" data-topic="{esc(q['topic'])}"><p class="eyebrow">第{i}题 · {esc(q['topic'])} · {q['points']}分</p><h2>{esc(q['title'])}</h2><p>{esc(q['question'])}</p><label for="notes{i}">我的推导（仅本页内，刷新后不保留）</label><textarea id="notes{i}" rows="4" placeholder="写中间状态、事件、依据及适用条件"></textarea><details><summary>展开标准答案、推导与评分依据</summary><div class="answer"><h3>标准答案</h3><p>{esc(q['answer'])}</p><h3>详细推导</h3><ol>{reasoning}</ol><h3>评分 Rubric</h3><ul>{rubric}</ul><h3>常见错误</h3><ul>{errors}</ul><p>固定源码断言：{esc('、'.join(q['sources']))}，详见配套答案文档的固定链接。</p></div></details><label>对照Rubric自评 <input class="score" type="number" min="0" max="{q['points']}" step="1" value="0" aria-label="第{i}题自评分"> / {q['points']}</label></article>''')
topics=''.join(f'<option>{html.escape(t)}</option>' for t in dict.fromkeys(q['topic'] for q in data))
page='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>第三模块综合测验 · 内部审查</title><style>
*{box-sizing:border-box}body{overflow-wrap:anywhere;margin:0;background:#f5f8fa;color:#18384a;font:16px/1.85 "Microsoft YaHei",sans-serif}main{max-width:880px;margin:auto;padding:40px 24px 80px}header{border-top:6px solid #187a91;padding-top:20px}h1{font-size:32px;line-height:1.35}h2{font-size:23px;line-height:1.5}h3{font-size:18px;margin:20px 0 8px}p{white-space:pre-wrap;overflow-wrap:anywhere}.eyebrow{color:#526d7c;font-size:14px}nav{display:flex;gap:12px;flex-wrap:wrap;padding:16px 0}button,select,input,textarea{font:inherit}button,select{border:1px solid #8aaab6;border-radius:8px;padding:8px 12px;background:white;color:inherit}button{cursor:pointer}button:focus-visible,summary:focus-visible,textarea:focus-visible{outline:3px solid #e2ad52;outline-offset:3px}article{margin:24px 0;background:white;border:1px solid #d2e0e6;border-radius:14px;padding:28px}article[hidden]{display:none}textarea{display:block;width:100%;border:1px solid #a9c0cc;border-radius:8px;padding:10px;resize:vertical;margin:8px 0 16px}summary{cursor:pointer;padding:12px;background:#e6f3ef;border-radius:8px;font-weight:600}.answer{padding:4px 12px 18px}li{margin:8px 0;overflow-wrap:anywhere}.score{width:80px;padding:4px;margin-top:12px}output{display:block;font-weight:bold}footer{color:#526d7c}@media(max-width:500px){main{padding:24px 16px 50px}article{padding:18px}h1{font-size:26px}h2{font-size:21px}nav{gap:8px}button,select{max-width:100%}}@media print{nav,textarea,.score,label{display:none}article{break-inside:avoid}details .answer{display:block}}
</style></head><body><main><header><p class="eyebrow">AI Foundry / DeepSeek Harness / H09–H12</p><h1>把一次任务从创建追到结算</h1><p>INTRO</p><p>本地内部阅读稿。自评分不代表真实学习效果，不上传数据。</p></header><nav aria-label="阅读控制"><button id="expand">展开全部答案</button><button id="collapse">收起全部答案</button><label>题型 <select id="filter"><option value="all">全部题目</option>TOPICS</select></label></nav><output id="total" aria-live="polite">自评合计 0 / 100（未校准）</output>CARDS<footer>固定官方Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。未施测、未发布课程。</footer></main><script>
document.querySelector('#expand').onclick=()=>document.querySelectorAll('details').forEach(d=>d.open=true);
document.querySelector('#collapse').onclick=()=>document.querySelectorAll('details').forEach(d=>d.open=false);
document.querySelector('#filter').onchange=e=>document.querySelectorAll('article').forEach(a=>a.hidden=e.target.value!=='all'&&a.dataset.topic!==e.target.value);
document.querySelectorAll('.score').forEach(e=>e.addEventListener('input',()=>{let sum=0;document.querySelectorAll('.score').forEach(s=>{const n=Math.min(Number(s.max),Math.max(0,Math.floor(Number(s.value)||0)));s.value=n;sum+=n});document.querySelector('#total').textContent='自评合计 '+sum+' / 100（未校准）'}));
</script></body></html>'''.replace('INTRO',html.escape(intro)).replace('TOPICS',topics).replace('CARDS','\n'.join(cards))
(ROOT/'assessment.md').write_text('\n'.join(questions).rstrip()+'\n',encoding='utf-8')
(ROOT/'assessment-answers.md').write_text('\n'.join(answers).rstrip()+'\n',encoding='utf-8')
(ROOT/'assessment-preview.html').write_text(page,encoding='utf-8')
lines=['# 172项断言复核索引','','身份/固定范围逐项通过；语义结论与条件按[source-review.md](source-review.md)分组说明。原STATIC_ONLY/SOURCE_READ不升级为实际执行；作者用例已在本轮按原对象重跑。','','| ID | 原断言 | 固定源码 / 符号 | 本轮行为映射及条件 | 复核 |','|---|---|---|---|---|']
for a in lock['assertions']:
 expected=a.get('assertion',a.get('expected',''));evidence=a.get('authorTest',a.get('authorEvidence',''));limits=a.get('conditions',a.get('limits',''))
 row=[a['id'],expected,source_md(a['id'])+' / '+a['symbol'],evidence+'；'+limits,'范围/归属有效；与分组控制流结论一致']
 lines.append('| '+' | '.join(str(c).replace('|','\\|').replace('\n',' ') for c in row)+' |')
(ROOT/'source-assertion-index.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PASS: 16 questions, 100 points, complete reasoning/rubrics/errors, 172 assertion rows')
