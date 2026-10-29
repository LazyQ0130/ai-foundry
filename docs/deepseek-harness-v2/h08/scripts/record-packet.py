"""保存交付索引与审图哈希；只有实际看过相应样本后运行。"""
from pathlib import Path
import json,hashlib,shutil
R=Path(__file__).resolve().parents[1];REPO=R.parents[2]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=json.loads((R/'evidence/source-lock.json').read_text(encoding='utf-8'))
SRC=Path(source['sourceCache'])
for target,origin in [('SOURCE-LICENSE.txt',SRC/'LICENSE'),('CORDIS-LICENSE.txt',SRC/'vendor/cordis/LICENSE'),('LOADER-LICENSE.txt',SRC/'vendor/loader/LICENSE'),('INCLUDE-LICENSE.txt',SRC/'vendor/include/LICENSE')]:
 shutil.copyfile(origin,R/target)
samples=[]
for n,note in [('01','四种共享base模板与minimal独立完整树；组合贡献非进程'),('02','整config替换时retry/temperature消失，错误深合并独立标识'),('03','四层顺序与遥测特例；组合结果和运行状态分开'),('04','配置重组与模块替换两路径，失败阶段及重启边界')]:
 for suffix in [f'figures/rendered/h08-{n}.png',f'figures/qa/h08-{n}-320.png']:
  samples.append({'path':suffix,'sha256':sha(R/suffix),'observation':note+'；中文可辨、无截字/重叠，图注与正文关系一致'})
for name,note in [('static-intro-390.png','标题/正文换行正常；开场不再显示Markdown粗体标记原文'),('lab-open-320.png','折叠展开代码边界清楚；长行在代码块内横滚，复制状态可见')]:
 p=R/'figures/qa'/name;samples.append({'path':str(p.relative_to(R)).replace('\\','/'),'sha256':sha(p),'observation':note})
manual={'status':'PASS_AUTHOR_VISUAL_INSPECTION','date':'2026-10-29','reviewer':'same author/model visual inspection, not independent human review',
 'lessonSha256':sha(REPO/'course-content/internal/deepseek-harness/h08/lesson.md'),'samples':samples,
 'limits':'All four originals + four 320 lesson figures + 390 static intro + 320 expanded program inspected. 1440/390/320 automation is separate; learner/low-vision testing not performed.'}
(R/'evidence/manual-review.json').write_text(json.dumps(manual,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
inventory=[]
for h in ['h05','h06','h07','h08']:
 d=REPO/f'docs/deepseek-harness-v2/{h}';lesson=REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md'
 paths=[lesson,d/'reading-preview.html',d/'quality-review.md',d/'source-checklist.md',d/'evidence/lab-results.json']
 paths+=sorted((lesson.parent/'lab').glob('*'))+sorted((d/'figures/source').glob('*.svg'))+sorted((d/'figures/rendered').glob('*.png'))
 inventory.append({'lesson':h,'metrics':json.loads((d/'evidence/content-check.json').read_text(encoding='utf-8'))['metrics'],
  'artifacts':[{'path':str(p.relative_to(REPO)).replace('\\','/'),'sha256':sha(p)} for p in paths if p.is_file()],
  'evidenceTiming':'historical prior delivery, not rerun this turn' if h!='h08' else 'current H08 author run'})
(R/'module-two-review-prep/artifact-inventory.json').write_text(json.dumps({'status':'PREPARED_REVIEW_NOT_STARTED','lessons':inventory},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
inputs=[REPO/'docs/deepseek-harness-v2/A-blueprint-v2.md',REPO/'docs/deepseek-harness-v2/E-production-standard.md',REPO/'docs/deepseek-harness-v2/D-visual-plan.md']
inputs+=list((REPO/'docs/deepseek-harness-v2/module-one-review').glob('*.md'))
for h in ['h04','h05','h06','h07']:
 inputs.append(REPO/f'course-content/internal/deepseek-harness/{h}/lesson.md')
 inputs+=list((REPO/f'docs/deepseek-harness-v2/{h}').glob('*.md'))
 inputs+=list((REPO/f'course-content/internal/deepseek-harness/{h}/lab').glob('*'))
 inputs+=list((REPO/f'docs/deepseek-harness-v2/{h}/figures/source').glob('*.svg'))
(R/'evidence/preparation-inputs.json').write_text(json.dumps({'kind':'fixed preparation inputs and prior artifacts; hashes are provenance, not proof of comprehension','files':[{'path':str(p.relative_to(REPO)).replace('\\','/'),'sha256':sha(p)} for p in inputs if p.is_file()]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Licenses, ten inspected samples, preparation inputs and H05–H08 inventory recorded')
