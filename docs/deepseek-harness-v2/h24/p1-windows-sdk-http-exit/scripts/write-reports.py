from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];E=R/'evidence';P=R.parents[3];H=R.parent
def write(name,text):(R/name).write_text(text.strip()+'\n',encoding='utf-8')
index=json.loads((E/'result-index.json').read_text());baseline=json.loads((E/'baseline.json').read_text());official=json.loads((E/'official-runtime.json').read_text());native=json.loads((E/'standalone-native.json').read_text());full=index['fullSuites'];lifecycle=index['lifecycle'];oldfail=next(r for r in lifecycle if r['actualExit']==3221226505);currentFull=next(r for r in reversed(full) if r['variant']=='default' and r['nodeExecutable']==official['path']);patchFull=next(r for r in reversed(full) if r['variant']=='patch');hookFull=next(r for r in full if r['variant']=='hook');h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
gate=dict(quality='NO-GO',originalP1Cleared=False,scope='fixed f3803c9 author SDK+HTTP source composition on Windows x64 / official Node24.16.0 default SDK exit',gates=[dict(id=1,status='PASS',fact='trigger localized to old Windows Node runtime forced-exit scheduling; builtins-only reproduction and official-binary controls'),dict(id=2,status='FAIL',fact='unchanged fixed SDK default exit on original Node24.16.0 still aborts 0xC0000409 in fresh locked environment'),dict(id=3,status='PASS',fact='unfiltered stderr, external actual process close; exit hooks/observer/patch/new runtime never substituted for original'),dict(id=4,status='PASS',fact='eight fresh exact-lock installs, locks unchanged, no original cache replacement; forensic before-version candidate separately tagged'),dict(id=5,status='PARTIAL',fact='23 hook / 23 patched / 23 official newer runtime, H23 original and patched25, Renderer12 and3width pass; original exit and active EOF/direct-dispose terminal checks not passed'),dict(id=6,status='PASS',fact='E/productWeb/realProvider/performance/cost/learners/measuredtime/externalreview remain unverified; P2 retained')],remaining=['original Node24.16 default exit P1','active HTTP EOF/direct Context disposal lacks persisted Turn end despite exit0','complete E and built product','product Web UI','real Provider','performance/cost','learner trial and measured time','independent external review','learning burden P2'])
(E/'gate-decision.json').write_text(json.dumps(gate,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('README.md','''# H24 Windows SDK＋HTTP 退出专项

**复验结论：保持 NO-GO，原 P1 未解除。** 已定位可复现的触发条件，并交付独立候选补丁与另一官方 Runtime 的限定证据；没有修改锁定官方源码、全局Node或发布状态。

原版固定f3803c96974ad4a94195fb97e5c637e9c2a3afe3的作者核心Profile，在Windows x64/官方Node24.16.0经SDK协议shutdown仍发生原生断言。全新锁依赖仍失败；纯Node内置模块最小复现3/3失败，Listener已关闭，排除“必须有SDK/三个npm包/产品Webserver才触发”。官方Node24.22.1同最小例3/3正常，原源码默认出口23项通过，均未使用退出钩子。

候选SDK补丁在副本中改变默认出口为记录exitCode、暂停输入后自然退出，保留协议/flush/根清理和真实进程观察；Node24.16.0下23项、H23补丁版25项及协议关闭/活动HTTP取消对照通过。它是修补分支，不能标为固定原版通过。活跃HTTP中的EOF/直接Dispose还有终态证据缺口，全部保留为未通过。

1. [环境与只读基线](baseline.md)
2. [复现步骤](reproduction.md)
3. [确定性对照矩阵](reproduction-matrix.md)
4. [原生断言与阶段](native-assertion.md)
5. [三个包的依赖审计](dependency-audit.md)
6. [根因分类与排除](root-cause.md)
7. [补丁及处置](fix-or-disposition.md)
8. [回归与终态](regression.md)
9. [六项解除门禁](gate-decision.md)

[机器结果索引](evidence/result-index.json)、[原始run](evidence/)、[最小代码](minimal/native-repro.mjs)、[候选补丁](patches/sdk-natural-default-exit.patch)。历史fd4f147报告完整副本在original-reports，原始旧run与Fixture原样保留。此专项不是第六模块正式审查，不开发H25，不发布。
''')
write('baseline.md',f'''# 调查前基线

HEAD `{baseline['head']}`，分支main。工作目录`{baseline['cwd']}`。开始前重核原5294个受保护文件全部字节未变；再保存5498个现有文件SHA256，包括H24的204个原交付文件。完整状态、环境变量**名称**、Node/npm/pnpm位置与输出在[evidence/baseline.json](evidence/baseline.json)，不记录真实密钥值。原报告另复制，后续更新明确保留历史。

| 项 | 原环境 |
| --- | --- |
| OS | {baseline['platform']} / {baseline['machine']}，Windows build10.0.26300 |
| Node | D:/Program Files/nodejs/node.exe，24.16.0，SHA256匹配nodejs.org官方win-x64/node.exe |
| npm / pnpm | 11.13.0 / 11.2.2；只读版本查询，禁用Corepack网络自动安装/自动pin |
| 固定源码 | f3803c96974ad4a94195fb97e5c637e9c2a3afe3，H24 source-lock的11865文件身份 |
| 原测试命令 | node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs D；当时失败出口未装测试钩子 |
| 当前教材命令 | 同一runner已用测试exit钩子，故直接运行当前命令不能当默认出口复现 |
| 模式 | 源码：tsconfig.base aliases + tsx；正式lib正向未建立，缺产物反例非成功 |
| 进程工作目录 | 每次新scratch，SDK子进程processCwd为新world.root，业务cwd为world.workspace |
| Home/Profile/输出 | world/home/profiles/h24-fixture、world/workspace、world/sessions；均为隔离Fixture |

本轮SDK白名单环境只含系统运行路径、HARNESS_SOURCE_CACHE、8个H24依赖锚点、H24_RUN_ROOT/APP_ENTRY/TSX_CLI、H24_PROFILE/H24_WORLD、TSX配置和新DSH_HOME。每次具体envNames/argv/cwd在run原始JSON；实际SDK子进程自报的argv/execArgv/cwd与环境名称另存[sdk-child-startup-baseline](evidence/sdk-child-startup-baseline.json)，没有环境值。该启动观测样本仍重现原默认出口失败。Profile配置快照及文件hash在[world-configurations](evidence/world-configurations.json)。唯一假令牌h24-local-only属于公开Fixture，不是用户凭据。

依赖最初在新作者缓存内原地纠正3包的历史操作仍保留；本轮没再原地替换、没批量删除。原始pre-replacement锁和当时npm完整raw未保留，这一取证限制不能倒填。新安装全部在新建目录、使用独立npm cache，不修改全局npm/pnpm配置或主站node_modules。

原17份H24 run已完整解析并核对命令/退出/TAP/错误，索引[evidence/original-run-index.json](evidence/original-run-index.json)保留原文件hash。历史两PID25240/2252失败记录及stdout/stderr不覆盖。教学正文、原QA、源码断言、Fixture及output原样保留；当前23钩子证据与新默认出口证据分列。

发现额外工具差异：主站tsx4.23.15/esbuild0.25.12，而固定测试树是tsx4.23.13/esbuild0.28.2。本轮固定依赖对照的启动CLI和register API均从锁定测试树解析；旧工具对照保留，未改主站依赖。机器原有bundled Node24.22.1二进制SHA不匹配官方发行文件，故只作候选对照；另下载任务自有官方24.22.1并验SHA后才作为可信Runtime对照，未改PATH或全局Node。
''')
write('reproduction.md','''# 原问题和最小复现

所有命令从AI Foundry根执行。只使用本轮新隔离目录；禁止清理已有缓存、Record/Refresh或真实用户Home。

## 一：不依赖npm、SDK或Harness的原生最小例

```powershell
python -X utf8 docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/scripts/run-standalone.py
```

它用外层Python启动minimal/native-repro.mjs，重复3次原Node与3次经SHA校验的官方Node24.22.1。脚本只建127.0.0.1:0服务，固定重定向直到fetch按限制拒绝，关闭Listener及所有连接后调用process.exit(0)。原Node3次均输出EXIT_EVENT requested=0，随后同原生断言、实际exit3221226505；新官方Node3次exit0。外层重新bind每个端口，证明测试自有监听已释放。初始简单fetch/HTTP request/普通Listener退出对照均过，不能概括成“任何fetch都必崩”。

## 二：真实原作者组合默认出口

```powershell
$env:H24_P1_LOADER='pinned'
node docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/scripts/probe-composition.mjs D
```

默认variant=default，不安装exit钩子，SDK YAML行直接指向固定packages/sdk/server/src/index.ts。最初的等价具名re-export对照也保留。它复制H24实验到新scratch，经真实Loader/AppBoot和真实SDK子进程执行D7/D1；D1重现后即按原exit0断言变红，未继续伪称整组通过。底层原始stdout/stderr和trace均留新专项。

diag orchestrator的exit0只说明它成功保存观测；必须看run中的runnerExit/exit和wire.exit。测试driver exit1与实际SDK child exit3221226505是不同层；不能只看顶层shell退出码。原始SDK shutdown响应已到，实际子进程终态仍失败。

## 三：全新正式锁依赖对照

scripts/install-clean.py只在全新目录复制已对固定pnpm逐项核验的8棵package.json/package-lock，使用新private-npm-cache和ignore-scripts安装。每个输入锁安装前后hash一致、无removed输出；不允许已有node_modules。预先准备一次，重复复现可复用evidence/clean-anchors.json，不需要重复安装。

```powershell
$a=Get-Content docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/evidence/clean-anchors.json -Raw | ConvertFrom-Json
foreach($p in $a.PSObject.Properties){[Environment]::SetEnvironmentVariable($p.Name,$p.Value,'Process')}
$env:H24_P1_LOADER='pinned'
node docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/scripts/probe-composition.mjs D
```

source-lock与所有直接/传递版本及integrity在运行前检查。普通试验不允许off-pin；仅显式H24_P1_FORENSIC=1、且为三个已核cache tarball版本时允许历史重建候选，标FORENSIC_NOT_OFFICIAL，不作为干净验收。

## 实际运行链

HarnessClient用Node启动sdk-entry.mjs --profile h24-fixture；入口配置加载h24-fixture manifest（bundles=[]）和真实cordis.yml。14行核心包括LLM、Session、Projection、SystemPrompt、Tools、Native Executor、Agent Registry、FSLocal、WorkingDirectory、JSONL、fixture、Loop、Retry、SDK。

HTTP Listener在父测试进程，由官方startMockLlmServer创建；子级fixture插件注册真实DeepSeekAdapter并拥有undici Agent。调用是父SDK→子SDK Server/Loop→回环Messages/SSE→工具/JSONL。**没有挂packages/host/webserver**，不存在“SDK dispose应关闭父进程Listener”的所有权关系。父finally关闭自己Listener/Socket并重新bind，子进程观察器另等真实close。此作者核心Profile不是发行sdk或sdk-minimal完整树，最高D。

EOF用关闭已拥有子进程stdin，Dispose用隔离目录控制文件触发真实rootFiber.dispose；SIGTERM对照在Windows是TerminateProcess，单列强制观测，不当正常关闭。脚本始终有有界等待，timeout强杀只用于防止测试进程泄漏，绝不计正常PASS。所有临时目录保留。
''')
table='''# 复现矩阵

矩阵来源result-index及原始run/trace。不是TAP独立场景计数；官方src全为作者核心Profile，非发行E。Observer开销样本另列，不作为通过。

| 版本/出口配置 | 方式 | 活跃HTTP | 实际exit / signal | 请求/Socket | Turn终态 | 判定/原始证据 |
| --- | --- | --- | --- | --- | --- | --- |
'''
for r in lifecycle:table+=f"| {r['node']} / {r['variant']} | {r['style']} | {r['active']} | {r['actualExit']} / {r['signal']} | {r['requestCount']} / 剩余{r['socketsRemaining']} | {r['terminal']} | {r['verdict']} / [{r['trace']}](evidence/{r['trace']}) |\n"
table+='''
| 其他对照 | 实际结果 | 边界 |
| --- | --- | --- |
| A 基础SDK无HTTP | 原24.16默认出口C组通过 | 初始化、任务/关闭、Resume、启动前exit7；不替代HTTP组合 |
| B 官方Mock HTTP单组件 | 实际200/SSE、请求记录、关闭/端口复用通过 | 非产品Host WebServer |
| C 原SDK+HTTP | 旧依赖、全新固定依赖、直接固定SDK模块均重现0xC0000409 | 不由代理模块或3包替换独立解释 |
| D 协议/EOF/Dispose/信号 | 上表实际终态 | SIGTERM为强制；活跃EOF/Dispose缺Turn闭合保持FAIL |
| E 源码/构建 | 源码多组已执行；正式lib正向NOT_RUN | 固定树无apps/cli/lib/bin.js；不自打bundle冒充官方构建 |
| F Runtime/依赖 | 原官方24.16失败，新官方24.22.1同路径通过；8新锁树可复现 | 不改用户全局Node；只验证列明版本/Windows |

原生最小脚本在旧官方Node3/3失败，新官方Node3/3正常。正常小fetch对照通过，表明触发与工作/清理时序有关，而不是所有网络调用都会失败。完整exit采样会改变时序并使部分问题消失；带该观察器的通过不清除无观察器失败。

run-matrix.py显式并发2，两个候选补丁协议关闭/活动取消重复对照有重叠执行；各自产生不同world/PID/port，所有测试自有端口可重新bind。它不等全CI压力、所有平台或全部工具的资源认证。
'''
write('reproduction-matrix.md',table)
write('native-assertion.md',f'''# 原生断言、退出阶段和堆栈

原文：`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\\win\\async.c, line 94`。外层实际exit3221226505（0xC0000409），signal=null；请求退出码0不等操作系统终态0。原历史PID25240/2252及本轮多个PID均留完整stderr，未过滤。

直接原版复现之一：[原始trace](evidence/{oldfail['trace']})。该次SDK初始化、safe文件、HTTP三次请求、tool/result、正常Turn及shutdown响应均出现，随后子进程原生断言。JSONL/runtime已由自身effect写出，外层还执行Mock Listener清理/Socket close/port rebind。**harness finally完成与SDK进程正常退出是两项独立检查。** 前者成功不能冲销后者失败。

JavaScript路径采样见有exitObservations的run：官方sdk/server/src/index.ts:56的默认exit，经:73在transport.flush和rootFiber.dispose的await之后调用process.exit。采样通过exit事件读取JS stack/libuv，不覆写exit、不截断stderr；但完整report采样增加时序开销，原24.16部分样本因此不崩。这些采样仅用于定位代码路径，不作零开销成功证据。

本机PATH及常见Windows调试器位置未发现可用native debugger；原libuv断言没有输出C++ Native Stack，未伪造“本机原生栈”。JS stack不是Native Stack，上游issue中的栈也不是本机栈。原生内部机制的佐证来自Node官方源/修复，详见root-cause。独立minimum只含Node内置模块，关闭Listener后仍3次触发同断言，进一步排除必须有SDK、tsx、Koffi或未关Listener才触发。

额外生命周期观测：活跃HTTP中的EOF/直接root Dispose在24.16候选补丁以及新官方24.22.1均可能exit0、零Socket、端口释放，但没有turn/end；新对照的rootDisposePromiseSettled=true仍不等领域闭合已持久。该合同缺口独立保留，不能填为“全部正常退出方式通过”。
''')
write('dependency-audit.md','''# npm三个包替换专项审计

| 包名 | 替换前版本 → 后版本 | 来源/入口 | 影响 |
| --- | --- | --- | --- |
| pretty-ms | 9.3.1 → 9.3.0 | registry.npmjs.org；ESM index.js/types | execa测试/子进程诊断格式；无.node |
| pure-rand | 8.4.2 → 8.4.0 | registry.npmjs.org；CJS/ESM条件子路径 | fast-check随机生成；无.node |
| yoctocolors | 2.2.0 → 2.1.2 | registry.npmjs.org；ESM index.js/types | execa输出颜色；无.node |

替换后版本及integrity均是固定pnpm中条目。替换前pretty-ms9.3.1直接出现在保留的预检失败断言；另两项由同秒缓存tarball、包元数据、完整SRI和纠正后的override共同还原。**原pre-replacement package-lock未保留，另两项没有逐字原锁，不能把高可信还原写成已认证的完整历史目录。** 实际cache key、毫秒时间、tarball SHA512、package.json、exports和native文件检查在[dependency-cache-forensics](evidence/dependency-cache-forensics.json)。8.4.0/8.4.2的条件exports表一致，两版ESM包入口/Node>=18声明也一致；算法/格式细节仍可能影响时序，不能声称完全无影响。

历史原地npm install把当时新作者缓存的3个传递包替换了，package.json新增override，作者package-lock解析发生变化；固定官方pnpm-lock和主站锁未修改。原始控制台3 added/3 removed在旧报告中披露，不伪造当时未保存的npm raw。本轮不再原地替换，没有批量删除或改全局npm/pnpm配置。

## 三套依赖对照

1. 保留的h24-test-deps现存目录已经是纠正后的状态，仍使用它复现同原生断言；不谎称它仍含替换前包。
2. 八个全新目录严格复制已核固定pnpm解析的锁，独立npm cache、ignore-scripts；每个输入锁安装前后hash相同，版本/完整integrity核验全部PASS。新环境原24.16默认SDK+HTTP仍失败。
3. 另建“替换前3版本候选”目录，只将这3条解析设为已核缓存tarball。它是显式forensic候选，非官方pin环境；其余包保持正式锁，runner验证三项SRI，其运行也复现相同断言。它不是恢复了未保留的历史lock，不能用于正式验收。

这些安装各在全新目录开始，输出仅新增，无removed；原依赖树和主仓库node_modules未改；全局包缓存只读核对，没有在其中安装、替换或清理，npm自身查询/版本命令日志不在逐字保护保证中。input/lock/tree/命令/退出在clean-install与before-candidate-install，所有目录保留。这些是正式pnpm条目中本课所需的作者最小npm依赖树，不是整个官方monorepo的干净构建；全量构建未执行。纯Node最小例不加载任何npm包也失败，因此3包替换不是必要条件，不能独立解释整个故障。

三个包都是JavaScript，不改Node Native Binding ABI。fresh安装的.node身份另存clean-native-bindings；纯Node例连Koffi/tsx都不加载，所以不支持把Koffi或三个包直接定为根因。模块解析代表性确有历史偏差：当时初装取到固定锁外传递版本，且runner曾使用主站tsx4.23.15；本轮对照显式把tsx CLI/API统一为固定4.23.13并核esbuild0.28.2，问题仍在。

机器自带另一Node24.22.1的SHA与官方不一致，只保留候选对照，不擅自解释再签名/构建原因。本轮另在新目录下载官方24.22.1 win-x64/node.exe，逐字匹配nodejs.org SHASUMS256，再运行同链。旧24.16也匹配官方SHA；没有全局升级/降级，没有把“版本号不同”自动当修复。
''')
write('root-cause.md','''# 根因与排除过程

**证据支持的归类：Windows／Node24.16.0 Runtime兼容性缺陷，被默认SDK显式process.exit暴露。** 不是已证的产品WebServer、SDK协议编码或三个包Native Binding缺陷。H24作者核心配置与发行完整Profile不同，结论不扩张到所有应用或平台。

本地因果链：同一Windows/x64，官方SHA匹配的Node24.16.0；无npm/SDK/Loader/tsx的最小脚本，Listener/连接已关闭，process.exit仍3/3同断言；换经官方SHA核验的Node24.22.1，相同脚本3/3正常，固定Harness源码默认出口23项也通过。原旧Runtime下更换全新固定依赖、统一loader后，实际H24原路径仍失败。Node源码对照显示旧DelayedTaskScheduler在Stop后仍可向closing async handle提交任务，新版含has_shut_down_守卫。

与[Node官方issue56645](https://github.com/nodejs/node/issues/56645)、[官方修复61999](https://github.com/nodejs/node/pull/61999)的内置fetch/exit回归相符。上游补丁在PostDelayedTask/Stop的同一锁下检查和设置停止状态，防止关闭后继续唤醒。两版node_platform.cc、上游patch、二进制SHASUMS均保存并有hash。**平台层归因由本地无依赖复现支持；具体C++调用栈未本机单步捕获，关联上游内部机制是源码/官方回归支持的解释，不能冒称本机Native Stack。**

| 候选 | 支持/反例 | 本轮结论 |
| --- | --- | --- |
| 作者脚本自身写错exit码 | 外层确实要求0，实际原生非0；纯Node也失败 | 不是简单断言写错；历史加载器代表性偏差另修正调查环境 |
| 三包缓存污染 | 旧纠正缓存、fresh正式锁、before-version候选同故障；无npm最小例也失败 | 不能独立解释；不排除时序影响 |
| src/lib混用 | 全部组合明确src；固定aliases；无正式lib产物加载 | 没有支持它为此次触发原因的证据；lib正向仍未验 |
| 生命周期清理顺序 | SDK协议先回响应、再flush/root dispose，原生例Listener已关闭 | 无法归咎产品HTTP清理；活跃EOF/直接Dispose缺领域终态是独立合同缺口 |
| SDK协议关闭异常 | initialize/run/shutdown帧和业务结果成功，但终态失败；无SDK例也复现 | 不是协议编码必要条件，默认SDK显式退出是触发点 |
| HTTP Socket/Listener | 基础HTTP和Socket关闭可过；最小例关闭Listener后还崩 | 未关Listener不是必要条件；不可把进程OS回收当正常业务结算 |
| Node/Windows | 官方旧二进制最小例3/3、新官方二进制3/3过、源码守卫差异 | 平台限定归类成立；其他Node范围、非Windows未测 |

没有人为延迟process.exit、不用隐藏stderr/强杀/禁用HTTP作修复。完整exit report会改变竞态，所以仅做路径采样。没有证实“所有fetch后都会崩”或“所有新Node都修复”；目前只实测这两份官方Windows x64二进制。
''')
write('fix-or-disposition.md',f'''# 最小修补分支与处置

**固定原版不变，原P1未解除。** 本轮没有把上游cache改了再声称仍是原Commit。

## 独立候选SDK补丁

[sdk-natural-default-exit.patch](patches/sdk-natural-default-exit.patch)，SHA256 `{h(R/'patches/sdk-natural-default-exit.patch')}`。只改变默认退出动作：process.exit(code)改为记录process.exitCode并暂停输入，让事件循环自然结束；shutdown请求、响应、transport.flush、rootFiber.dispose及配置测试钩子契约均保留。没有降低外层观察：仍等实际child.close，核exit0、无原生断言、文件/JSONL与端口/Socket。

补丁只写新scratch的SDK index副本。[patch-apply-check](evidence/patch-apply-check.json)证明git apply在另一隔离SDK源副本中可用，结果逐字等于预期单行修改；单次命令关闭autocrlf，不改全局Git配置。由于执行副本不在上游目录，probe将其server.ts两个相对引用改为固定源码file URL，确保共用同一真实服务类；这只是测试覆盖定位，不是正式patch内容。所有其他Harness包仍由固定源aliases解析，没有引入lib第二单例。元数据标variant=patch、actualPrograms SHA及SDK模块路径；这份证据应称f3803c9＋本地patch，不能称f3803c9原版。

Node24.16.0的候选补丁23项通过（[{patchFull['raw']}](evidence/{patchFull['raw']})），H23补丁版25项也通过；协议正常关闭和真实HTTP活动取消的重复/受控并行对照，exit0/无断言/Socket0/端口复用/领域预期均过。活跃EOF/直接Dispose仍缺turn/end，不在补丁成功范围。候选补丁未覆盖完整发行Profile、所有输入/平台、任意不响应工具或其他资源持有者，不能立即当作生产通用修复。

## 独立官方Runtime对照

官方Node24.22.1完整路径：`{official['path']}`，SHA256 `{official['sha256']}`，与nodejs.org发行清单一致。固定原版SDK直接Loader行、不装exit钩子，在新锁环境23项通过（[{currentFull['raw']}](evidence/{currentFull['raw']})）。它说明存在可工作的限定Runtime路径，不自动改用户Node，不把未测试的版本区间都写为安全。

## 本轮处置

原基线Windows＋Node24.16.0＋固定SDK默认出口仍失败，故解除门禁二不满足，维持NO-GO。候选源码补丁和替代Runtime都与原基线分开。活跃EOF/直接Dispose的领域闭合缺口另保留，未把exit0或root dispose Promise结算等同全部事实已闭合。建议上游核默认进程退出策略，课程负责人未来明确支持Runtime后再申请原路径/发行入口复验；本轮不提交上游PR、不发布、不开展模块正式审查。
''')
reg='''# 回归、实际终态与剩余缺口

| 必须检查 | 实际证据与结论 |
| --- | --- |
| 原失败组合真实启动 | 真实YAML/Loader、SDK子进程、Adapter/HTTP；原24.16直接默认模块仍原生非0，FAIL |
| SDK初始化/协议shutdown | 真实initialize响应、prompt回执、通知及shutdown响应；不能替代终态 |
| HTTP Listener实际创建/关闭 | 官方Mock Server动态回环，真实200/429/SSE和请求记录，finally后同端口再bind |
| 既有Socket和活动请求 | diagnostics_channel观察每个已请求Socket；最终0，活动HTTP取消有1个真实请求；EOF/Dispose领域闭合缺口另列 |
| 实际子进程终态/stderr | 外层child.close、wire.exit/signal及原样stderr；协议原版FAIL，patch/新官方Runtime所列正常路径PASS |
| 重复/受控并行 | run-matrix并发2；各world/PID/动态port隔离，patch协议完成/取消各重复2；不等全CI负载 |
| 原23行为 | 同一23身份C9/D14，hook配置重跑通过；不是原默认出口通过 |
| 补丁23 / 新官方Runtime23 | 各23、C9/D14；相同语义重复不相加；原版与patch分支明确 |
| H23相关行为 | 原版25=C7/D18、SDK默认补丁版同25均过；原H23代码/报告/证据未改 |
| Renderer | 12/12，原TAP在renderer-regression.json |
| 三宽度 | 1440/390/320真实LessonMarkdown+平台CSS，42份完整复制、键盘折叠、原图与横滚、长答案；visual-qa及3张实际查看样本 |
| 无残余进程 | 最终范围审计检查本轮Node/esbuild；Playwright.close已等待；不对无关用户进程作断言 |

所有原始run、失败和源Fixture保留；测试结束前先清自己Socket/Listener和子进程，磁盘目录保留。Windows SIGTERM实测为强制终止，记录FORCED_NOT_GRACEFUL，不拿它冲绿正常关闭。未运行任何无界重试或真实危险工具。[H23原版25项](evidence/h23-lab-results.json)、[H23候选补丁25项](evidence/h23-patched-lab-results.json)分别保留，不修改前课或把两次计成50种新行为。

## 未通过和未验证

活跃HTTP时EOF/直接root Dispose：exit0、root Dispose Promise可结算、Socket0和端口可复用，但raw JSONL没有turn/end。按本轮预期“活动闭合并持久”的标准为FAIL，不修改预期或删除该场景。它可能涉及全根卸载与领域关闭的不同契约/顺序，尚未做独立上游归因；不能仅据它断言数据损坏或所有SDK EOF都失败。已完成任务时EOF/Dispose对照通过，协议shutdown主动取消路径又有aborted事实，必须分列。

正式lib正向/完整发行Profile/E、产品Web/Host权限、真实Provider、真实性能和成本、学员试读/实测时长、独立外审均未验证；学习负担P2不变。教材Chrome不是产品Web，合成/功能duration不是性能数据。最高D。
'''
reg+='\n## 完整23项原始TAP索引\n\n| 环境/分支 | 数量 | 原始run |\n| --- | --- | --- |\n'
for r in full:reg+=f"| {r['node']} / {r['variant']} | {r['passed']}/23 | [{r['raw']}](evidence/{r['raw']}) |\n"
write('regression.md',reg)
g='''# H24 NO-GO解除门禁

**新作者侧结论：NO-GO，未解除原P1。** 不是自动CONDITIONAL GO。根因定位与分支通过不能替代原基线真实出口通过。

| 门禁 | 结果 | 依据 |
| --- | --- | --- |
'''
for row in gate['gates']:g+=f"| {row['id']} | {row['status']} | {row['fact']} |\n"
g+='''
门禁二失败，门禁五部分通过，因此不具备解除条件。原版24.16失败、补丁24.16通过、新官方24.22.1通过及测试钩子通过分别登记，不做平均通过率，也不改A–E定义。活跃EOF/Dispose无领域闭合证据又独立保留。

E、产品Web、真实Provider、性能成本、学员/实测时长/独立外审、P2继续开放。此次交付是完成专项调查、最小候选修补与重新验收，非完成原版修复；没有改发布状态、正式模块审查或下一课。下一次解除申请须明确目标Runtime/原版或修补版身份、默认出口和实际资源/领域终态，重新提交相应证据。
'''
write('gate-decision.md',g)
write('upstream/README.md','''# 上游诊断输入

Node官方issue56645与PR61999为外部佐证，不替代本机失败；Node两版node_platform.cc、PR patch及官方SHASUMS仅作差异/身份核对。本机未获得C++native stack。

- https://github.com/nodejs/node/issues/56645
- https://github.com/nodejs/node/pull/61999
- https://raw.githubusercontent.com/nodejs/node/v24.16.0/src/node_platform.cc
- https://raw.githubusercontent.com/nodejs/node/v24.22.1/src/node_platform.cc
- https://nodejs.org/dist/v24.16.0/SHASUMS256.txt
- https://nodejs.org/dist/v24.22.1/SHASUMS256.txt

Node来源版权/许可见LICENSE-node.txt。官方Runtime仅下载到本轮隔离临时目录，二进制不入Git，不修改用户全局安装。仅实测Windows x64两版，不推断所有版本区间或非Windows。
''')
print('Ten requested investigation reports and machine-readable NO-GO gate decision generated')
