"""固定 Git 字节、正文行范围与关键断言索引。定位检查不能代替语义审查。"""
from pathlib import Path
import hashlib,json,os,re,subprocess
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[2]
lock=json.loads((ROOT/'evidence/source-lock.json').read_text(encoding='utf8'))
COMMIT=lock['commit'];CACHE=Path(os.environ.get('HARNESS_SOURCE_CACHE',lock['sourceCache']))
GIT=Path(os.environ.get('HARNESS_GIT_CACHE',lock['gitCache']))
tree={}
for row in subprocess.check_output(['git','-C',str(GIT),'ls-tree','-r','-z',COMMIT]).split(b'\0'):
 if row:
  meta,p=row.split(b'\t',1);tree[p.decode()]=meta.split()[2].decode()
checked={}
def check(p):
 if p in checked:return checked[p]
 data=(CACHE/p).read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 assert tree[p]==blob,p
 checked[p]={'path':p,'gitBlob':blob,'sha256':hashlib.sha256(data).hexdigest(),'lineCount':len(data.decode('utf8').splitlines())}
 return checked[p]
lesson=(REPO/'course-content/internal/deepseek-harness/h07/lesson.md').read_text(encoding='utf8')
refs=[]
for url in sorted(set(re.findall(r'https://github\.com/deepseek-ai/deepseek-harness/blob/[^\s)]+',lesson))):
 m=re.fullmatch(r'https://github\.com/deepseek-ai/deepseek-harness/blob/([a-f0-9]{40})/(.+)#L(\d+)-L(\d+)',url);assert m,url
 commit,p,a,b=m.groups();a,b=int(a),int(b);assert commit==COMMIT
 assert 1<=a<=b<=check(p)['lineCount'],url
 refs.append({'path':p,'start':a,'end':b,'url':url,'status':'FIXED_BLOB_AND_RANGE_VERIFIED'})
