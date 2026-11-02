# 制作标准：第四模块增补

沿用第一模块[v1](../module-one-review/production-standard-v1.md)、第二[增补](../module-two-review/production-standard-module-two-addendum.md)、第三[增补](../module-three-review/production-standard-module-three-addendum.md)，不重写原标准。新增规则来自多家族边界和本轮R01，不表示教学效果已获实测验证。

| 遇到的任务 | 作者新增动作/门禁 | 本轮依据 |
|---|---|---|
| 多能力家族 | 用同一需求逐项列名称/注册者/Service/Provider/Consumer/可选依赖/owner；允许结构不对称 | MCP无ctx.mcp，WebRuntime兼管选择；不可硬套四包 |
| 可见与允许 | 分登记、Scope、Step准入、调用时资格、执行决定、后端可用/强制、结果事实；至少一个“看得见却失败” | 新A审批后guard；新C ready与available |
| 安全教学 | 每保证列前提、实施边界、谁可能绕过、失败行为、已测/未测；不能用mode/Scope/Schema替其他层 | File/Shell通道不同，网络另管，optional Observation |
| 外部故障 | 正常业务错误、选择失败、transport断线、同步切换失败分开；注册状态与恢复动作单列 | Web404/不可用；MCP断连留目录和两阶段同步 |
| 证据维度 | A–E外另标协议真实度、实际平台、native后端、凭据/联网、学员；不会因SDK实调自动升级E | Windows真实stdio，Shell/Web替身，native仍NOT_RUN |
| 测试计数 | 核实际test文件及TAP展开；记录共享fixture、参数化、跨课语义重叠；demo/负例不计独立场景 | 136执行项→20主题，均不能称唯一独立场景数 |
| 完整依赖锁定 | 直接及传递依赖版本/integrity均对固定上游；宽范围显式pin/override；旧缓存拒绝留原错误，新隔离树复验 | R01 readdirp5.1.1漂移，原直接依赖检查不足 |
| 综合任务 | 从定位角色→预测集合→处理可控失败→恢复与证据逐层给分；明确哪些结论动态、哪些静态推导 | 18题、四跨课、Q17四层任务；不靠术语满分 |
| 可视化审读 | 几何/可点击之后实际查看图和长答案；保留源/输出及正文caption对应；样本写具体 | 16图字节同，QA04原样星号需作者看图才发现 |

每次仍先登记问题，保留前件/差异/原始失败，再最小修订；对副作用与恢复的未知状态不自动重放。完成内部研发不自动发布或开发下一课。真实试读与独立外审保持PENDING，不以增加标准文件数量宣称教学改善。
