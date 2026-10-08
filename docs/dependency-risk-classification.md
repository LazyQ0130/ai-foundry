# Dependency Risk Classification

2026-10-08 · Phase A2 · 本地发布门禁；不代表现网已核验。

## Runtime blocker

每次发布必须实际运行 npm audit --omit=dev --json，并核对 metadata / error。High 或 Critical >0、审计不可用或 runtime 暴露不明，均 BLOCK。Moderate 单独记录，不将它写成零漏洞。

## Accepted dev toolchain risk

本轮仅接受 [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) 对 Tailwind 3.4.19 → chokidar 3.6.0 / fast-glob 3.3.3 → micromatch 4.0.8 → braces 3.0.3 的关联风险：**ACCEPTED DEV TOOLCHAIN RISK**。full audit 的五个 High 仍原样披露，不改 advisory、audit 结果或历史 Verdict。

依据：受影响链只用于受信任源码的 CSS build；配置 content 为固定 ./index.html 与 ./src/**/*.{ts,tsx}；没有读取用户输入或课程 Markdown 作为 glob/config。HTTP/course 渲染路径不导入编译器或 braces；本地 dist/server-dist 没有相关模块导入；独立 production 依赖安装中没有 Tailwind、braces、micromatch、fast-glob、受影响 chokidar 3。当前 upstream 无已发布兼容补丁。没有必要把 Tailwind 4 major 混入 Planner 修复。

**精确例外**：普通 npm ls --omit=dev 仍显示 @prisma/client 的 optional peer prisma → @prisma/config → c12 → chokidar **4.0.3**，独立 production 安装也如此。它不依赖 braces，不在本 advisory 的 chokidar 2–3.6 affected chain 中。因此不能声称“五个包名全部不存在”，也不为消除一个无关安全版本而改 Prisma。实际接受的是受影响 Tailwind/braces 构建链，非泛化的 chokidar 豁免。

检查过上一轮本地 C9 standalone Docker runtime：五个包名全部缺席；该镜像只作为依赖暴露证据，不冒充本轮 Planner runtime 或云验证。C9 lock/Dockerfile 本轮未变。平台当前使用 systemd/Node，仓库没有平台 Docker manifest；不得用 C9 镜像证明平台 runtime。

## Build and CI conditions

仓库没有 .github workflow 或其他自动 fork-PR 部署配置。当前受审流程是操作者对受信任 main 的手动 build，不能推断 GitHub 外部设置或现网安装状态。

如果以后允许未经信任的 fork PR build，brace pattern 可由 PR 作者控制，存在构建进程 DoS 风险；更一般地，npm scripts 本身可以执行任意代码。这样的 job 必须无 production secrets/生产网络权限、不自动 deploy production、设置硬超时（最多十分钟）。不要使用 pull_request_target 执行 fork 代码并挂载 secrets。条件不成立时，撤销本项 acceptance 并 BLOCK；本轮未搭建 CI。

Linux 手动 build 可用 timeout --signal=TERM --kill-after=10s 600s npm run build；Windows 的本地审核 harness 不代表已部署的 CI timeout。

## Shipping boundary

旧部署手册的 npm install 是 build 环境步骤，不能证明 dev tools 没有留在现网 node_modules。完成 migration、seed、Prisma generate 和 build 后，应在运行副本中 npm prune --omit=dev --no-audit --no-fund；保留生成的 Prisma client、已编译产物与所需课程资产。随后核对生产树、实际原生模块/Prisma client 与服务启动。不要把只有忽略 scripts 的依赖审计副本当完整可运行部署包。

本轮只建立独立 .runtime/phase-a2/platform-runtime 依赖审计副本，使用 npm ci --omit=dev --omit=peer --ignore-scripts；它证实依赖暴露，未声称服务启动或云发布。现网是否 prune、实际 runtime tree、CI 权限与 timeout 仍待对应运维/Cloud 核验。

## Revisit / migration

每次 release 复查 advisory、npm tree 与 runtime 产物；一旦兼容补丁发布、受影响链进入 runtime、用户输入进入 compiler，或引入不满足上述条件的 CI，重新 BLOCK 并处理。若负责人政策要求 full audit 0 High，则本 acceptance 无效，记录 TAILWIND 4 MIGRATION REQUIRED，单独做 PostCSS/CSS/config/browser/visual regression 迁移。

平台 react-router 的两个 production Moderate 继续记录，不在本轮强制 Router 6 → 7。
