# H22 实验运行说明

运行入口在仓库根目录的 `docs/deepseek-harness-v2/h22/scripts/run-labs.mjs`。本目录11份完整程序在lesson.md逐字同步，`workflow.test.ts`是计数用入口，A/B/C/D/边界是各组，X复用D1场景。README和许可不是需嵌入正文的执行程序。

## 明确的前提

作者实测Windows、Node24.16.0、Python3；仓库现有tsx/esbuild/yaml/React/PostCSS/Tailwind可用。固定源码缓存必须与commit逐字一致，禁止自行改源码后沿用原验证标记。源码与Git缓存位置由 `HARNESS_SOURCE_CACHE`、`HARNESS_GIT_CACHE`指定，默认值见check-sources.py。先运行：

```powershell
python -X utf8 docs/deepseek-harness-v2/h22/scripts/check-sources.py
```

缓存可从已取得的固定commit解包准备；不要在用户业务仓库切换版本，也不自动追main。依赖来自固定源码pnpm-lock.yaml。作者复用四棵已验证的隔离npm树，仅为H22新增一棵PTC树；没有在业务package.json/package-lock.json添加runtime依赖。

| 环境变量 | 指向文件 | 该隔离树精确运行依赖 |
| --- | --- | --- |
| H22_DEPS_ANCHOR | node_modules/commander/index.js | @eslint-community/regexpp4.12.2、ajv8.20.0、commander15.0.0、fast-uri3.1.8、js-yaml4.3.2、node-addon-require-builtin0.1.9、resolve.exports2.0.3、semver7.8.5 |
| H22_ZOD_ANCHOR | node_modules/zod/index.js | zod4.4.3 |
| H22_NATIVE_ANCHOR | node_modules/koffi/index.js | chokidar5.0.0、koffi3.1.1、yaml2.9.0、readdirp5.0.0，overrides固定readdirp5.0.0 |
| H22_LIMIT_ANCHOR | node_modules/p-limit/index.js | p-limit7.3.3、yocto-queue1.2.2、@js-temporal/polyfill0.5.1、jsbi4.3.2 |
| H22_PTC_ANCHOR | node_modules/acorn/dist/acorn.js | acorn8.18.0、acorn-walk8.3.5、birpc4.2.0 |

五棵树都需要package-lock.json。运行器核每一直接/传递依赖版本与integrity，optional未安装项单列；只固定直接依赖不足。移植环境可在**全新且明确的隔离目录**建立package.json并用npm install --save-exact --ignore-scripts --no-audit --no-fund安装表中依赖，native树package.json同时写上述overrides，再设置五个锚点；不要修改业务依赖来消除版本拒绝。作者本次实际新增命令为：

```powershell
npm install --prefix C:\Users\QYF\.codex\research\h22-ptc-deps --save-exact --ignore-scripts --no-audit --no-fund acorn@8.18.0 acorn-walk@8.3.5 birpc@4.2.0
```

此命令只用于作者已经明确的新PTC目录；其他机器按自己的新隔离目录设置变量。默认四棵历史树的具体位置在run-labs.mjs，所有版本/integrity见 `docs/deepseek-harness-v2/h22/evidence/dependencies.json`，已验证记录不能替代移植后重验。

## 运行及边界

```powershell
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs X
```

不带参数执行全部23项；也可选A、B、C、D、boundaries。每次新建aifoundry-h22-lab-*临时根，worker和正式Windows ACL runner从固定源码打包，spawn同步契约不变；Node运行器使用read-only，能力声明为partial。没有受限执行能力应非零失败，不改danger-full-access，不把自造执行器当C。Windows策略不保证所有读取、硬链接与网络隔离。

原始run JSON保存args、exit、stdout/stderr、程序hash与scratch；trace文件保留JSONL根及事件/请求。为了遵守文件政策，不做递归清理，临时根和junction保留，不提供批量清理命令。Bootstrap拒绝fs.rm的recursive用法。不要执行上游测试中带递归rm的原清理钩子；本轮只静态选读上游Vitest。

协作者包括Mock LLM、内存workingDirectory、Host配置cell、点读Query、受控Provider；正式Engine、Node PTC、ACL runner、Subagent、Spawn、AgentLoop、Tools、Session/JSONL、Jobs、Goal及Schedule/JSON backend均按用例真实装载。Goal只测服务变更；Schedule只测未来记录的新Context读取；未测目标driver和到期投递。没有私人文件、真实Provider、外部Agent、真实服务器或E级完整应用。
