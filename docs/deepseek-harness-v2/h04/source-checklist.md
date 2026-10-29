# H04 源码核对与行为边界

2026-10-29。基线 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，版本 `0.2.2-alpha.2`。所有正文引用有固定行锚与 Git blob 校验，见 [source-check.json](evidence/source-check.json)。本轮只研究源码，不启动官方应用、不访问真实模型与私人配置。

## 证据不是一张关键字匹配表

核对分四层：固定 Git tree 比较真实文件字节；阅读实现的条件、分支与错误处理；选读相关官方测试的 setup/action/assertions；对安全的参数和辅助函数执行实际探针。语义锚只防引用漂移，不能独自证明启动或优先级成立。

[control-flow.json](evidence/control-flow.json)记录五项实际 TypeScript AST 结构检查：

| 编号 | 真实结构 | 人工确认的语义 |
| --- | --- | --- |
| O1 | parseDshArgs 先执行，loadLayeredEnv 位于 runProfile 的参数表达式内部 | 源码行号里外层调用在前，实参求值却先发生；不能仅按词法行号排时序。dump 在另一 switch 分支 |
| O2 | runProfile await installProxy，再 composeProfile，再 boot | 环境已由调用方提供；代理安装并非某个配置插件挂载后才做；错误进入独立清理路径 |
| O3 | boot 中 await prepare，再 mountRootInclude | 已创建 Context/Loader，回调提供宿主事实；配置树条目尚未挂载，不能误说 Loader 也未创建 |
| O4 | 两次 readEnvLayer 位于 process.env 物化赋值之前 | 两文件先验证；home==cwd 避免重复读取；来源快照保留原继承层，不把已经物化的文件值冒充继承值 |
| O5 | readProfilePatches 的数组有 bundle/profile/home/overlays 四段 | 后面可追加遥测硬关闭补丁；一般层序图不是所有环境与凭据的万能优先级 |

## 已执行的真实源码探针

10 项见 [actual-probes.json](evidence/actual-probes.json)：真实 CLI 早/晚参数边界；Profile 名称；配置整体替换；不可变应用参数；隔离环境的普通分层、快照稳定、先验证后应用、Home 代理允许、项目代理拒绝、禁止 dotenv 重定位 Home；另有隔离子进程验证 dump+应用参数以 1 退出。环境相关检查按五个子进程场景计数，CLI 对照按一项计数，总计 10。

探针使用原始 TS 源码和上游锁定的外部依赖，作者模块钩子只把指定外部包重定向到仓库外隔离安装，不改上游文件或 AI Foundry 依赖。Commander 15.0.0 及依赖锁条目的版本/完整性见 [probe-dependencies.json](evidence/probe-dependencies.json)，全部 integrity 可追到同一 pnpm-lock；含其他平台 optional 锁条目，**不代表这些平台二进制都已安装或运行**。安装禁用 lifecycle scripts；没有执行运行时 native bootstrap。

临时测试 Home/项目目录保留在系统临时目录，子进程只接收 OS 启动路径、指定的临时 DSH_HOME 与课程非秘密值；不继承真实 Key、个人 Home 配置或代理设置。没有调用 `boot()`、`runProfile()`、重置 Profile、插件安装、真实网络或工具。

这些是辅助函数探针，不是构建后的 CLI/完整 Profile/e2e。官方测试主要静态选读；不因实际 helper 通过就宣称真实端口、ACP/SDK 握手、原生 HMR、包安装或安全隔离已验证。

## 版本内发现的文档精度差异

1. `apps/cli/reference/README.zh.md:139` 写继承环境在受管凭据之前；`credentials-local/src/index.ts:624–631` 实际先读受管文档，`tests/local.spec.ts:79–87` 明确验证已存值优先。H04 以实现与测试为准，并在可选解释里公开这个差异。不把该优先级套到禁用凭据提供方的 Headless/minimal。
2. 多处 README 笼统说插件/组合加载失败即退出；`loadProfileDirectory():678–712` 会跳过某些无法读取、不适配平台或版本的 Bundle，保留清单并报告。`auditStartupEntries` 再区分 required 的致命失败与 optional 的警告。正文保留两层，避免承诺“一项缺失就总能整树停掉”。
3. config dump 是组合值预览，保留表达式，不运行应用 flag 提供方；同时正常运行的 `readProfilePatches` 另有遥测硬关闭补丁。dump 与实际绑定值/所有部署开关不能被画成等号。dump 的 prepareProfile 仍可能写文件，不标成绝对只读。
4. base 的配置 HMR 与默认 `root: []` 模块监视是两件事；应用 README 的“禁用模块 HMR”不能被扩写为 Web 不支持配置重组。Headless/SDK/ACP 的 patch 真正停用 hmr，minimal 则未挂载它。