raw=[
 ('L01','插件定义共享runtime，每次挂载创建独立Fiber及可等待包装','vendor/cordis/src/registry.ts',316,335,'Object.create(fiber)','A及同一定义两实例真实核对；包装不恒等于await取得的Fiber'),
 ('L02','Fiber保存实例状态/上下文/依赖与清理记录，不是线程','vendor/cordis/src/fiber.ts',178,210,'public state = FiberState.PENDING','实例身份/独立状态测试；未创造线程或进程'),
 ('L03','插件Context扩展自父Context，关联当前Fiber','vendor/cordis/src/fiber.ts',234,245,'parent.extend({ fiber: this })','两个实例Context不同；不声称无条件全局可见'),
 ('L04','六个FiberState枚举；初始PENDING','vendor/cordis/src/fiber.ts',139,154,'UNLOADING','A真实internal/plugin+internal/status记录，非模拟状态数组'),
 ('L05','await等待当前转换稳定，PENDING可返回；失败则重抛','vendor/cordis/src/fiber.ts',725,737,'if (this._error) throw this._error','缺服务与Error失败分别真实执行'),
 ('L06','依赖满足驱动LOADING，否则运行失效转UNLOADING','vendor/cordis/src/fiber.ts',597,638,'return FiberState.LOADING','C及异步加载门闩；完整快速变化交错未穷举'),
 ('L07','启动/校验失败先清理，再稳定FAILED','vendor/cordis/src/fiber.ts',673,723,'this._error = reason','Error启动和配置校验真实用例；已登记资源回收一次'),
 ('L08','稳定状态按uid、错误、激活信息判断','vendor/cordis/src/fiber.ts',574,594,'if (this.uid === null)','A/C/失败真实轨迹；图只含精选路径'),
 ('L09','显式dispose清空uid移除实例，等待卸载；不能被依赖恢复唤醒','vendor/cordis/src/fiber.ts',265,297,'this.uid = null','缺依赖dispose、运行dispose、服务重现不复活真实执行'),
 ('L10','父Fiber通过Effect持有子Fiber释放入口','vendor/cordis/src/fiber.ts',265,297,'parent.fiber.effect','父级首次dispose等待子级异步清理；非全局串行承诺'),
 ('L11','根Fiber uid0且dispose使用restart，非普通DISPOSED终点','vendor/cordis/src/fiber.ts',320,332,'this.dispose = () => this.restart()','静态特例审读；夹具用根清理，不宣称进程退出'),
 ('L12','effect检查所有者；UNLOADING与已dispose不得新建','vendor/cordis/src/fiber.ts',415,442,'this.state === FiberState.UNLOADING','两个失效场景真实INACTIVE_EFFECT；有效性不等同只准ACTIVE'),
 ('L13','Effect包装先登记所有权，再执行获取逻辑','vendor/cordis/src/fiber.ts',517,560,'removeWrapper = this._disposables.push(wrapper)','获取立即执行与异步获取中卸载测试；源码读重入保护'),
 ('L14','execute返回函数/Promise/可迭代；非法形状失败','vendor/cordis/src/fiber.ts',356,399,"new TypeError('Invalid effect')",'普通函数、异步setup、生成器及非法数值真实执行'),
 ('L15','公共清理包装一次性；重复调用通常不加入在途Promise','vendor/cordis/src/fiber.ts',504,515,'if (!runner.epoch)','stop和Fiber.dispose在首次未完成时重复调用真实核对'),
 ('L16','结构所有者可通过effectInertia加入已开始的清理','vendor/cordis/src/fiber.ts',110,117,'effectInertia.get(dispose)','手动stop在途时owner卸载仍等；内部WeakMap源码交叉'),
 ('L17','整个Fiber的独立Effect按逆序取出并异步一起等待','vendor/cordis/src/fiber.ts',702,713,'Promise.all','B先启动/A后启动，门闩控制A先完成；不是完成顺序保证'),
 ('L18','逆序来自DisposableList.clear','vendor/cordis/src/utils.ts',27,30,'values.reverse()','与L17共同解释启动顺序，不孤立搜reverse推导语义'),
 ('L19','同一Effect内部的多个Disposer有串行组合逻辑','vendor/cordis/src/fiber.ts',424,442,'task.then(() => runDisposable(disposable))','yield B异步结束后才A；正文主线只用单Disposer'),
 ('L20','手动清理的同步throw/异步拒绝向首次调用方传播','vendor/cordis/src/fiber.ts',485,514,'throw error','同步assert.throws与异步assert.rejects；不自动重试'),
 ('L21','Fiber卸载记录每项清理错误并继续；不证明外部成功关闭','vendor/cordis/src/fiber.ts',702,723,'this.ctx.logger.error(reason)','正常logger下同步/异步失败均记录，其他清理仍完成'),
 ('L22','logger自身失败不能套用吞错保证','vendor/cordis/src/fiber.ts',287,295,'logger','静态边界；损坏logger进程级故障NOT_RUN'),
 ('L23','on把添加与移除监听封装为所属Fiber的Effect','vendor/cordis/src/events.ts',254,259,'this.ctx.fiber.effect','B卸载后再emit无旧调用；manual/on注册位置交叉'),
 ('L24','分发已经选出的回调/开始的异步工作不会因on移除自动取消','vendor/cordis/src/events.ts',165,187,'.map(hook => hook.callback.bind(thisArg))','真实parallel监听开始后卸载，首次work仍待门闩，后续无旧回调'),
 ('L25','服务运行时provide归属当前Fiber，移除后通知并等依赖转换','vendor/cordis/src/reflect.ts',277,304,'await Promise.allSettled','C Provider显式卸载后Consumer已清理PENDING'),
 ('L26','notify按inject和作用域筛选重新检查依赖','vendor/cordis/src/reflect.ts',314,327,'fiber._refresh()','C单服务同作用域真实；复杂isolate树NOT_RUN'),
 ('L27','依赖激活信息包含实现Fiber uid，支持更换实现重新加载','vendor/cordis/src/fiber.ts',611,638,'epoch +=','C新Provider v2、同Consumer uid、apply两次、旧on零残留'),
 ('L28','Service构造器提供运行时能力，声明合并不创建实例','vendor/cordis/src/service.ts',42,58,'self.ctx.reflect.provide','C无提供方PENDING、提供v1/v2后实际服务值；strict类型另测'),
 ('L29','restart失活再刷新，不清uid；不同于显式永久dispose','vendor/cordis/src/fiber.ts',739,751,'fiber._refresh()','同定义重跑apply、uid不变、on恰好一份；不是原生HMR'),
 ('L30','ToolsService.setExecutor通过Effect持有登记贡献','packages/core/tools/src/index.ts',325,345,'this.ctx.effect','静态辅助定位，不运行完整ToolsService'),
 ('L31','Agent收尾保存Promise，先等工作再scope/存储关闭/登记退出','packages/core/agent-loop/src/index.ts',495,546,'await machine.whenIdle()','静态读真实顺序与try/catch/finally；不是普通Fiber通用保证'),
 ('L32','官方资源测试用门闩检查scope不早于工作退出','packages/core/agent-loop/tests/resource-lifecycle.spec.ts',20,78,'scopeDisposedBeforeWorkExit','只选读setup/action/assertions，未运行其Vitest或递归清理'),
 ('L33','官方shutdown-drain测试根清理后重开存储核末尾事件','packages/core/agent-loop/tests/shutdown-drain.spec.ts',53,70,'await reader.read()','只静态选读，未实测磁盘持久恢复'),
 ('L34','HMR教程另有监视与Loader，restart不等于完整热替换','docs/cordis-tutorial/06-composition-and-hmr.zh.md',23,65,'loader','完整文档阅读；本课未启动watcher、Loader或HMR'),
 ('L35','获取后未交Disposer就失败，不能凭空释放未知资源','vendor/cordis/src/fiber.ts',356,374,'runner.execute.call(this)','内存open标记反例真实执行并手动恢复，无外部资源'),
 ('L36','安全审计尚未完成，资源测试不是安全认证','SAFETY.zh.md',5,15,'尚未接受安全审计','保留官方预览限制，无安全认证测试'),
]
claims=[]
for cid,claim,p,a,b,needle,validation in raw:
 assert 1<=a<=b<=check(p)['lineCount'],cid
 lines=(CACHE/p).read_text(encoding='utf8').splitlines();assert needle in '\n'.join(lines[a-1:b]),(cid,needle)
 claims.append({'id':cid,'claim':claim,'path':p,'start':a,'end':b,'validation':validation,'url':f'https://github.com/deepseek-ai/deepseek-harness/blob/{COMMIT}/{p}#L{a}-L{b}','status':'AUTHOR_SEMANTIC_REVIEW_WITH_SCOPED_EVIDENCE'})
