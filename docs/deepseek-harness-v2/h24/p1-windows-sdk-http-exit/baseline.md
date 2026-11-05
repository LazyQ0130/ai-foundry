# 调查前基线

HEAD `fd4f147bbaeae48d38b4c03fe1fcf34330138028`，分支main。工作目录`C:\Users\QYF\Desktop\AIFoundry`。开始前重核原5294个受保护文件全部字节未变；再保存5498个现有文件SHA256，包括H24的204个原交付文件。完整状态、环境变量**名称**、Node/npm/pnpm位置与输出在[evidence/baseline.json](evidence/baseline.json)，不记录真实密钥值。原报告另复制，后续更新明确保留历史。

| 项 | 原环境 |
| --- | --- |
| OS | Windows-11-10.0.26300-SP0 / AMD64，Windows build10.0.26300 |
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
