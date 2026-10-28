"""Build the private V2 research packet from authored lesson specifications.
No platform files, public assets, original lessons or user files are written.
"""
from pathlib import Path
import hashlib, json, re, subprocess, sys

OUT = Path(__file__).resolve().parents[1]
ROOT = OUT.parents[1]
COMMIT = 'f3803c96974ad4a94195fb97e5c637e9c2a3afe3'
SOURCE = Path(sys.argv[1]) if len(sys.argv)>1 else Path('C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-'+COMMIT)
BASE = 'https://github.com/deepseek-ai/deepseek-harness/blob/'+COMMIT+'/'
for name in ['evidence','labs','figures/source','figures/rendered','figures/qa']:
    (OUT/name).mkdir(parents=True,exist_ok=True)

def write(name,text):
    (OUT/name).write_text(text.strip()+'\n',encoding='utf-8')

REFS={}
def ref(path, needle='', span=28):
    key=(path,needle)
    if key not in REFS:
        p=SOURCE/path
        assert p.is_file(), path
        lines=p.read_text('utf-8').splitlines()
        matches=[i+1 for i,s in enumerate(lines) if needle in s] if needle else [1]
        assert matches, (path,needle)
        start=matches[0]; end=min(len(lines),start+span-1)
        REFS[key]={'id':f'S{len(REFS)+1:03}', 'path':path,'symbol':needle or '文件入口',
          'start':start,'end':end,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
          'url':BASE+path+f'#L{start}-L{end}', 'status':'STATIC_VERIFIED',
          'excerpt':lines[start-1:end]}
    return REFS[key]

def cite(path,needle='',span=28):
    r=ref(path,needle,span)
    return f"[{r['id']} · {path}:{r['start']}]({r['url']})"

