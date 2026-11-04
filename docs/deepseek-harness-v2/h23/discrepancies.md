# H23 失败与差异记录

下面均为作者环境/夹具或教学口径修正，不据此宣称上游有缺陷。所有已落盘 raw 和 trace 保留；本课前最早错误 anchor 仍只见工具输出，不伪造一份当时未存在的原始 JSON。

| 问题与原始记录 | 修复与复验 | 状态 |
| --- | --- | --- |
| 机械替换后 PTC anchor 指到不存在 h23-ptc-deps，发生于初始保存 handler 前 | 复用固定 h22-ptc-deps，版本/integrity 完整核验 | 关闭 |
| build-failure-1793790127499：bundle 无法解析 commander 等；run-1793790220770-probe：打包破坏官方相对 ../package.json | 改薄 mjs source launch，保留原模块相对语义；六树 bootstrap | 关闭 |
| run-1793790447443/0503043-probe：zod 未先映射、Windows C: ESM URL 不合法 | register tsx→bootstrap→动态 import，固定入口均用 file URL | 关闭 |
| run-1793790830884/0956562/1037693-web：缺 mime-types、Host alias 不含 Client 子路径、ws CJS 无 named export | 新 wire 精确依赖、逐项真实 Client 源映射、ws ESM wrapper | 关闭 |
| run-1793791081914/1115904-web：Remote payload 少 args 与 SessionController 协作者未齐 | 依正式 envelope/descriptor 和 Service.init 安装；补有限工作区/附件协作者，不伪造完整服务 | 关闭 |
| run-1793791446465-tests：Profile patch 指不存在条目、门闩未进入、初版持久观察误用 | insert 后按 id replace；实际用户消息须 source.kind=user（runtime-context 也是 user-role）；历史改真实新 reader 读回 | 关闭 |
| run-1793791671336-tests：预期拒绝码错写其他名字 | 按实际 RemoteAccess 固定 remote-access/denied，检查拒绝前零模型 | 关闭 |
| run-1793793956087/4065074-probe：补真实 AppBoot 后空配置误写{}，Loader 根配置失败；曾在 boot 审计完成前暴露 SDK | cordis/patch 写[]；await boot settled 后才 mount SDK，重新 X 与全25项 | 关闭 |
| 抓帧曾对末尾半行直接 JSON.parse | 仅解析到最后换行，保留余下字节；不要求 data 回调对齐帧 | 关闭 |
| 源断言 S28 初稿只覆盖 prompt 未包 cancel；新增真实 boot 分支 | 扩至459–519、加入 S54，正文链接同步，54范围重新检查 | 关闭 |
| D5 原先只观察运行时 facts，不足以单独证明磁盘保留；D4/D7 负例原先未实际执行后续 Loop | D5 关闭后新 reader 读 user/aborted；D4 异常帧后真跑新 Prompt；D7 旧进程 exit0 后新配置新 PID 真跑 Mock | 关闭，最终25项支持当前D分级 |
| W01 学习负担高于蓝图；完整系统/外部教学证据缺口 | 分段/折叠/前置与原始边界透明记录；不以作者判断替试读 | P2/外部条件保留 |

未发生批量删除，没有为绿灯弱化源码、审批或 Session 写者规则。最终通过与历史失败同时保留；上游官方参考测试未运行，不把作者修夹具称官方回归修复。
