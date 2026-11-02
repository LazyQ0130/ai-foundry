# H17 测试证据与覆盖边界

最终20项TAP执行通过：**C17、D3**；故意错误答案以断言失败退出1，错误信息被核对。A/B是实践名称，不是证据级别。默认demo与单项A入口另验，不重复计测试场景。全部原始run-JSON保留程序hash、命令、scratch、exit、stdout/stderr，最新便读日志为[lab-tests.txt](evidence/lab-tests.txt)，汇总为[lab-results.json](evidence/lab-results.json)。

| TAP项 | 级别 | 真实受测边界 |
|---|---|---|
| 1 A追加 | C | Store/Session；11种JSON拒绝后日志/Surface/消息不变，快照/冻结、显式flush |
| 2 数字品牌 | C | Seq/Offset构造拒绝负零、小数与非安全数 |
| 3 发布归属 | C | prepare不可写；Header不占事件 |
| 4 观察者失败 | C | commit已发生，单监听失败不回滚、不阻断后监听 |
| 5 重入 | C | 发布期间append被拒绝，长度不增长 |
| 6 flush失败 | C | 等全部监听settle后报告首个注册失败 |
| 7 B Surface | C | 位置跨度、完整源引用、保留事实、缓存/数组稳定性 |
| 8 资格 | C | log-only不能带操作，消息缺操作不能接纳 |
| 9 空节点 | C | 空system/developer/assistant不产消息，空user仍产消息 |
| 10 请求头 | C | 规范空字段、完整快照覆盖而非合并 |
| 11 历史工具 | C | header/developer新增后移除，调用方改定义不篡改旧Schema，重建相同 |
| 12 C Projection | C | init/apply原引用、stateOf、snapshot、通知、dispose、版本/Schema行兼容 |
| 13 X综合 | C | 16条确定性事实、当前Surface/消息、真实Registry与独立fold一致 |
| 14 过去前缀 | C | 请求1只读[0,6)，当前最终历史不能倒灌 |
| 15 有洞日志 | C | seed的Seq不连续时拒绝，不能静默排序 |
| 16 getter快照 | C | 一次读取并记录同一经过验证的值 |
| 17 受限改写 | C | system头正确单节点替换；tool-result改身份拒绝、仅content成功 |
| 18 D成功 | D | Loop/Runtime/Prompt/Tools/Native/Session两请求，实际前缀重建封装和工具配对 |
| 19 D失败 | D | 失败终态结算attempt，紧凑流留存，无Assistant模型消息 |
| 20 D拒绝结算 | D | 实时帧存在，Assistant两种事实均未接受，abandoned不能补造seq |

这些不是20种互不重叠的独立场景。A/B/C/X内部有多断言，某些测试复用同一函数但每次新建对象；D三个分支共享接线而分别执行。语义主题为接受/身份、不可变/JSON、发布/通知、Surface替换、消息派生、请求/工具历史、Projection、前缀重建、实时/结算、flush边界，共10组。Cordis作为依赖不重复记B，常量工具/Adapter不另计A。

固定9556源码/配置/文档/测试文件核Git blob和SHA256，仅证明身份；38断言与68链接范围配合实际分支审读，不把搜索/AST当行为验证。完整23个直接/传递依赖条目逐一核name/version/integrity与固定上游package；当前未加载的可选平台包单列installed=false。未在业务目录安装依赖，未运行官方完整Vitest。

原始前两轮分别14/18、15/18，第三轮18/18；新增getter与受限改写后20/20，修正C生命周期和增强XRegistry后仍20/20。失败原因和修订在[review-log.md](review-log.md)，没有丢掉失败记录。

| 维度 | 本轮证据 | 不能外推 |
|---|---|---|
| 平台 | Windows、Node24.16.0、固定Cordis/官方TS源码 | 其他OS、原生进程沙箱 |
| 模型/工具 | 脚本Adapter、常量工具、真实Native执行器 | 真实Provider质量、危险动作或联网协议 |
| 会话存储 | 内存Session；提交后事件订阅与seed重建 | JSONL、SessionHandle磁盘耐久、跨进程写锁、恢复/Fork |
| flush | 无监听false；计数器true；全部等待与失败传播 | fsync已经执行或崩溃后可见 |
| Projection缓存 | 内存构造行的版本/Schema准入 | 持久缓存加载/崩溃修复 |
| 学习效果 | 作者预测题/答案/Rubric审读 | 真实理解、学习时长、评分一致性 |

E完整Harness应用及真实持久环境 **NOT_RUN**；学员试读、独立技术/教学外审 **PENDING**。H12取消安全前缀与更早硬中断沿源码/旧实验理解，不新增计入本轮D。当前rejected-settlement不是硬断电实验。
