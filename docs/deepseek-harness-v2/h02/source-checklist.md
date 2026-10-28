# H02 源码核对清单

固定 Commit：`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。每个引用文件以实际 Git tree blob 核对，非凭目录名称或 main 分支判断。

| 编号 | 关键断言 | 直接证据 | 状态 |
| --- | --- | --- | --- |
| S01 | 工具链、两级 workspace；pnpm 清单额外列 benchmarks 与 Python runtime | [package.json:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/package.json#L1-L18) | 静态核对 |
| S01a | pnpm 实际成员清单 | [pnpm-workspace.yaml:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/pnpm-workspace.yaml#L1-L15) | 静态核对 |
| S02 | 能力系列分组；组 README 是包映射入口 | [packages/README.zh.md:10](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/README.zh.md#L10-L31) | 静态核对 |
| S03 | 主干服务与默认循环分开；core 是分组 | [packages/core/README.zh.md:25](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/README.zh.md#L25-L36) | 静态核对 |
| S04 | 共享 LLM 服务与提供方接入分开 | [packages/llm/README.zh.md:23](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/README.zh.md#L23-L35) | 静态核对 |
| S05 | 公共基础与测试支持有专属分组 | [packages/README.zh.md:66](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/README.zh.md#L66-L82) | 静态核对 |
| S05a | vendor 保存框架与基础库的仓库固定源码 | [vendor/README.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/README.md#L1-L7) | 静态核对 |
| S06 | 命令入口按 profile 分支委托 runProfile | [apps/cli/src/bin.ts:26](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/src/bin.ts#L26-L48) | 静态核对 |
| S06a | bin 映射到发布产物 | [apps/cli/package.json:13](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/cli/package.json#L13-L20) | 静态核对 |
| S07 | headless 模板选择 base 与 headless，sdk-minimal 不使用 base | [packages/util/official-bundles/src/bundles.ts:9](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/util/official-bundles/src/bundles.ts#L9-L25) | 静态核对 |
| S07a | base 声明组合 patch | [packages/bundle/base/package.json:30](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/package.json#L30-L35) | 静态核对 |
| S07b | base 挂载工具与原生执行器，另一种执行器默认停用 | [packages/bundle/base/cordis.patch.yml:493](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/cordis.patch.yml#L493-L502) | 静态核对 |
| S08 | ToolExecutor 定义 describe / execute 契约 | [packages/core/tools/src/executor.ts:63](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/executor.ts#L63-L86) | 静态核对 |
| S09 | 原生提供方导入契约、实现并注册；execute 转交共享函数 | [packages/core/tool-executor-native/src/index.ts:2](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tool-executor-native/src/index.ts#L2-L35) | 静态核对 |
| S10 | 服务选定提供方后调用；不是在此写死导入具体执行器 | [packages/core/tools/src/index.ts:369](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L369-L377) | 静态核对 |
| S11 | 组合测试挂载实际服务与原生执行器，模型为 Mock | [packages/core/agent-loop/tests/tool-executors.spec.ts:66](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/tool-executors.spec.ts#L66-L83) | 静态核对 |
| S11a | 跨包测试核工具呈现与作用域选择 | [packages/core/agent-loop/tests/tool-executors.spec.ts:103](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/tool-executors.spec.ts#L103-L128) | 静态核对 |
| S12 | 构建项目引用 tools；不能当运行调用 | [packages/core/tool-executor-native/tsconfig.json:10](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tool-executor-native/tsconfig.json#L10-L22) | 静态核对 |
| S13 | 包身份、运行入口和类型入口与源码不同 | [packages/core/tool-executor-native/package.json:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tool-executor-native/package.json#L1-L24) | 静态核对 |
| S13a | paths 为仓库源码解析；引用保持编译边界 | [tsconfig.base.json:27](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/tsconfig.base.json#L27-L30) | 静态核对 |
| S14 | Host 与浏览器 Client 各有职责 | [packages/host/README.zh.md:10](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/host/README.zh.md#L10-L30) | 静态核对 |
| S14a | Client 中有浏览器连接与 UI 基础 | [packages/client/README.zh.md:10](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/README.zh.md#L10-L31) | 静态核对 |
| S15 | solution 引用两套 aggregate，自身无文件 | [tsconfig.json:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/tsconfig.json#L1-L15) | 静态核对 |
| S15a | Context 声明合并冲突使 Host/Client 类型检查分开，存在共享/拆分例外 | [docs/development.zh.md:63](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/development.zh.md#L63-L81) | 静态核对 |
| S16 | 官方 module-graph 只包含 peer 依赖 | [docs/module-graph.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/module-graph.zh.md#L1-L8) | 静态核对 |
| S17 | 浏览器入口委托 AppWebEntry | [apps/web/src/main.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/web/src/main.ts#L1-L20) | 静态核对 |
| S17a | 网页从 main.ts 模块脚本进入 | [apps/web/index.html:14](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/web/index.html#L14-L18) | 静态核对 |
| S18 | Desktop Host 调用共享 runner | [apps/desktop-host/src/index.ts:22](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/desktop-host/src/index.ts#L22-L36) | 静态核对 |
| S19 | apps 中的索引生成器不是 Cordis 应用 | [apps/plugin-market-generator/README.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/apps/plugin-market-generator/README.zh.md#L1-L5) | 静态核对 |
| S20 | 未审计预览，不能推导生产安全 | [SAFETY.zh.md:5](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15) | 静态核对 |
| S21 | 研发辅助：路径门禁测试区分历史引用与当前正文；只静态阅读 | [scripts/verify-package-paths.spec.ts:28](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/scripts/verify-package-paths.spec.ts#L28-L39) | 静态核对 |

## 阅读路线与层级

核心精读五个文件：根 package.json → pnpm-workspace.yaml → apps/cli/src/bin.ts → core/tools/src/executor.ts → core/tool-executor-native/src/index.ts。先确认成员，再认入口，先契约后提供方。每一站只读正文标注的片段；配置、服务分派、类型边界和测试作定点辅助阅读，不要求读完整文件。

辅助证据包括 base 配置、工具服务 execute、source paths、包 exports、Host/Client solution、开发文档及组合测试。固定路线不是函数调用栈。三种图分开：import/type 关系、Project Reference、对象注册/调用。module-graph 官方只画 peer，不得冒称完整源码或运行图。

## 事实、简化与分析

官方事实以本表与正文链接为准。四行 TypeScript 收据例子、练习分类器与分层图属于教学材料；分类器引用的六个短证据行已逐行核对，但没有运行 Harness。Monorepo 协同修改的收益与维护成本标为我们的分析，未臆测作者全部历史动机。

包名、路径、实现、接口、consumer 与测试名称由实际文件复核。测试核对的是选定 Mock 组合场景与工具可见性，不能推出生产安全或所有调度性质。原生执行器无法强制杀死同进程不合作工具等细节留后续，不在本节扩展承诺。

官方测试只静态阅读，不运行含递归清理的脚本；构建、真实 API、原生执行环境和端到端功能均未运行。H02 八项练习测试与 Renderer 检查是作者自己的验证范围。

完整路径、范围、SHA-256、Git blob 与受核片段见 [source-check.json](evidence/source-check.json)。短证据行来自 MIT 源码；许可沿用 [SOURCE-LICENSE.txt](../SOURCE-LICENSE.txt)，本课没有复制官方图片。正文、答案与审阅截图不进入公开静态目录。