def R(path,needle,why): return (path,needle,why)
P='packages/'
AG=P+'core/agent/src/index.ts'
LOOP=P+'core/agent-loop/src/agent.ts'
FACT=P+'core/agent-loop/src/index.ts'
SESSION=P+'core/session/src/index.ts'
TOOLS=P+'core/tools/src/index.ts'
PIPE=P+'core/tools/src/pipeline.ts'
PROMPT=P+'core/system-prompt/src/index.ts'
LLM=P+'llm/llm/src/index.ts'
PROFILE=P+'boot/app-boot/src/profile.ts'
EV='vendor/cordis/src/events.ts'
CTX='vendor/cordis/src/context.ts'
FIB='vendor/cordis/src/fiber.ts'
SP=P+'session/session-projection/src/index.ts'
MODULES=['Harness 整体认知','Cordis 与插件架构','Agent 核心运行引擎','工具执行与安全机制','Session 与运行可靠性','复杂智能体系统','高级拓展']
LESSONS=[]
def L(n,title,pre,stage,problem,goal,concepts,terms,case,docs,routes,chain,structures,explain,trade,tests,lab,question,answer,risk,accept,time,bridge):
    LESSONS.append(dict(id=f'H{n:02}',title=title,module=MODULES[min((n-1)//4,6)],pre=pre,stage=stage,
      problem=problem,goal=goal,concepts=concepts,terms=terms,case=case,docs=docs,routes=routes,
      chain=chain,structures=structures,explain=explain,trade=trade,tests=tests,lab=lab,
      question=question,answer=answer,risk=risk,accept=accept,time=time,bridge=bridge))

L(1,'为什么有了大模型，还需要 Harness？','能说明一次模型 API 请求的输入与输出','s3-l1,s4-l1',
 '模型提出“搜索资料并保存结论”，谁来执行、记住进度并阻止未获准的动作？',
 '用可追踪证据划分模型决策与运行环境执行的职责。','LLM、Agent、Harness、能力 seam','Harness、Runtime、Capability Seam',
 '研究助理能提议查档案，工作台还须提供工具、日志与审批；提议不是执行授权。',
 ['README.zh.md','SAFETY.zh.md','docs/architecture.zh.md'],
 [R(AG,'export interface AgentFactory','先看创建/恢复的公开契约，认识宿主责任'),R(LOOP,'private async step(','再看模型结果如何进入工具执行'),R(PIPE,'async prepare(','最后看动作如何在执行前被拒绝')],
 'ReactLoopAgent.step → preparedCall.stream/llm.stream → tools.execute → ToolExecutionPipeline.prepare；图中 Harness 是职责集合。',
 'AgentFactory、StreamChunk、PreToolDecision；不把三者画成三个独立进程。',
 '用无工具回答和带 tool-call 回答并排追踪：前者可完成，后者仍需宿主分派。',
 '官方实现：loop 也是插件。设计思考：可替换性增加组合验证成本，不能据此断言比所有框架更好。',
 ['packages/core/agent-loop/tests/tool-calls.spec.ts'],
 '练习卡 L01：将“产生调用、执行调用、记录结果、批准写入”四项分给模型与 Runtime；运行 lab M1 核对两条轨迹。',
 '为什么在系统提示词里写“不要越权”不能代替工具策略？',
 '提示词影响模型提议；执行器必须对不可信提议独立检查，工具返回内容也不是新授权。',
 '开发者预览未安全审计；三层关系是教学抽象，不能把 Harness 等同沙箱。',
 '交一张职责图及一次被拒绝调用的轨迹，指出模型与执行器各自的证据位置。','55–75 分钟','由 Stage 4 最小循环进入仓库地图；H02 找到各职责所在包。')

L(2,'从零读懂 DeepSeek Harness 仓库结构','H01；能识别 import/export 与 package.json','s1-l4,s1-l5,s2-l8',
 '仓库有大量包，直接从根目录逐个读会迷路，怎样围绕一次功能找入口？',
 '从用户能力反查服务、提供方、消费方与测试。','Monorepo、workspace、包边界、Host/Client','Service Definition、Provider、Consumer',
 '找一家医院的挂号台、科室协议和实际诊室；目录是地图，不能只凭包名判断运行依赖。',
 ['docs/architecture.zh.md','docs/development.zh.md','docs/capability-seams.zh.md'],
 [R('package.json','"packageManager"','先核对工具链与 workspace 层级'),R('tsconfig.base.json','"@deepseek-ai/cordis"','再看包名如何映射到源码'),R('packages/core/tool-executor-native/src/index.ts','export class NativeToolExecutor','沿一个小提供方回到 tools seam')],
 'package workspace → tsconfig paths → native executor → tools pipeline；区分构建依赖和运行服务注入。',
 'package.json workspaces、Context 声明合并、inject、ToolExecutor。',
 '从 native executor 的 describe/execute 看“提供方”而非扫描全部 core；只打开定义、消费方与相邻 tests。',
 '官方采用两层 packages/<领域>/<包>。Host/Client 类型检查分离是声明合并冲突的工程边界。',
 ['scripts/verify-package-paths.spec.ts'],
 '练习卡 L02：为一次工具执行列出三角色包、两个 import 和一个测试，不安装整个仓库。',
 'npm 包名和目录名不相同时，应该信搜索结果还是凭名称猜路径？',
 '先查 package.json 和 tsconfig paths，再验证真实源码及导出；目录邻近不代表调用。',
 '不得混用旧版单层 packages 布局；Node 要求来自锁定 package.json。',
 '路径查找脚本验证三条文件存在；手写一条“入口→接口→实现→测试”路线。','60–80 分钟','H01 的职责在此落到文件；H03 把文件连成时序。')

L(3,'一个 Agent 请求的完整执行流程','H02；会读异步函数','s3-l1,s3-l3,s4-l1',
 '用户提交后出现流式文字、工具卡片和下一次模型调用，这些阶段究竟由谁连接？',
 '按持久事实与实时通知两条线复述一次请求。','Inbox、Turn、Step、请求组装、流式 settlement','Settlement、Projection、Request Series',
 '餐厅点单进入待办篮，厨师一轮可多次取料；屏幕进度不等于已归档的账单。',
 ['docs/architecture.zh.md','docs/agent-lifecycle.zh.md'],
 [R(FACT,'private async initializeAgent(','先看创建完成后才放行工作的边界'),R(LOOP,'private async turn():','再读轮次打开和结束'),R(LOOP,'private async step(','逐段看流与工具'),R(SESSION,'deriveMessages():','最后核对下一请求从哪里取得历史')],
 'initializeAgent → sessions.announce → agents.announce → turn → preStep → step → prepareRequest/buildRequest → stream → tools.execute → 下一 step。',
 'SessionEventMap、GenerateOptions、AssistantStreamAttempt、ToolBatchResult。',
 '以一次只读搜索为主线标注 turn/start、step/start、assistant/message、tool/call、tool/result、step/end、turn/end。',
 '实时 chunk 服务于体验；durable settlement 服务于重建。硬退出可能发生在 settlement 之前。',
 ['packages/core/agent-loop/tests/loop.spec.ts','packages/core/agent-loop/tests/request-reconstruction.spec.ts'],
 '练习卡 L03：给固定 Mock 轨迹排序，找出 tool/result 后还欠的下一请求；运行 M1。',
 '实时 chunk 到达但进程在 settlement 前退出，能保证日志已有完整回答吗？',
 '不能。已提交 message/attempt 才是持久来源；live stream 不能等价为逐 chunk 持久化。',
 '一条请求不必等于一个 turn；middleware 可以阻止首个 step。',
 '事件顺序正确且将 5 个实时扩展点与会话记录分开解释。','75–100 分钟','H04 定位启动组合；H09–H12 再拆开精读，不在本讲穷尽错误分支。')

L(4,'Profile、运行入口与环境配置','H03；理解环境变量与服务端凭据','s1-l0,s2-l8,s3-l1',
 '同一个 dsh 为什么能启动 Web、Headless 或 SDK，而工具集合还可以不同？',
 '在不启动模型的前提下解释启动配置的来源和覆盖顺序。','Profile、Harness home、启动器、patch overlay','Profile、Bundle、Patch、HMR',
 '同一套厨房用不同班次菜单开工；菜单组合不是复制一套厨房代码。',
 ['docs/architecture.zh.md','docs/subsystems/boot.zh.md','docs/development.zh.md'],
 [R('apps/cli/src/bin.ts','','先识别支持的产品入口'),R('apps/cli/src/profile-boot.ts','','再查 profile runner 如何交给 boot'),R(PROFILE,'export function resolveProfileDir','核对 home/profile 路径及非法名称拒绝'),R('packages/bundle/base/cordis.patch.yml','','观察声明配置而不执行')],
 'CLI 参数 → profile runner → profile discovery/composition → Loader 插件树；源码启动须先有构建产物。',
 'Profile、ProfileLayer、dsh.profile.bundles、dsh.bundle.patch。',
 '对照 web 与 sdk-minimal：后者不叠 base；展示变量名而不用真实 key，也不运行 npx 最新版。',
 '版本隔离优先；“相同命令”不表示相同 profile 或运行树。',
 ['packages/boot/app-boot/tests/profile.spec.ts','packages/boot/app-boot/tests/config-dump.spec.ts'],
 '练习卡 L04：只用内存配置合成三层菜单并说明缺项；运行 M1 的 route fixture，不读本机 home。',
 'sdk-minimal 能否按“base 加 SDK”来画？',
 '不能；锁定版把它作为显式完整组合的例外，需要单独跟踪其 bundle。',
 '本轮不安装、不读取个人 DSH home；绝不打印凭据值。',
 '准确列出层优先级、sdk-minimal 例外与构建前提；解释非法 profile 名的拒绝。','60–85 分钟','H05–H07 解释树如何运行；H08 才精读 patch 算法。')

L(5,'一切皆插件——Cordis 设计思想','H04；基础 TypeScript interface','s1-l4,s3-l1',
 '模型服务、工具与存储若都写死在一个类里，更换能力为什么会牵连多处？',
 '用 Context 服务查询与 inject 说明模块怎样依赖接口。','Plugin、Service、Context、依赖注入','Dependency Injection、Side Effect',
 '办公楼统一插座让设备可替换；Context 不替设备完成工作，inject 也不是把所有对象复制进去。',
 ['docs/cordis-primer.zh.md','docs/cordis-tutorial/index.zh.md'],
 [R(CTX,'export class Context','先看服务容器与代理入口'),R('vendor/cordis/src/service.ts','class Service','再看服务声明与挂载'),R('packages/core/tool-executor-native/src/index.ts','export const inject','用短插件核对真实依赖')],
 '插件声明 inject → registry 等待服务 → apply/Service 初始化 → ctx.tools.setExecutor；卸载由 effect 回收。',
 'Context、Service、Plugin、InjectKey；类型声明和运行时存在性分开。',
 '先把写死的 mailer 参数化，再回到 native executor；教学参数注入不能冒称完整 Cordis。',
 '可替换的是服务契约及组合，不保证任意插件彼此兼容。',
 ['packages/core/tools/tests/tools.spec.ts'],
 '练习卡 L05：写一个只依赖日志接口的计数插件，替换内存日志实现；运行 M2。',
 '声明合并让 ctx.foo 在编译时存在，是否证明运行时已挂载？',
 '不证明；声明合并只扩展类型，服务还须注册且满足 inject 与作用域。',
 '不要把 Context 当全局单例；不要把 inject 解释成自动导入 npm 包。',
 '更换假日志服务后插件代码不变；指出一个真实 inject 与服务 key。','70–95 分钟','H06 解释服务间事件；H07 解释依赖撤走后的生命周期。')

L(6,'事件系统与插件间通信机制','H05；Promise 与返回值','s3-l3,s4-l3',
 '日志观察、等待初始化和拦截工具都叫事件，为什么不能都用 emit？',
 '根据顺序、等待与短路需求选择正确分发模式。','emit、parallel、serial、bail、waterfall','Waterfall、Hook、Continuation、Bail Value',
 '快递签收观察 vs 多道检查站；Waterfall 像一层层包装的服务台，回程按相反顺序返回。',
 ['docs/cordis-primer.zh.md','docs/event-producer-consumer.zh.md'],
 [R(EV,'export function isBailed','先明确哪些返回值会停止'),R(EV,'async serial(...args','再看按序 await 与 bail'),R(EV,'waterfall(...args','最后跟踪 next 闭包'),R(PIPE,"carrier, 'tools/pre-execute'",'回到真实策略事件')],
 'EventsService.waterfall → snapshot callbacks → next → listener A → listener B → fallback → B → A；不调用 next 则下游不运行。',
 'DispatchMode、Events 声明合并、next 回调、PreToolDecision。',
 '用 A-before/B-before/body/B-after/A-after 的确定性轨迹；serial 返回 0 会 bail，而 false 不会。',
 'waterfall 本身不自动 await，但可返回 Promise；serial 也有短路，不是保证所有监听器必执行。',
 ['packages/core/agent-loop/tests/serial-listener-review.spec.ts','packages/core/tools/tests/tools.spec.ts'],
 '练习卡 L06：实现环绕与拒绝两条路径；运行 M2，再运行官方 Cordis probe 对照。',
 '观察工具的 listener 忘记 next() 会发生什么？0 与 false 对 bail 是否相同？',
 '前者可能截断后续策略与默认实现；0 是 bail 值，false 不是。',
 '不要把 Waterfall 讲成上一个数值自动传给下一个函数；异步由返回类型决定。',
 '两条轨迹完全匹配；能说明 serial、emit 的返回值与等待差异。','80–110 分钟','H07 接着看 listener 与插件卸载；H14 再用 Waterfall 研究真实执行策略。')

L(7,'插件生命周期、服务依赖与资源回收','H06；try/finally','s1-l3,s3-l3',
 '热重载后监听器触发两次、关闭后还在写日志，泄漏从哪里来？',
 '将每次注册与其所有者、释放函数和等待边界配对。','Fiber、Scope、effect、disposer、依赖失效','Lifecycle、Side Effect、Quiescence',
 '会议室借钥匙、开灯、登记都应有归还动作；收回钥匙不等于正在进行的会议已结束。',
 ['docs/cordis-primer.zh.md','docs/subsystems/scope.zh.md'],
 [R(FIB,'export class Fiber','先看插件生命周期的承载者'),R('vendor/cordis/src/registry.ts','export class RegistryService','再看依赖管理'),R(EV,'register(label:','跟踪 on 的注册如何成为 effect'),R(FACT,'private async initializeAgent(','用 Agent 销毁的等待边界检验直觉')],
 'ctx.on → fiber.effect → disposer；Agent dispose → cancel → idle/drain → registry/session removal → scope.dispose。',
 'Fiber、FiberState、EffectMeta、AgentHandle.dispose；agent scope 与 Cordis isolation 不可混称。',
 '先画资源归属表，再按释放时仍需用到日志/服务的要求讨论顺序，不承诺所有 effect 都全局逆序。',
 '卸载要保留正在 drain 的工作所需资源；具体先后须跟实现，不凭 RAII 类比猜。',
 ['packages/core/agent-loop/tests/resource-lifecycle.spec.ts','packages/core/agent-loop/tests/shutdown-drain.spec.ts','packages/core/scope/tests/scope.spec.ts'],
 '练习卡 L07：模拟 mount→emit→dispose→emit，断言第二次不触发且重复 dispose 不新增事件；运行 M2。',
 '取消 signal 已置位，为什么还可能要等待工具 promise？',
 '工具已经开始，须等待它静止并清理；signal 不会自动撤销副作用，也不是资源释放凭证。',
 'Scope 有多种含义；本讲分别标注 Cordis fiber 与 agent 注册作用域。',
 '每个 listener、provider、Agent handle 都有 owner/disposer；指出一个 shutdown 测试。','80–110 分钟','H08 用生命周期解释配置重载；H09 开始研究 Agent 的所有权。')

L(8,'Profile、Bundle、Patch 与动态能力组合','H04–H07','s1-l5,s2-l8',
 '希望只替换一个模型后端，却发现配置里另外两个字段消失了，patch 到底如何覆盖？',
 '按固定顺序手算一棵可审查的插件树。','条目 id、配置替换、preset patch、isolate、HMR','Patch、Bundle、Realm',
 '装配清单的后层替换整张零件规格单，不能默认逐字段深合并。',
 ['docs/architecture.zh.md','docs/subsystems/boot.zh.md'],
 [R(PROFILE,'export function bundlePatchFiles','先从 manifest 得到有序 patch 列表'),R('packages/boot/app-boot/src/index.ts','export function renderConfigDump','再找与 boot 一致的展开核查入口'),R('vendor/include/src/index.ts','export function applyEntryPatches','精读按 id 定位与 config 替换'),R('packages/bundle/base/cordis.patch.yml','','核对真实组装行')],
 'ordered bundles → profile patch → home patch → --patch overlay → applyEntryPatches → Loader；preset patch 在 config.plugins 内作用。',
 'ProfileLayer、PatchOptions、EntryOptions、config.plugins、isolate map。',
 '给三份小 YAML，手算替换后 temperature 是否仍在；先看算法，再用 base 的真实行做例子。',
 '配置开放提高灵活性，也可能因移除安全插件改变边界；dump-config 是检查工具，不等于安全审计。',
 ['packages/boot/app-boot/tests/user-patches.spec.ts','packages/boot/app-boot/tests/config-reload.spec.ts'],
 '练习卡 L08：实现教学版整 config 替换，验证后层覆盖与未知目标诊断；扩展 M2 的 fixture。官方对不匹配目标报告 warn，不擅自改称 throw。',
 '用 patch 只写 config.model，能默认继承旧 config.provider 吗？',
 '不能按深合并推断；课程示例应给出完整替换配置，并核对实际 patch 操作。',
 'HMR 默认随 profile 不同；sdk-minimal 不包含 base；不对个人配置做实验。',
 '提交三层输入与唯一结果，说明覆盖丢字段和组合改变权限的风险。','85–115 分钟','H04 只认识层次，本讲计算算法；H09 进入组装后的运行对象。')

if __name__ == '__main__':
    exec(compile((OUT/'scripts/generate_packet.py').read_text('utf-8'),'generate_packet.py','exec'))
    exec(compile((OUT/'scripts/reports.py').read_text('utf-8'),'reports.py','exec'))
