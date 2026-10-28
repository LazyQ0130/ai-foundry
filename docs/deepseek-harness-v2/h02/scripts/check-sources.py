"""H02：每个引用的文件与固定 Git tree 核对，另核六张真实关系卡。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
COMMIT='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
lock=json.loads((ROOT.parent/'evidence/source-lock.json').read_text(encoding='utf-8-sig'))
CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',str(CACHE.parents[1]/'deepseek-harness-f3803c9')))
tree={}
for row in subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r','-z',COMMIT]).split(b'\0'):
 if row:
  meta,path=row.split(b'\t',1);tree[path.decode()]=meta.split()[2].decode()
checked={}
def check(f):
 if f in checked:return checked[f]
 data=(CACHE/f).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 assert tree[f]==blob,f
 checked[f]={'path':f,'sha256':hashlib.sha256(data).hexdigest(),'gitBlob':blob,'lines':data.decode('utf-8').splitlines()}
 return checked[f]
lesson=REPO/'course-content/internal/deepseek-harness/h02/lesson.md'
text=lesson.read_text(encoding='utf-8');assert 'LOCKED/' not in text and '__H02' not in text
urls=sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',text)))
refs=[]
for url in urls:
 m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url)
 assert m,url
 commit,f,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT
 c=check(f);assert 1<=a<=b<=len(c['lines']),url
 refs.append({'url':url,'path':f,'start':a,'end':b,'sha256':c['sha256'],'excerpt':c['lines'][a-1:b],'status':'STATIC_VERIFIED'})

# 每条断言绑定实际读取区间与语义锚；语义判断由作者单独审阅。
raw=[
 ('S01','工具链、两级 workspace；pnpm 清单额外列 benchmarks 与 Python runtime','package.json',1,18,'pnpm@11.28.5'),
 ('S01a','pnpm 实际成员清单','pnpm-workspace.yaml',1,15,'python/sdk-runtime'),
 ('S02','能力系列分组；组 README 是包映射入口','packages/README.zh.md',10,31,'packages/'),
 ('S03','主干服务与默认循环分开；core 是分组','packages/core/README.zh.md',25,36,'agent-loop'),
 ('S04','共享 LLM 服务与提供方接入分开','packages/llm/README.zh.md',23,35,'适配器'),
 ('S05','公共基础与测试支持有专属分组','packages/README.zh.md',66,82,'test-support'),
 ('S05a','vendor 保存框架与基础库的仓库固定源码','vendor/README.md',1,7,'source-vendored copies'),
 ('S06','命令入口按 profile 分支委托 runProfile','apps/cli/src/bin.ts',26,48,'await runProfile'),
 ('S06a','bin 映射到发布产物','apps/cli/package.json',13,20,'lib/bin.js'),
 ('S07','headless 模板选择 base 与 headless，sdk-minimal 不使用 base','packages/util/official-bundles/src/bundles.ts',9,25,"headless: {"),
 ('S07a','base 声明组合 patch','packages/bundle/base/package.json',30,35,'cordis.patch.yml'),
 ('S07b','base 挂载工具与原生执行器，另一种执行器默认停用','packages/bundle/base/cordis.patch.yml',493,502,'disabled: true'),
 ('S08','ToolExecutor 定义 describe / execute 契约','packages/core/tools/src/executor.ts',63,86,'export interface ToolExecutor'),
 ('S09','原生提供方导入契约、实现并注册；execute 转交共享函数','packages/core/tool-executor-native/src/index.ts',2,35,'ctx.tools.setExecutor(new NativeToolExecutor(ctx))'),
 ('S10','服务选定提供方后调用；不是在此写死导入具体执行器','packages/core/tools/src/index.ts',369,377,'this.selectExecutor(input.agent).execute(input)'),
 ('S11','组合测试挂载实际服务与原生执行器，模型为 Mock','packages/core/agent-loop/tests/tool-executors.spec.ts',66,83,'ctx.plugin(NativeToolExecutor)'),
 ('S11a','跨包测试核工具呈现与作用域选择','packages/core/agent-loop/tests/tool-executors.spec.ts',103,128,"toEqual(['echo'])"),
 ('S12','构建项目引用 tools；不能当运行调用','packages/core/tool-executor-native/tsconfig.json',10,22,'../tools'),
 ('S13','包身份、运行入口和类型入口与源码不同','packages/core/tool-executor-native/package.json',1,24,'lib/types/index.d.ts'),
 ('S13a','paths 为仓库源码解析；引用保持编译边界','tsconfig.base.json',27,30,'Project references'),
 ('S14','Host 与浏览器 Client 各有职责','packages/host/README.zh.md',10,30,'HTTP(S)'),
 ('S14a','Client 中有浏览器连接与 UI 基础','packages/client/README.zh.md',10,31,'浏览器'),
 ('S15','solution 引用两套 aggregate，自身无文件','tsconfig.json',1,15,'"files": []'),
 ('S15a','Context 声明合并冲突使 Host/Client 类型检查分开，存在共享/拆分例外','docs/development.zh.md',63,81,'声明合并'),
 ('S16','官方 module-graph 只包含 peer 依赖','docs/module-graph.zh.md',1,8,'不包括普通运行时 dependency'),
 ('S17','浏览器入口委托 AppWebEntry','apps/web/src/main.ts',1,20,'new AppWebEntry(el)'),
 ('S17a','网页从 main.ts 模块脚本进入','apps/web/index.html',14,18,'/src/main.ts'),
 ('S18','Desktop Host 调用共享 runner','apps/desktop-host/src/index.ts',22,36,"profile: 'desktop'"),
 ('S19','apps 中的索引生成器不是 Cordis 应用','apps/plugin-market-generator/README.zh.md',1,5,'不是 Cordis 应用'),
 ('S20','未审计预览，不能推导生产安全','SAFETY.zh.md',5,15,'尚未接受安全审计'),
 ('S21','研发辅助：路径门禁测试区分历史引用与当前正文；只静态阅读','scripts/verify-package-paths.spec.ts',28,39,'historical package references'),
]
claims=[]
for cid,claim,f,a,b,needle in raw:
 c=check(f);assert needle in '\n'.join(c['lines'][a-1:b]),(cid,needle)
 claims.append({'id':cid,'claim':claim,'path':f,'start':a,'end':b,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{f}#L{a}-L{b}','status':'STATIC_VERIFIED'})
fixture=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {cards,reference} from './course-content/internal/deepseek-harness/h02/lab/navigate.mjs'; console.log(JSON.stringify({cards,reference}))"],cwd=REPO).decode('utf-8'))
for card in fixture['cards']:
 c=check(card['file']);assert card['evidence'] in c['lines'][card['line']-1],card
loc=fixture['reference']['locate']
assert json.loads((CACHE/'packages/core/tool-executor-native/package.json').read_text(encoding='utf-8'))['name']==loc['packageName']
for key in ['implementation','contract','consumer','test']:check(loc[key])
assert loc['testCase'] in '\n'.join(check(loc['test'])['lines'])
assert 'export interface '+loc['symbol'] in '\n'.join(check(loc['contract'])['lines'])
report={'commit':COMMIT,'date':'2026-10-29','lessonSha256':hashlib.sha256(lesson.read_bytes()).hexdigest(),'method':'exact blob identity vs fixed Git tree; line bounds; explicit claim needles; six relation-card lines; author semantic review separately recorded','references':refs,'claims':claims,'files':[{k:v for k,v in f.items() if k!='lines'} for f in checked.values()],'cardsVerified':6,'upstreamTests':'STATIC_READ_ONLY_NOT_RUN','officialBuild':'NOT_RUN','realModel':'NOT_RUN'}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md='# H02 源码核对清单\n\n固定 Commit：`'+COMMIT+'`。每个引用文件以实际 Git tree blob 核对，非凭目录名称或 main 分支判断。\n\n| 编号 | 关键断言 | 直接证据 | 状态 |\n| --- | --- | --- | --- |\n'
for c in claims:md+=f"| {c['id']} | {c['claim']} | [{c['path']}:{c['start']}]({c['url']}) | 静态核对 |\n"
md+='''
## 阅读路线与层级

核心精读五个文件：根 package.json → pnpm-workspace.yaml → apps/cli/src/bin.ts → core/tools/src/executor.ts → core/tool-executor-native/src/index.ts。先确认成员，再认入口，先契约后提供方。每一站只读正文标注的片段；配置、服务分派、类型边界和测试作定点辅助阅读，不要求读完整文件。

辅助证据包括 base 配置、工具服务 execute、source paths、包 exports、Host/Client solution、开发文档及组合测试。固定路线不是函数调用栈。三种图分开：import/type 关系、Project Reference、对象注册/调用。module-graph 官方只画 peer，不得冒称完整源码或运行图。

## 事实、简化与分析

官方事实以本表与正文链接为准。四行 TypeScript 收据例子、练习分类器与分层图属于教学材料；分类器引用的六个短证据行已逐行核对，但没有运行 Harness。Monorepo 协同修改的收益与维护成本标为我们的分析，未臆测作者全部历史动机。

包名、路径、实现、接口、consumer 与测试名称由实际文件复核。测试核对的是选定 Mock 组合场景与工具可见性，不能推出生产安全或所有调度性质。原生执行器无法强制杀死同进程不合作工具等细节留后续，不在本节扩展承诺。

官方测试只静态阅读，不运行含递归清理的脚本；构建、真实 API、原生执行环境和端到端功能均未运行。H02 八项练习测试与 Renderer 检查是作者自己的验证范围。

完整路径、范围、SHA-256、Git blob 与受核片段见 [source-check.json](evidence/source-check.json)。短证据行来自 MIT 源码；许可沿用 [SOURCE-LICENSE.txt](../SOURCE-LICENSE.txt)，本课没有复制官方图片。正文、答案与审阅截图不进入公开静态目录。
'''
(ROOT/'source-checklist.md').write_text(md,encoding='utf-8')
print(json.dumps({'status':'STATIC_VERIFIED','references':len(refs),'files':len(checked),'claims':len(claims),'cards':6},ensure_ascii=False))