for f in lock['vendorFiles']:
 fact=check(f['path']);assert fact['sha256']==f['sha256'] and fact['gitBlob']==f['gitBlob']
for p in ['LICENSE','vendor/cordis/LICENSE','docs/cordis-tutorial/02-lifecycle-and-effects.zh.md','docs/cordis-tutorial/03-services.zh.md','docs/cordis-tutorial/06-composition-and-hmr.zh.md','docs/cordis-api/fiber.zh.md','docs/cordis-api/registry.zh.md']:
 check(p)
# 断言辅助只防漂移，人工另核 setup/action/catch/finally 与状态因果。
for p,a,b,needles in [
 ('packages/core/agent-loop/tests/resource-lifecycle.spec.ts',20,78,['await release.promise','const disposal = loop.dispose()','expect(scopeDisposedBeforeWorkExit).toBe(false)','expect(ctx.agents.get(agent.id)).toBeUndefined()']),
 ('packages/core/agent-loop/tests/shutdown-drain.spec.ts',53,70,['await ctx.fiber.dispose()','await reader.read()',"kind: 'completed'"]),
 ('packages/core/agent-loop/src/index.ts',495,546,['disposing ??=','await machine.whenIdle()','await machine?.scope.dispose()','await stored?.handle.close()','detachAgent?.()']),
]:
 text='\n'.join((CACHE/p).read_text(encoding='utf8').splitlines()[a-1:b])
 for needle in needles:assert needle in text,(p,needle)
