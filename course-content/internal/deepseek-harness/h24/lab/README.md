# H24 隔离实践

从 AI Foundry 仓库根运行 `node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs A`，再运行 B、C、D、P、X；不带组名运行 23 项固定测试。预期 `PASS A` 等；失败查 `h24/evidence/run-*.json` 的 stdout/stderr 和 scratch 下 trace。先核固定源码与依赖，缺失时停止，不暗装最新版本、不改基线。

固定源码 f3803c96974ad4a94195fb97e5c637e9c2a3afe3。机器相关 8 个依赖锚点及其全部直接/传递版本、integrity 由 runner 核对固定 pnpm-lock；其他机器可通过 H24_*_ANCHOR 覆盖，具体清单见 docs 的 preparation.md。源码通过 HARNESS_SOURCE_CACHE 指向同一固定版本。

Runner 将所有文件复制到新建的 aifoundry-h24-lab-*。各 world 又有独立 Home/Profile/workspace/JSONL。只允许工具写该 world/workspace/config.txt；unchanged.txt 必须保持 KEEP。网络只到官方 Mock Server 的回环动态端口，dummy key=h24-local-only。不读取真实 Session、凭据、Profile，不上传日志。

A=真实 YAML Profile/Loader Smoke 正反启动；B=不可变 Session Fixture、Replay、Snapshot 子模块与完整 workspace 比较；C=真实 SDK 子进程与持久 Resume；D=HTTP 429/断流/失败、工具拒绝、取消、关闭及端口复用；P=有种子属性样本和官方 TestRemote 合同；X=复用 D1，加关闭后 Session 重建与模型可见消息比较。

所有 SDK 夹具用官方 runtime-only exit 钩子设 exitCode、暂停 stdin 后自然退出。默认 process.exit 分支曾在本机 Windows/Node24.16.0 的 SDK+HTTP 场景产生 libuv 原生断言；原始失败保留，尚未解决，不能声称发行版默认退出通过。TestRemote 不等于完整 Client Runtime、jsdom 或产品 Web UI。作者 Profile 是完整核心 YAML 组合，未运行发行版完整 Profile，最高 D。正向 lib 构建、E、真实 Provider、产品 Web 浏览器、性能和成本未验证。

不运行官方全量脚本中会递归清理目录的路径。Loader Smoke 始终传 cwd；目录和原始运行证据保留。关闭子进程/端口和保留磁盘夹具是不同动作。遵守用户禁止批量删除的要求：不要用递归清理命令。seed 仅产生新候选 trace，不写基线；Record/Refresh 不在测试步骤中。15 道推导题、评分、失败恢复和完整程序在 lesson.md。
