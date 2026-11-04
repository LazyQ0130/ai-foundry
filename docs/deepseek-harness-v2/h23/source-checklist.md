# H23 固定源码断言清单

固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。准确范围/分支审读与行为证据分开；官方参考只定位/按相关性选读，未执行含递归删除的原套件。映射只覆盖列明子分支，不当整文件覆盖。

## S01 · parseDshArgs

启动器只解析自身Profile/Patch/dump，首个未知token后交给应用；别名dsh name；help/version/非法参数在子进程退出，不是TUI。

源码：[apps/cli/src/args.ts:18–216](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/args.ts#L18-L216)；官方参考：[apps/cli/tests/args.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/tests/args.spec.ts)（未执行）。本地 `C A1; C A2`，等级 `C`。

## S02 · runCli

profile、plugin、dump-config、dump-schema四分支；应用启动错误才走诊断/exit1，正常dump不启动模型。

源码：[apps/cli/src/bin.ts:1–78](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/bin.ts#L1-L78)；官方参考：[apps/cli/src/bin.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/bin.ts)（未执行）。本地 `C A4`，等级 `C`。

## S03 · homePatchPath

Home patch为每次按DSH_HOME解析，不能读取真实用户Home来测试；启动器实参与应用内cmdlineArgs分开。

源码：[apps/cli/src/profile-boot.ts:73–88](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L73-L88)；官方参考：[packages/boot/app-boot/tests/profile.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/profile.spec.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S04 · prepareProfile

具名Profile、可选userLayer、初始化模板及CLI覆盖读取；不能把sdk-minimal概括为base+SDK。

源码：[apps/cli/src/profile-boot.ts:194–238](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L194-L238)；官方参考：[packages/boot/app-boot/tests/profile.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/profile.spec.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S05 · runProfile

按bundle/profile/home/extra等有效patch层启动Loader；应用参数作为不可变cmdlineArgs给内层；AppReady有独立确认点。

源码：[apps/cli/src/profile-boot.ts:271–353](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L271-L353)；官方参考：[packages/boot/app-boot/tests/profile.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/profile.spec.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S06 · resolveProfileDir / initProfile

校非法Profile名，初始化指定目录；实验只新建明确fixture home。

源码：[packages/boot/app-boot/src/profile.ts:165–227](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L165-L227)；官方参考：[packages/boot/app-boot/tests/profile.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/profile.spec.ts)（未执行）。本地 `C A3`，等级 `C`。

## S07 · loadProfileDirectory / composeEntries

包Bundle层按序、Profile用户层单独，配置dump与boot共用applyEntryPatches；config整体替换，不是深合并。

源码：[packages/boot/app-boot/src/profile.ts:678–762](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L678-L762)；官方参考：[packages/boot/app-boot/tests/profile.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/profile.spec.ts)（未执行）。本地 `C A3; C A4`，等级 `C`。

## S08 · sdk-minimal manifest

最小SDK是显式完整组合，不自动叠base；实验控制组合不能冒称这个发行Profile全量通过。

源码：[packages/bundle/sdk-minimal/package.json:1–80](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/sdk-minimal/package.json#L1-L80)；官方参考：[packages/bundle/sdk-minimal/package.json](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/sdk-minimal/package.json)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S09 · AppWebEntry

BootPage先出现，创建module系统、prefetch立即层、bootClient与mountClient；失败有page.fail或调用方onFailure。

源码：[packages/client/web/src/boot.ts:23–124](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/web/src/boot.ts#L23-L124)；官方参考：[packages/client/web/src/boot.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/web/src/boot.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S10 · Client modules

客户端模块图/同步factory解析和Cordis运行服务注入分层；并非import名字存在即可运行。

源码：[packages/client/modules/src/index.ts:1–1274](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/modules/src/index.ts#L1-L1274)；官方参考：[packages/client/AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/AGENTS.md)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S11 · mountClient

UI renderer只承担挂载展示，Host业务与权限并不转移到React。

源码：[packages/client/web/src/mount.ts:1–24](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/web/src/mount.ts#L1-L24)；官方参考：[packages/client/web/src/mount.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/web/src/mount.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S12 · ConnectionHandle

generation与state观察、RPC、socket、reconnect与唯一generation source各有职责。

源码：[packages/client/connection/src/client/index.ts:149–206](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/index.ts#L149-L206)；官方参考：[packages/client/connection/src/client/connection.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/connection.ts)（未执行）。本地 `C B4`，等级 `C`。

## S13 · installConnection

可显式注入rpc/fetch等载体；ready形成代际、丢线撤代际；测试控制载体不等于浏览器WS。

源码：[packages/client/connection/src/client/index.ts:228–342](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/index.ts#L228-L342)；官方参考：[packages/client/connection/src/client/connection.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/connection.ts)（未执行）。本地 `C B4; D B1`，等级 `C`。

## S14 · ConnectionController

旧source在abort后须清理结算才开新代；ready过期不覆盖，retry/offline/sink异常分支独立。

源码：[packages/client/connection/src/client/connection.ts:1–323](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/connection.ts#L1-L323)；官方参考：[packages/client/connection/src/client/connection.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/connection.ts)（未执行）。本地 `C B4`，等级 `C`。

## S15 · createWebConnectionRpc

应用RPC envelope含type/rpcId/method/payload，经HTTP POST；核response关联id，不是SDK JSON-RPC。

源码：[packages/client/connection/src/client/rpc.ts:35–87](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/rpc.ts#L35-L87)；官方参考：[packages/client/connection/src/client/rpc.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/client/rpc.ts)（未执行）。本地 `D B1; C B2`，等级 `D`。

## S16 · Host Connection apply

HTTP路径先Host/Origin与BrowserAuth准入，再carrier-neutral注册处理；知道地址/隐藏按钮不是授权。

源码：[packages/client/connection/src/index.ts:137–169](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/index.ts#L137-L169)；官方参考：[packages/client/connection/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/index.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S17 · BrowserAuth

启动token交换持久浏览器cookie及API认证是Host载体边界；owner Peer前提不能由UI自行声明。

源码：[packages/client/connection/src/browser-auth.ts:1–394](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/browser-auth.ts#L1-L394)；官方参考：[packages/client/connection/src/browser-auth.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/connection/src/browser-auth.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S18 · prepareInvocation

公开descriptor、exact/codec参数、非owner资源权限先于lookup解析，随后绑定receiver Context与signal再调用。

源码：[packages/api/gateway/src/index.ts:793–875](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/src/index.ts#L793-L875)；官方参考：[packages/api/gateway/tests/gateway.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/tests/gateway.host.spec.ts)（未执行）。本地 `C B2; D B1`，等级 `C`。

## S19 · dispatchRpc / openWireStream

HTTP unary解Remote payload中的args；stream走独立carrier，错误归Remote结构，不与SDK错误码混用。

源码：[packages/api/gateway/src/index.ts:491–543](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/src/index.ts#L491-L543)；官方参考：[packages/api/gateway/tests/gateway.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/tests/gateway.host.spec.ts)（未执行）。本地 `D B1; C B2`，等级 `D`。

## S20 · assertExactArguments / validateArguments / decode

按已公开参数校缺失/额外字段并用codec验证；SRC反射与生成Schema证据分开，业务仍有自身校验。

源码：[packages/api/gateway/src/index.ts:1630–1703](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/src/index.ts#L1630-L1703)；官方参考：[packages/api/gateway/tests/gateway.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/tests/gateway.host.spec.ts)（未执行）。本地 `C B2`，等级 `C`。

## S21 · Remote mux vocabulary

应用流WebSocket为/api/remote.mux，$events/$events/result为内部端点；不是所有RPC都走WS。

源码：[packages/api/gateway/src/stream-protocol.ts:1–30](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/src/stream-protocol.ts#L1-L30)；官方参考：[packages/api/gateway/tests/gateway.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/tests/gateway.host.spec.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S22 · Client Remote projection

注册公开Typert贡献形成remote.namespace服务与方法，不是把任意Host Service方法暴露给浏览器。

源码：[packages/api/gateway/src/client/index.ts:1–48](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/src/client/index.ts#L1-L48)；官方参考：[packages/api/gateway/tests/gateway.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/gateway/tests/gateway.host.spec.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S23 · API Remotes

Host选定Cordis事件源交Gateway转发；运行时事件名不自动成为网络通知。

源码：[packages/api/remotes/src/index.ts:1–54](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/remotes/src/index.ts#L1-L54)；官方参考：[packages/api/remotes/src/index.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/remotes/src/index.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S24 · RemoteAccessService.decide

owner或自身access快照有明确特例；非owner需每个资源有授权绑定，策略异常deny；拒绝码remote-access/denied。

源码：[packages/api/remote-access/src/index.ts:175–236](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/remote-access/src/index.ts#L175-L236)；官方参考：[packages/api/session-controller/tests/remote-access.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/remote-access.host.spec.ts)（未执行）。本地 `C B2`，等级 `C`。

## S25 · SessionController init

Host会话API组合agent/commands/history/state/web，注册资源解析，实时通知与cold查询分开。

源码：[packages/api/session-controller/src/index.ts:135–253](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/index.ts#L135-L253)；官方参考：[packages/api/session-controller/tests/transport.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/transport.host.spec.ts)（未执行）。本地 `D B1; D B5`，等级 `D`。

## S26 · ApiSessionAgentController

Session创建/恢复及精确live对象归属；子级Session不能借普通路由越过Subagent拥有者。

源码：[packages/api/session-controller/src/agent.ts:1–485](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/agent.ts#L1-L485)；官方参考：[packages/api/session-controller/tests/agent.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/agent.host.spec.ts)（未执行）。本地 `D B1`，等级 `D`。

## S27 · SessionCommandController.create

cwd/workspaceId互斥，解析工作区与可复用空Session后创建；失败有业务错误，不伪装接纳。

源码：[packages/api/session-controller/src/commands.ts:99–142](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/commands.ts#L99-L142)；官方参考：[packages/api/session-controller/tests/commands-create-fork.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/commands-create-fork.host.spec.ts)（未执行）。本地 `D B1; C B2`，等级 `D`。

## S28 · SessionController.prompt / cancel

Web prompt使用requestId/sessionId/mode/content，返回accepted；cancel为控制回执，不等停稳。

源码：[packages/api/session-controller/src/index.ts:459–519](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/index.ts#L459-L519)；官方参考：[packages/api/session-controller/tests/control-queue.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/control-queue.host.spec.ts)（未执行）。本地 `D B1; D B3`，等级 `D`。

## S29 · WebController.follow

先绑定listener/队列再读snapshot，cursor切未覆盖增量；可选assistantStream baseline；activate默认false、仅显式请求可promote。

源码：[packages/api/session-controller/src/web/controller.ts:1–78](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/web/controller.ts#L1-L78)；官方参考：[packages/api/session-controller/tests/transport.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/transport.host.spec.ts)（未执行）。本地 `D B1`，等级 `D`。

## S30 · HistoryController

历史点读通过SessionQuery/观察lease，读历史不必激活Agent，更不重跑工具。

源码：[packages/api/session-controller/src/history/controller.ts:1–256](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/history/controller.ts#L1-L256)；官方参考：[packages/api/session-controller/tests/history-controller.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/history-controller.host.spec.ts)（未执行）。本地 `D B5`，等级 `D`。

## S31 · SessionAssistantStreamAccumulator

过程内revision/attempt/index形成可重连baseline，换Agent生命周期可从1重启；不持久化逐chunk。

源码：[packages/api/session-controller/src/assistant-stream.ts:24–102](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/assistant-stream.ts#L24-L102)；官方参考：[packages/api/session-controller/tests/assistant-stream.host.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/assistant-stream.host.spec.ts)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S32 · SessionEventStream.follow

要求opening assistant baseline，后续revision必须连续；缺口抛carrier错误并重新baseline，不补造或静默拼接。

源码：[packages/api/session-controller/src/client/transport.ts:172–224](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/client/transport.ts#L172-L224)；官方参考：[packages/api/session-controller/tests/transport.client.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/tests/transport.client.spec.ts)（未执行）。本地 `C B6`，等级 `C`。

## S33 · resolveDshLaunch

显式dshBin或同版本发行/源码入口；选profile、patch，dshHome/cwd绝对解析；env给定整体替换。

源码：[packages/sdk/client/src/launch.ts:125–157](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/launch.ts#L125-L157)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C1`，等级 `D`。

## S34 · HarnessClient.start

直接spawn拥有stdio子进程（不在Harness Context内），按行双向JSONRPC，分别管理stderr尾、订阅和问题回调。

源码：[packages/sdk/client/src/client.ts:186–307](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/client.ts#L186-L307)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C1; D D8; D D9`，等级 `D`。

## S35 · DeepSeekHarness

高层包装route、memo initialize、惰性session和真正resume、run及terminal close；初始化失败清理证明退出后才换client。

源码：[packages/sdk/client/src/api.ts:22–155](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/api.ts#L22-L155)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D D1; D D7`，等级 `D`。

## S36 · HarnessSession.run

先订阅会话树，prompt回messageId后等agent/inbox/spliced receipt，到根Agent下一次idle；结果是区间最后助手消息，不是逐Prompt因果归属。

源码：[packages/sdk/client/src/api.ts:173–266](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/api.ts#L173-L266)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C1; D C3`，等级 `D`。

## S37 · RunResult / SDK options

sessionId/finalResponse/events/notifications；error/timeout/启动选项独立，不把通知都当已保存完整历史。

源码：[packages/sdk/client/src/types.ts:1–88](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/types.ts#L1-L88)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C1`，等级 `D`。

## S38 · initialize / prompt / resumeSession

低层prompt只回messageId；resume是独立协议调用，不等于session(id)惰性句柄。

源码：[packages/sdk/client/src/client.ts:331–386](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/client.ts#L331-L386)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C2; D D1`，等级 `D`。

## S39 · JsonRpcLineTransport

换行JSON帧、id关联与无id通知、双向请求；固定实现忽略语法坏行，非对象params归{}，handler异常-32603；不宣称完整严格JSONRPC验证。

源码：[packages/sdk/protocol/src/transport.ts:1–286](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/protocol/src/transport.ts#L1-L286)；官方参考：[packages/sdk/server/tests/server.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/server.spec.ts)（未执行）。本地 `D D4`，等级 `D`。

## S40 · HarnessSdkRequestMap / NotificationMap

initialize/session prompt/wait/resume/cwd/shutdown；session.event/status及subagent通知另列；没有session/cancel方法。

源码：[packages/sdk/protocol/src/types.ts:1–208](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/protocol/src/types.ts#L1-L208)；官方参考：[packages/sdk/server/tests/server.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/server.spec.ts)（未执行）。本地 `D C1; D D4`，等级 `D`。

## S41 · initialize

路由提前resolve，缺provider不暗改默认；只有deepseek-official未注册时可挂fallback；本课固定fixture，无真实API。

源码：[packages/sdk/server/src/server.ts:206–251](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/server.ts#L206-L251)；官方参考：[packages/sdk/server/tests/server.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/server.spec.ts)（未执行）。本地 `D D7`，等级 `D`。

## S42 · prompt / resume

prompt接受输入后立刻回id；resume读取持久会话、不送新输入；已open、missing、writer held等拒绝、不建替代。

源码：[packages/sdk/server/src/server.ts:253–302](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/server.ts#L253-L302)；官方参考：[packages/sdk/server/tests/resume.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/resume.spec.ts)（未执行）。本地 `D C2; D D1; D D2; D D3`，等级 `D`。

## S43 · wait / ownsAgent

wait根idle后检查受管后代与根状态，防止后代触发后续根Turn；SDK归属按精确实时对象链，不靠ID字符串推断。

源码：[packages/sdk/server/src/server.ts:304–346](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/server.ts#L304-L346)；官方参考：[packages/sdk/server/tests/wait.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/wait.spec.ts)（未执行）。本地 `D C2`，等级 `D`。

## S44 · handleRequest

显式方法switch；无注册方法报handler异常，实际映射-32603，不混同“无handler”的-32601。

源码：[packages/sdk/server/src/server.ts:425–464](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/server.ts#L425-L464)；官方参考：[packages/sdk/server/tests/server.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/server.spec.ts)（未执行）。本地 `D D4`，等级 `D`。

## S45 · shutdown

lifetime停止、等待在创、清listeners、drain后代、释放拥有的Handle/adapter，保留历史。

源码：[packages/sdk/server/src/server.ts:369–416](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/server.ts#L369-L416)；官方参考：[packages/sdk/server/tests/shutdown.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/shutdown.spec.ts)（未执行）。本地 `D D5`，等级 `D`。

## S46 · SDK plugin apply

stdio默认接线；initialize先等可用Loader.await；shutdown响应后flush、root dispose与exit，EOF/signal属于外层CLI。

源码：[packages/sdk/server/src/index.ts:51–104](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/index.ts#L51-L104)；官方参考：[packages/sdk/server/tests/plugin-apply.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/plugin-apply.spec.ts)（未执行）。本地 `D C1; D D5`，等级 `D`。

## S47 · HarnessClient.close / performClose

memo关闭，先有界shutdown，再私有进程回收和stream结算；已关闭不能重用。

源码：[packages/sdk/client/src/client.ts:484–507](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/client.ts#L484-L507)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C1; D D5`，等级 `D`。

## S48 · disposeRuntimeProcess

EOF合作等待；POSIX才试catchable SIGTERM；Windows直接走force分支，必须确认exit，不保证被迫退出前已flush。

源码：[packages/sdk/client/src/dispose.ts:82–99](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/dispose.ts#L82-L99)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D C1; D D5`，等级 `D`。

## S49 · SDK approval bridge

只有SDK拥有Agent与启用approvalRequests时转发approval/request；未知/坏答/传输失败不构成允许。

源码：[packages/sdk/server/src/server.ts:95–154](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/server.ts#L95-L154)；官方参考：[packages/sdk/server/tests/approval.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/approval.spec.ts)（未执行）。本地 `D D6 missing; D D6 allowed-once; D D6 rejected; D D6 cancelled`，等级 `D`。

## S50 · SdkUserQuestionBridge

capabilities开启后转发原问题、绑定session与signal，取消通知并忽略晚答；答案按问题ID校验。

源码：[packages/sdk/server/src/user-questions.ts:1–74](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/user-questions.ts#L1-L74)；官方参考：[packages/sdk/server/tests/user-questions.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/tests/user-questions.spec.ts)（未执行）。本地 `D D8; D D9`，等级 `D`。

## S51 · client question dispatch

onUserQuestion带AbortSignal，callback与取消Promise.race；关闭/取消终止等待，应用仍须释放自己的资源。

源码：[packages/sdk/client/src/client.ts:232–306](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/src/client.ts#L232-L306)；官方参考：[packages/sdk/client/tests/cot-translation-projection.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/client/tests/cot-translation-projection.spec.ts)（未执行）。本地 `D D8; D D9`，等级 `D`。

## S52 · ACP boundary

ACP是标准Agent Client Protocol适配，与SDK JSONRPC和Web Remote是不同协议；本课只作边界介绍。

源码：[packages/acp/acp/README.zh.md:1–187](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/acp/acp/README.zh.md#L1-L187)；官方参考：[packages/acp/acp/README.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/acp/acp/README.zh.md)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S53 · Python SDK boundary

Python客户端共享SDK运行时协议，未实跑Python客户端，不把TS stdio结果推广为跨语言全部兼容。

源码：[python/sdk/README.zh.md:1–127](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/python/sdk/README.zh.md#L1-L127)；官方参考：[python/sdk/README.zh.md](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/python/sdk/README.zh.md)（未执行）。本地 `STATIC_REVIEW`，等级 `STATIC`。

## S54 · boot

建立真实AppBoot/Loader，prepare装入本课Mock核心；空配置数组settled后才装SDK；不是发行版sdk-minimal完整应用。

源码：[packages/boot/app-boot/src/index.ts:1203–1259](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L1203-L1259)；官方参考：[packages/boot/app-boot/tests/profile.spec.ts](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/profile.spec.ts)（未执行）。本地 `D C1; D D1; D D5`，等级 `D`。