differences=[
 '教程线性状态示意不是完整状态机；Error启动失败在本版先UNLOADING回收，再稳定FAILED。',
 'await插件/句柄的文档简写不能读作一定ACTIVE；缺依赖可以稳定PENDING，已在H05核过。',
 'restart注释中的dispose/reload不是将uid置null的永久dispose；实现只失活再刷新，保持该Fiber身份。',
 '公共Effect/Fiber清理重复调用不重复启动，也不保证重复调用加入在途Promise；结构所有者另有effectInertia加入路径。',
 '整个Fiber独立Effect逆序启动但异步重叠；同一Effect内部串行组合是另一个层次。',
 '卸载通常记录清理错误并继续，但logger失败另有边界；DISPOSED不能证明外部关闭成功。',
 'on撤销不自动取消已经开始的回调；AgentHandle业务级teardown的等待与错误规则不能推广给所有Fiber。',
]
report={'status':'PASS','commit':COMMIT,'method':'each file Git blob SHA1 matched fixed commit ls-tree; SHA256 retained; manual semantic review plus scoped runtime tests','references':refs,'claims':claims,'files':list(checked.values()),'officialTests':'SELECTED_READING_NOT_RUN','runtimeEvidence':'24 course-authored tests execute actual fixed vendor Cordis/Cosmokit; ManualClock/connection are only resource fixtures, not Cordis Mock','differences':differences}
(ROOT/'evidence/source-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
md=f'# H07 固定 Commit 源码核对清单\n\n基线 `{COMMIT}`，Cordis `4.0.6-alpha.1`。按资源创建、所有权、状态驱动、清理启动/完成、错误与恢复分支人工审读；字节/行号/AST只防漂移，不独自证明语义。\n\n|断言|固定依据|条件与验证范围|\n|---|---|---|\n'
for c in claims:md+=f"|{c['id']} · {c['claim']}|[{c['path']}:{c['start']}–{c['end']}]({c['url']})|{c['validation']}|\n"
md+=f'\n正文{len(refs)}个固定范围、{len(claims)}条关键断言、{len(checked)}个逐字节文件。核心精读4文件为registry/fiber/events/reflect，教程/API/工具/Agent与官方测试是辅助依据，不是全都必读。全部文件Git blob与SHA256见 [机器清单](evidence/source-check.json)。\n\n## 精度差异\n\n'
for d in differences:md+='- '+d+'\n'
md+='\n## 证据边界\n\n24项是真实vendor Cordis的作者测试，另有遗漏计时器清理变异非零、strict消费方/TS2345负例。模拟时间与连接只替代外部资源；受控真实Node setInterval另有交叉测试。官方resource-lifecycle/shutdown-drain只选读setup/action/assertions，没有执行它们的递归目录清理，也没有运行完整Harness。\n\n未执行原生HMR、文件监视、Profile/Bundle/Patch、复杂Scope变化、完整Agent/工具管线、真实网络连接/凭据、磁盘恢复或损坏logger进程故障。图一仅画普通非根实例的精选路径，未声称穷举状态机。\n'
(ROOT/'source-checklist.md').write_text(md,encoding='utf8')
print(json.dumps({'status':'PASS','references':len(refs),'claims':len(claims),'files':len(checked)}))
