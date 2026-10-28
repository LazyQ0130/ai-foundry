"""核对 H01 实际引用范围及 V2.0 已固定文件哈希；不追随 main。"""
from pathlib import Path
import os, json, re, hashlib, subprocess

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
COMMIT = 'f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock = json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf-8-sig'))
cache = Path(os.environ.get('HARNESS_SOURCE_CACHE', lock['sourceCache']))
index = json.loads((ROOT.parent/'evidence/source-index.json').read_text(encoding='utf-8-sig'))
known = {v['path']:v['sha256'] for v in index}
git_cache=Path(os.environ.get('HARNESS_GIT_CACHE', str(cache.parents[1]/'deepseek-harness-f3803c9')))
def check_hash(f, data):
    digest=hashlib.sha256(data).hexdigest()
    if f in known:
        assert digest==known[f], f'与 V2.0 固定索引不符：{f}'
        return 'V2.0 source-index SHA-256'
    tree=subprocess.check_output(['git','-C',str(git_cache),'ls-tree',COMMIT,'--',f],text=True).strip()
    blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    assert tree.split()[2]==blob, f'与固定 Git tree blob 不符：{f}'
    return f'fixed Git tree blob {blob}'
lesson = (REPO/'course-content/internal/deepseek-harness/h01/lesson.md').read_text(encoding='utf-8')
urls = sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+', lesson)))
refs=[]
for url in urls:
    m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url)
    assert m, f'需要固定 Commit 与行号：{url}'
    sha, f, a, b=m.groups(); a,b=int(a),int(b)
    assert sha==COMMIT==lock['commit']
    data=(cache/f).read_bytes(); lines=data.decode('utf-8').splitlines()
    digest=hashlib.sha256(data).hexdigest()
    verification=check_hash(f,data)
    assert 1<=a<=b<=len(lines), url
    refs.append({'url':url,'path':f,'start':a,'end':b,'sha256':digest,'verification':verification,'status':'STATIC_VERIFIED','excerpt':lines[a-1:b]})

claims=[
 ('S01','开源 Harness、一切皆插件、开发者预览','README.zh.md',5,15,'开发者预览'),
 ('S02','未经审计；审批与沙箱不能保证隔离或安全','SAFETY.zh.md',5,15,'尚未接受安全审计'),
 ('S03','服务分工；默认循环也是可替换插件','docs/architecture.zh.md',7,65,'agent loop'),
 ('S04','创建消费者与默认循环实现分离','packages/core/agent/src/index.ts',169,175,'without'),
 ('S04a','AgentRegistry.create 委托登记的工厂','packages/core/agent/src/index.ts',407,425,'Reflect.apply'),
 ('S05','模型调用提议回循环，再分派工具服务','packages/core/agent-loop/src/agent.ts',586,597,'this.loopCtx.tools.execute'),
 ('S06','工具执行前策略、ask、guard、取消检查','packages/core/tools/src/pipeline.ts',190,229,'this.tools.checkGuards(exec)'),
 ('S06a','审批服务或通道不可用时拒绝','packages/core/tools/src/pipeline.ts',432,469,"case 'unavailable'"),
 ('S06t','对应官方拒绝测试（只静态核对）','packages/core/tools/tests/tools.spec.ts',788,840,'no approval seam'),
 ('S07','按 provider/model 取得适配器并准备调用','packages/llm/llm/src/index.ts',960,975,'registration.adapter.prepareCall'),
 ('S08','追加会话事实与派生模型消息是不同接口','packages/core/session/src/index.ts',806,833,'snapshotJsonValue'),
 ('S08a','由保留的有序 surface 节点派生模型历史','packages/core/session/src/index.ts',999,1019,'deriveEventMessage'),
 ('S08t','会话事件与派生消息测试（只静态核对）','packages/core/session/tests/session.spec.ts',32,74,'deriveMessages'),
 ('S09','记录是模型上下文来源，持久化另有提供方','docs/architecture.zh.md',126,170,'SessionPersistence'),
 ('S10','不同入口由组合包构成，配置不等于所有能力都启用','docs/architecture.zh.md',15,25,'sdk-minimal'),
]
items=[]
for cid,claim,f,a,b,needle in claims:
    data=(cache/f).read_bytes(); lines=data.decode('utf-8').splitlines()
    assert needle in '\n'.join(lines[a-1:b]), (cid,needle)
    check_hash(f,data)
    items.append({'id':cid,'claim':claim,'path':f,'start':a,'end':b,'needle':needle,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{f}#L{a}-L{b}','status':'STATIC_VERIFIED'})
report={'commit':COMMIT,'sourceCache':str(cache),'method':'compare exact file SHA-256 with V2.0 fixed source index, or compute blob identity against fixed Git tree for newly cited files; check bounds and explicit needles; author control-flow review separately recorded','lessonSha256':hashlib.sha256((REPO/'course-content/internal/deepseek-harness/h01/lesson.md').read_bytes()).hexdigest(),'references':refs,'claims':items,'upstreamTests':'NOT_RUN','realModels':'NOT_RUN'}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'references':len(refs),'uniqueFiles':len({v['path'] for v in refs}),'claims':len(items),'commit':COMMIT,'status':'STATIC_VERIFIED'},ensure_ascii=False))
