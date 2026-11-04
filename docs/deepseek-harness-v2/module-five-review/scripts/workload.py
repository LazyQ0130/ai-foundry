from pathlib import Path
import json,hashlib
HERE=Path(__file__).resolve().parents[1];BASE=HERE.parent
groups={
'h17':['事件溯源/fold','Header与Seq/Offset','追加/快照/冻结','Surface/消息','请求头/工具历史','业务Projection','flush边界'],
'h18':['存储seam/Handle','写所有权','缓冲/屏障/close','编码/generation','物理与语义尾修复','Resume发布','Fork与谱系'],
'h19':['Meter/Usage/路由计价','压力/预留预算','平衡选区','摘要生命周期/锁','Pruner','图片省略','维护与检查点'],
'h20':['失败规范/Attempt','Waterfall/策略','退避/预算','取消传播','工具批次排空','外部未知/幂等','生命周期恢复']}
rows=[]
for h in ['h17','h18','h19','h20']:
 v=json.loads((HERE/f'evidence/{h}/evidence/content-check.json').read_text(encoding='utf-8'));a=json.loads((BASE/f'{h}/evidence/source-assertions.json').read_text(encoding='utf-8'))
 ranges={}
 for c in a:ranges.setdefault(c['path'],set()).update(range(c['start'],c['end']+1))
 rows.append({'course':h.upper(),**v['metrics'],'conceptGroups':groups[h],'assertions':len(a),'sourceFilesReferenced':len(ranges),'assertionUniqueSourceLines':sum(len(s) for s in ranges.values()),'sourceRanges':{p:[min(s),max(s),len(s)] for p,s in ranges.items()},'lessonSha256':v['lessonSha256']})
(HERE/'evidence/workload.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('\n'.join(str({k:v for k,v in r.items() if k not in ['sourceRanges','conceptGroups','lessonSha256']}) for r in rows))
