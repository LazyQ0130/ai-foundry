from pathlib import Path
import json
R=Path('docs/deepseek-harness-v2/h23').resolve();L=json.loads((R/'evidence/source-lock.json').read_text());S=Path(L['sourceCache']);C=L['commit'];rows=[]
def add(f,a,b,symbol,claim,test,local='STATIC_REVIEW'):
 lines=(S/f).read_text(encoding='utf-8').splitlines();a=next(i+1 for i,l in enumerate(lines) if a in l) if isinstance(a,str) else a
 if isinstance(b,str):b=next(i for i,l in enumerate(lines,1) if i>a and b in l)-1
 b=len(lines) if b is None else min(b,len(lines));assert 0<a<=b
 assert (S/test).is_file(),test
 rows.append(dict(claim=f'S{len(rows)+1:02}',commit=C,file=f,start=a,end=b,symbol=symbol,controlBranch=claim,conclusion=claim,officialTest=dict(file=test,start=1,status='REFERENCE_LOCATED_NOT_EXECUTED'),localTest=local,grade=local[0] if local.startswith(('C ','D ')) else 'STATIC',status='STATIC_REVIEW' if local=='STATIC_REVIEW' else 'DYNAMIC_LIMITED_TO_NAMED_LOCAL_SUBBRANCH'))
