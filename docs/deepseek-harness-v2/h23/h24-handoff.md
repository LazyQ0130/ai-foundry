# H23 → H24 前置知识交接

正式下一课 H24《大型 Agent 系统测试与综合架构分析》，唯一目标：**为一条跨模块链建立事实、测试与限制的证据矩阵**。前置为 H01–H23、Mock 与故障注入。本页只交接已有材料和能力要求，没有 H24 正文、实验、测验或配图，也没有开展第六模块集中审查。

进入 H24 应能交出：

1. Web 控制链和状态链：Client RPC→Gateway/RemoteAccess→SessionController→Inbox/Loop；follow 先监听再 snapshot/delta，标 Peer、Generation、cursor、revision、Seq。
2. SDK 轨迹：真实子 PID、initialize、prompt/messageId、入队事实、通知、run 区间/低层 wait、shutdown/exit；说明高层结果不是逐 Prompt 因果凭证。
3. 恢复证据：D1 两 PID、相同存储/工作区、resume 无新 Prompt、JSONL 前缀/新模型读到旧事实；D2 缺失/open/writer-held 拒绝，D3 格式不兼容。明确正常关闭后恢复不等崩溃或断电认证。
4. 失败责任：Web cancel 回执后再等停稳；SDK 本版无 session/cancel，close 有独立进程所有权；审批缺回答失败关闭、问答晚答无效，外部效果仍需查业务事实。
5. 证据分层：25=C7/D18，X 复用 B1/C1；真实 Core/JSONL/stdio 与受控 Web carrier/Peer 分列。教材浏览器 QA、固定字节身份、官方参考测试和 E 端到端各有不同含义。

可用原材料：lab-results/test-grades/behavior-traces、source-assertions、coverage-matrix、content-check、visual-qa、manual-review。所有历史失败保留，不能通过只读最终 PASS 丢弃夹具曾误判的风险。

未测项必须继续携带：发行版 sdk-minimal 完整服务组合、Harness Web UI/真实 WebSocket 与 cookie/Origin 鉴权、全部协议非法输入和取消竞态、受管后代 wait 的完整矩阵、异常强杀/断电/外部效果回滚、ACP/Python 实跑、真实 Provider、E、目标学员试读、实测时长和独立外审。W01 学习负担 P2 未关闭。

第六模块范围为 H21–H24；应待 H24 正式完成后再集中审查，不因本页存在提前执行。本轮 H23 完成即停止，不自动开发下一课或发布。
