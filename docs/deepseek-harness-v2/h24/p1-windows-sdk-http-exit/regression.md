# 回归、实际终态与剩余缺口

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

## 完整23项原始TAP索引

| 环境/分支 | 数量 | 原始run |
| --- | --- | --- |
| v24.16.0 / hook | 23/23 | [run-1793855009319-tests.json](evidence/run-1793855009319-tests.json) |
| v24.16.0 / patch | 23/23 | [run-1793855009323-tests.json](evidence/run-1793855009323-tests.json) |
| v24.22.1 / default | 23/23 | [run-1793855447677-28176-tests.json](evidence/run-1793855447677-28176-tests.json) |
| v24.22.1 / default | 23/23 | [run-1793855545427-16132-tests.json](evidence/run-1793855545427-16132-tests.json) |
| v24.16.0 / patch | 23/23 | [run-1793855546659-5580-tests.json](evidence/run-1793855546659-5580-tests.json) |