cli='apps/cli/tests/args.spec.ts'
if not (S/cli).exists():cli='apps/cli/src/args.ts'
gt='packages/api/gateway/tests/gateway.host.spec.ts';sc='packages/api/session-controller/tests/transport.host.spec.ts';st='packages/sdk/server/tests/server.spec.ts';ct='packages/sdk/client/tests/client.spec.ts'
if not(S/ct).exists():ct=next((S/'packages/sdk/client/tests').glob('*.spec.ts')).relative_to(S).as_posix()
add('apps/cli/src/args.ts',18,None,'parseDshArgs','启动器只解析自身Profile/Patch/dump，首个未知token后交给应用；别名dsh name；help/version/非法参数在子进程退出，不是TUI。',cli,'C A1; C A2')
add('apps/cli/src/bin.ts',1,None,'runCli','profile、plugin、dump-config、dump-schema四分支；应用启动错误才走诊断/exit1，正常dump不启动模型。','apps/cli/src/bin.ts','C A4')
add('apps/cli/src/profile-boot.ts',73,88,'homePatchPath','Home patch为每次按DSH_HOME解析，不能读取真实用户Home来测试；启动器实参与应用内cmdlineArgs分开。','packages/boot/app-boot/tests/profile.spec.ts')
add('apps/cli/src/profile-boot.ts',194,238,'prepareProfile','具名Profile、可选userLayer、初始化模板及CLI覆盖读取；不能把sdk-minimal概括为base+SDK。','packages/boot/app-boot/tests/profile.spec.ts')
add('apps/cli/src/profile-boot.ts',271,None,'runProfile','按bundle/profile/home/extra等有效patch层启动Loader；应用参数作为不可变cmdlineArgs给内层；AppReady有独立确认点。','packages/boot/app-boot/tests/profile.spec.ts')
add('packages/boot/app-boot/src/profile.ts',165,227,'resolveProfileDir / initProfile','校非法Profile名，初始化指定目录；实验只新建明确fixture home。','packages/boot/app-boot/tests/profile.spec.ts','C A3')
add('packages/boot/app-boot/src/profile.ts',678,None,'loadProfileDirectory / composeEntries','包Bundle层按序、Profile用户层单独，配置dump与boot共用applyEntryPatches；config整体替换，不是深合并。','packages/boot/app-boot/tests/profile.spec.ts','C A3; C A4')
add('packages/bundle/sdk-minimal/package.json',1,None,'sdk-minimal manifest','最小SDK是显式完整组合，不自动叠base；实验控制组合不能冒称这个发行Profile全量通过。','packages/bundle/sdk-minimal/package.json')
add('packages/client/web/src/boot.ts',23,None,'AppWebEntry','BootPage先出现，创建module系统、prefetch立即层、bootClient与mountClient；失败有page.fail或调用方onFailure。','packages/client/web/src/boot.ts')
add('packages/client/modules/src/index.ts',1,None,'Client modules','客户端模块图/同步factory解析和Cordis运行服务注入分层；并非import名字存在即可运行。','packages/client/AGENTS.md')
add('packages/client/web/src/mount.ts',1,None,'mountClient','UI renderer只承担挂载展示，Host业务与权限并不转移到React。','packages/client/web/src/mount.ts')
add('packages/client/connection/src/client/index.ts',149,206,'ConnectionHandle','generation与state观察、RPC、socket、reconnect与唯一generation source各有职责。','packages/client/connection/src/client/connection.ts','C B4')
add('packages/client/connection/src/client/index.ts',228,342,'installConnection','可显式注入rpc/fetch等载体；ready形成代际、丢线撤代际；测试控制载体不等于浏览器WS。','packages/client/connection/src/client/connection.ts','C B4; D B1')
add('packages/client/connection/src/client/connection.ts',1,None,'ConnectionController','旧source在abort后须清理结算才开新代；ready过期不覆盖，retry/offline/sink异常分支独立。','packages/client/connection/src/client/connection.ts','C B4')
add('packages/client/connection/src/client/rpc.ts',35,87,'createWebConnectionRpc','应用RPC envelope含type/rpcId/method/payload，经HTTP POST；核response关联id，不是SDK JSON-RPC。','packages/client/connection/src/client/rpc.ts','D B1; C B2')
add('packages/client/connection/src/index.ts',137,None,'Host Connection apply','HTTP路径先Host/Origin与BrowserAuth准入，再carrier-neutral注册处理；知道地址/隐藏按钮不是授权。','packages/client/connection/src/index.ts')
add('packages/client/connection/src/browser-auth.ts',1,None,'BrowserAuth','启动token交换持久浏览器cookie及API认证是Host载体边界；owner Peer前提不能由UI自行声明。','packages/client/connection/src/browser-auth.ts')
add('packages/api/gateway/src/index.ts',793,875,'prepareInvocation','公开descriptor、exact/codec参数、非owner资源权限先于lookup解析，随后绑定receiver Context与signal再调用。',gt,'C B2; D B1')
add('packages/api/gateway/src/index.ts',491,543,'dispatchRpc / openWireStream','HTTP unary解Remote payload中的args；stream走独立carrier，错误归Remote结构，不与SDK错误码混用。',gt,'D B1; C B2')
add('packages/api/gateway/src/index.ts',1630,1703,'assertExactArguments / validateArguments / decode','按已公开参数校缺失/额外字段并用codec验证；SRC反射与生成Schema证据分开，业务仍有自身校验。',gt,'C B2')
add('packages/api/gateway/src/stream-protocol.ts',1,30,'Remote mux vocabulary','应用流WebSocket为/api/remote.mux，$events/$events/result为内部端点；不是所有RPC都走WS。',gt)
add('packages/api/gateway/src/client/index.ts',1,48,'Client Remote projection','注册公开Typert贡献形成remote.namespace服务与方法，不是把任意Host Service方法暴露给浏览器。',gt)
add('packages/api/remotes/src/index.ts',1,54,'API Remotes','Host选定Cordis事件源交Gateway转发；运行时事件名不自动成为网络通知。','packages/api/remotes/src/index.ts')
add('packages/api/remote-access/src/index.ts',175,236,'RemoteAccessService.decide','owner或自身access快照有明确特例；非owner需每个资源有授权绑定，策略异常deny；拒绝码remote-access/denied。','packages/api/session-controller/tests/remote-access.host.spec.ts','C B2')
add('packages/api/session-controller/src/index.ts',135,253,'SessionController init','Host会话API组合agent/commands/history/state/web，注册资源解析，实时通知与cold查询分开。',sc,'D B1; D B5')
add('packages/api/session-controller/src/agent.ts',1,None,'ApiSessionAgentController','Session创建/恢复及精确live对象归属；子级Session不能借普通路由越过Subagent拥有者。','packages/api/session-controller/tests/agent.host.spec.ts','D B1')
add('packages/api/session-controller/src/commands.ts',99,142,'SessionCommandController.create','cwd/workspaceId互斥，解析工作区与可复用空Session后创建；失败有业务错误，不伪装接纳。','packages/api/session-controller/tests/commands-create-fork.host.spec.ts','D B1; C B2')
add('packages/api/session-controller/src/index.ts',459,519,'SessionController.prompt / cancel','Web prompt使用requestId/sessionId/mode/content，返回accepted；cancel为控制回执，不等停稳。','packages/api/session-controller/tests/control-queue.host.spec.ts','D B1; D B3')
add('packages/api/session-controller/src/web/controller.ts',1,None,'WebController.follow','先绑定listener/队列再读snapshot，cursor切未覆盖增量；可选assistantStream baseline；activate默认false、仅显式请求可promote。',sc,'D B1')
add('packages/api/session-controller/src/history/controller.ts',1,None,'HistoryController','历史点读通过SessionQuery/观察lease，读历史不必激活Agent，更不重跑工具。','packages/api/session-controller/tests/history-controller.host.spec.ts','D B5')
add('packages/api/session-controller/src/assistant-stream.ts',24,None,'SessionAssistantStreamAccumulator','过程内revision/attempt/index形成可重连baseline，换Agent生命周期可从1重启；不持久化逐chunk。','packages/api/session-controller/tests/assistant-stream.host.spec.ts')
add('packages/api/session-controller/src/client/transport.ts',172,224,'SessionEventStream.follow','要求opening assistant baseline，后续revision必须连续；缺口抛carrier错误并重新baseline，不补造或静默拼接。','packages/api/session-controller/tests/transport.client.spec.ts','C B6')
add('packages/sdk/client/src/launch.ts',125,None,'resolveDshLaunch','显式dshBin或同版本发行/源码入口；选profile、patch，dshHome/cwd绝对解析；env给定整体替换。',ct,'D C1')
add('packages/sdk/client/src/client.ts',186,307,'HarnessClient.start','直接spawn拥有stdio子进程（不在Harness Context内），按行双向JSONRPC，分别管理stderr尾、订阅和问题回调。',ct,'D C1; D D8; D D9')
add('packages/sdk/client/src/api.ts',22,155,'DeepSeekHarness','高层包装route、memo initialize、惰性session和真正resume、run及terminal close；初始化失败清理证明退出后才换client。',ct,'D D1; D D7')
add('packages/sdk/client/src/api.ts',173,266,'HarnessSession.run','先订阅会话树，prompt回messageId后等agent/inbox/spliced receipt，到根Agent下一次idle；结果是区间最后助手消息，不是逐Prompt因果归属。',ct,'D C1; D C3')
add('packages/sdk/client/src/types.ts',1,None,'RunResult / SDK options','sessionId/finalResponse/events/notifications；error/timeout/启动选项独立，不把通知都当已保存完整历史。',ct,'D C1')
add('packages/sdk/client/src/client.ts',331,386,'initialize / prompt / resumeSession','低层prompt只回messageId；resume是独立协议调用，不等于session(id)惰性句柄。',ct,'D C2; D D1')
add('packages/sdk/protocol/src/transport.ts',1,None,'JsonRpcLineTransport','换行JSON帧、id关联与无id通知、双向请求；固定实现忽略语法坏行，非对象params归{}，handler异常-32603；不宣称完整严格JSONRPC验证。','packages/sdk/server/tests/server.spec.ts','D D4')
add('packages/sdk/protocol/src/types.ts',1,None,'HarnessSdkRequestMap / NotificationMap','initialize/session prompt/wait/resume/cwd/shutdown；session.event/status及subagent通知另列；没有session/cancel方法。','packages/sdk/server/tests/server.spec.ts','D C1; D D4')
add('packages/sdk/server/src/server.ts',206,251,'initialize','路由提前resolve，缺provider不暗改默认；只有deepseek-official未注册时可挂fallback；本课固定fixture，无真实API。',st,'D D7')
add('packages/sdk/server/src/server.ts',253,302,'prompt / resume','prompt接受输入后立刻回id；resume读取持久会话、不送新输入；已open、missing、writer held等拒绝、不建替代。','packages/sdk/server/tests/resume.spec.ts','D C2; D D1; D D2; D D3')
add('packages/sdk/server/src/server.ts',304,346,'wait / ownsAgent','wait根idle后检查受管后代与根状态，防止后代触发后续根Turn；SDK归属按精确实时对象链，不靠ID字符串推断。','packages/sdk/server/tests/wait.spec.ts','D C2')
add('packages/sdk/server/src/server.ts',425,464,'handleRequest','显式方法switch；无注册方法报handler异常，实际映射-32603，不混同“无handler”的-32601。',st,'D D4')
add('packages/sdk/server/src/server.ts',369,416,'shutdown','lifetime停止、等待在创、清listeners、drain后代、释放拥有的Handle/adapter，保留历史。','packages/sdk/server/tests/shutdown.spec.ts','D D5')
add('packages/sdk/server/src/index.ts',51,None,'SDK plugin apply','stdio默认接线；initialize先等可用Loader.await；shutdown响应后flush、root dispose与exit，EOF/signal属于外层CLI。','packages/sdk/server/tests/plugin-apply.spec.ts','D C1; D D5')
add('packages/sdk/client/src/client.ts',484,507,'HarnessClient.close / performClose','memo关闭，先有界shutdown，再私有进程回收和stream结算；已关闭不能重用。',ct,'D C1; D D5')
add('packages/sdk/client/src/dispose.ts',82,None,'disposeRuntimeProcess','EOF合作等待；POSIX才试catchable SIGTERM；Windows直接走force分支，必须确认exit，不保证被迫退出前已flush。',ct,'D C1; D D5')
add('packages/sdk/server/src/server.ts',95,154,'SDK approval bridge','只有SDK拥有Agent与启用approvalRequests时转发approval/request；未知/坏答/传输失败不构成允许。','packages/sdk/server/tests/approval.spec.ts','D D6 missing; D D6 allowed-once; D D6 rejected; D D6 cancelled')
add('packages/sdk/server/src/user-questions.ts',1,None,'SdkUserQuestionBridge','capabilities开启后转发原问题、绑定session与signal，取消通知并忽略晚答；答案按问题ID校验。','packages/sdk/server/tests/user-questions.spec.ts','D D8; D D9')
add('packages/sdk/client/src/client.ts',232,306,'client question dispatch','onUserQuestion带AbortSignal，callback与取消Promise.race；关闭/取消终止等待，应用仍须释放自己的资源。',ct,'D D8; D D9')
add('packages/acp/acp/README.zh.md',1,None,'ACP boundary','ACP是标准Agent Client Protocol适配，与SDK JSONRPC和Web Remote是不同协议；本课只作边界介绍。','packages/acp/acp/README.zh.md')
add('python/sdk/README.zh.md',1,None,'Python SDK boundary','Python客户端共享SDK运行时协议，未实跑Python客户端，不把TS stdio结果推广为跨语言全部兼容。','python/sdk/README.zh.md')
add('packages/boot/app-boot/src/index.ts',1203,1259,'boot','建立真实AppBoot/Loader，prepare装入本课Mock核心；空配置数组settled后才装SDK；不是发行版sdk-minimal完整应用。','packages/boot/app-boot/tests/profile.spec.ts','D C1; D D1; D D5')
(R/'evidence/source-assertions.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
u='https://github.com/deepseek-ai/deepseek-harness/blob/'+C+'/'
md='# H23 固定源码断言清单\n\n固定Commit `'+C+'`。准确范围/分支审读与行为证据分开；官方参考只定位/按相关性选读，未执行含递归删除的原套件。映射只覆盖列明子分支，不当整文件覆盖。\n\n'
for x in rows:md+=f"## {x['claim']} · {x['symbol']}\n\n{x['conclusion']}\n\n源码：[{x['file']}:{x['start']}–{x['end']}]({u}{x['file']}#L{x['start']}-L{x['end']})；官方参考：[{x['officialTest']['file']}]({u}{x['officialTest']['file']})（未执行）。本地 `{x['localTest']}`，等级 `{x['grade']}`。\n\n"
(R/'source-checklist.md').write_text(md.rstrip()+'\n',encoding='utf-8');print(len(rows),'source assertions')