## 精选阅读与停止位置

正文五核心文件顺序：`args.ts` 的 invocation 与参数边界 → `bin.ts` 的分派 → `profile-boot.ts` 的 prepare/compose/run → `app-boot/profile.ts` 的发现与解析 → `app-boot/index.ts` 的环境与 boot。Bundle/协议传输、cmdline、Home、HMR、凭据作为定点辅助文件，不要求学生通读。

到“哪些服务准备好、怎样进入应用模式”为止。H05 容器、H06 分发、H07 卸载、H08 Patch/Bundle 深层组合与 HMR 算法均未在本课展开。

## 关键事实索引

每条含固定 Commit、路径、范围、教学结论与测试/执行状态；原始片段在 JSON。没有相关测试运行的项目不填 PASS。

| ID | 教学结论 | 固定源码位置 | 测试定位/状态 |
| --- | --- | --- | --- |
| S01 | dsh 分派到具名 profile/其他模式，不是五个独立 bin | [apps/cli/src/bin.ts:26–69](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/bin.ts#L26-L69) | args.spec.ts:24–57（选读） |
| S02 | 模板四种 base-backed；minimal 独立 | [packages/util/official-bundles/src/bundles.ts:10–25](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/util/official-bundles/src/bundles.ts#L10-L25) | sdk-minimal.spec.ts:1–65（选读） |
| S03 | 正常环境加载嵌在 runProfile 参数；dump 另分支 | [apps/cli/src/bin.ts:31–69](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/bin.ts#L31-L69) | 实现/契约核对；未虚报官方执行 |
| S04 | 启动器第一未知 token 后全部交应用 | [apps/cli/src/args.ts:146–185](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/args.ts#L146-L185) | args.spec.ts:35–57（选读） |
| S05 | dump 互斥、拒绝应用参数；默认 dump 拒绝 patch | [apps/cli/src/args.ts:111–135](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/args.ts#L111-L135) | args.spec.ts:158–178（选读） |
| S06 | desktop 为 Electron 保留，普通名字不在解析阶段查目录 | [apps/cli/src/args.ts:78–87](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/args.ts#L78-L87) | args.spec.ts:217–249（选读） |
| S07 | 应用共享不可变参数快照 | [packages/boot/cmdline/src/index.ts:84–89](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/cmdline/src/index.ts#L84-L89) | cmdline.spec.ts:223–230（选读） |
| S08 | Home 不等于工作区；显式 helper 参数/进程DSH_HOME/默认 | [packages/util/home-paths/src/index.ts:125–136](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/util/home-paths/src/index.ts#L125-L136) | 实现/契约核对；未虚报官方执行 |
| S09 | Profile 名不能变成路径穿越 | [packages/boot/app-boot/src/profile.ts:165–172](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L165-L172) | profile.spec.ts:192–198（选读） |
| S10 | 只有随附模板自动初始化，未知自定义配置报错 | [packages/boot/app-boot/src/profile.ts:728–744](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L728-L744) | profile.spec.ts:357–366（选读） |
| S11 | 组合包从安装锚点优先解析，再看 profile | [packages/boot/app-boot/src/profile.ts:639–661](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L639-L661) | profile.spec.ts:257–267（选读） |
| S12 | 不可读/平台/版本问题可跳过 bundle并报告；非全局一律致命 | [packages/boot/app-boot/src/profile.ts:678–712](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L678-L712) | profile.spec.ts:79–111（选读） |
| S13 | Profile空根每次重写；用户应改patch | [apps/cli/src/profile-boot.ts:179–199](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L179-L199) | 实现/契约核对；未虚报官方执行 |
| S14 | proxy安装先于composeProfile | [apps/cli/src/profile-boot.ts:271–295](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L271-L295) | 实现/契约核对；未虚报官方执行 |
| S15 | 主机准备中提供上下文/环境/参数，之后才挂配置条目 | [apps/cli/src/profile-boot.ts:313–345](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L313-L345) | app-boot.spec.ts:1003–1019（选读） |
| S16 | boot先准备宿主再挂根树，等待与激活审查 | [packages/boot/app-boot/src/index.ts:1203–1244](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L1203-L1244) | app-boot.spec.ts:1003–1019（选读） |
| S17 | required失败致命，optional失败可警告 | [packages/boot/app-boot/src/index.ts:1156–1200](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L1156-L1200) | app-boot.spec.ts:1091–1212（选读） |
| S18 | 启动环境process>project-env>user-env；Home先解析 | [packages/boot/app-boot/src/index.ts:236–256](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L236-L256) | app-boot.spec.ts:107–137（选读） |
| S19 | 两文件先检查、后物化；禁止名即使被遮住仍拒绝 | [packages/boot/app-boot/src/index.ts:191–256](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L191-L256) | app-boot.spec.ts:139–159（选读） |
| S20 | Home文件可代理例外，project仍拒绝，CA/TLS不例外 | [packages/boot/app-boot/src/index.ts:133–178](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L133-L178) | app-boot.spec.ts:167–223（选读） |
| S21 | 启动快照保留来源，后续 chdir 不重读 | [packages/util/launch-environment/src/index.ts:31–103](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/util/launch-environment/src/index.ts#L31-L103) | 实现/契约核对；未虚报官方执行 |
| S22 | Bundle/Profile/Home/CLI层顺序，加专门遥测关闭处理 | [packages/boot/app-boot/src/profile-context.ts:74–84](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile-context.ts#L74-L84) | profile.spec.ts:201–226（选读） |
| S23 | dump默认省略全部用户层；完整dump含home与argv | [apps/cli/src/dump-config.ts:51–74](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/dump-config.ts#L51-L74) | config-dump.spec.ts:48–101（选读） |
| S24 | dump可准备Profile，不挂应用且表达式不求值 | [apps/cli/src/dump-config.ts:32–42](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/dump-config.ts#L32-L42) | config-dump.spec.ts:70–100（选读） |
| S25 | 受管凭据优先于继承，再dotenv，独立于普通环境 | [packages/credentials/credentials-local/src/index.ts:624–631](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/credentials/credentials-local/src/index.ts#L624-L631) | local.spec.ts:79–87（选读） |
| S26 | headless关闭交互凭据和HMR | [packages/bundle/headless/cordis.patch.yml:35–46](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/headless/cordis.patch.yml#L35-L46) | 实现/契约核对；未虚报官方执行 |
| S27 | base配置HMR启用而模块root为空；Web未停用此项 | [packages/bundle/base/cordis.patch.yml:27–32](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/cordis.patch.yml#L27-L32) | 实现/契约核对；未虚报官方执行 |
| S28 | HMR监视manifest及profile/home两个patch，不是全部输入 | [packages/boot/hmr/src/index.ts:384–407](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/src/index.ts#L384-L407) | 实现/契约核对；未虚报官方执行 |
| S29 | SDK/ACP禁用hmr，minimal树独立 | [packages/bundle/sdk-app/cordis.patch.yml:23–24](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/sdk-app/cordis.patch.yml#L23-L24) | 实现/契约核对；未虚报官方执行 |
| S30 | SDK实际JsonRpcLineTransport接stdin/stdout | [packages/sdk/server/src/index.ts:45–64](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sdk/server/src/index.ts#L45-L64) | 实现/契约核对；未虚报官方执行 |
| S31 | ACP实际ndJsonStream接stdin/stdout | [packages/acp/acp/src/index.ts:374–384](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/acp/acp/src/index.ts#L374-L384) | 实现/契约核对；未虚报官方执行 |
| S32 | minimal明示danger-full-access，并非低权限 | [packages/bundle/sdk-minimal/cordis.patch.yml:70–74](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/sdk-minimal/cordis.patch.yml#L70-L74) | sdk-minimal.spec.ts:1–65（选读） |
| S33 | SDK应用启动提供方处理EOF | [packages/bundle/sdk-app/src/index.ts:55–61](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/sdk-app/src/index.ts#L55-L61) | 实现/契约核对；未虚报官方执行 |
| S34 | ACP应用启动提供方处理EOF | [packages/bundle/acp-app/src/index.ts:41–47](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/acp-app/src/index.ts#L41-L47) | 实现/契约核对；未虚报官方执行 |
| S35 | Web端口来自应用服务表达式；替掉表达式会失去这层关系 | [packages/bundle/web-app/cordis.patch.yml:171–177](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/web-app/cordis.patch.yml#L171-L177) | cmdline.spec.ts:166–175（选读） |
| S36 | Node/pnpm工具链固定，不由最小教学实验要求替代 | [package.json:1–10](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/package.json#L1-L10) | 实现/契约核对；未虚报官方执行 |
| S37 | 自定义profile重置会替换原依赖与patch，不作为恢复建议 | [apps/cli/src/profile-boot.ts:90–107](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/profile-boot.ts#L90-L107) | 实现/契约核对；未虚报官方执行 |
| S38 | base默认不在启动时创建Agent实例 | [packages/bundle/base/cordis.patch.yml:511–516](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/cordis.patch.yml#L511-L516) | 实现/契约核对；未虚报官方执行 |
| S39 | 未审计实验性预览，Profile选择不证明安全 | [SAFETY.zh.md:5–15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15) | 实现/契约核对；未虚报官方执行 |
| S40 | base挂载平台Shell，默认策略不是只读 | [packages/bundle/base/cordis.patch.yml:244–296](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/cordis.patch.yml#L244-L296) | 实现/契约核对；未虚报官方执行 |
