# H22 差异、故障与修订记录

保留失败与后续PASS；没有改固定源码、删测试或降低执行策略。以下是作者研发夹具/教学修订，不冒称上游缺陷。

| 项 | 证据或来源 | 修订与当前状态 |
| --- | --- | --- |
| 暂题只有Workflow，蓝图有四抽象 | 正式蓝图H22字段2/7 | 保留正式标题、四抽象表/Goal与Schedule真实边界用例，CLOSED |
| pipeline容易误写全局阶段屏障 | runtime.ts逐项for循环；B2 | 正文、图二、X改为先await parallel再C；CLOSED |
| 最初打包猜错subprocess路径、漏birpc/acorn/walk和yaml | 作者工具调用文本；最初两次build异常未单独写raw文件 | 查真实tsconfig路径，隔离补固定依赖并扩展build-failure记录。未伪造这两次原始日志；CLOSED |
| host解析遗漏chokidar | run-1793785313284-probe.json | bootstrap映射固定native树，CLOSED |
| 观察包装把同步spawn改为async | run-1793785357014-probe.json及当次trace | 恢复同步契约，仅观察Handle.done，不替换执行策略；CLOSED |
| scratch动态ffi找不到koffi，受限runner不可用 | run-1793785402323-probe.json及trace | 新scratch junction到已锁定koffi树，官方runner不改；未回退unrestricted。后续probe真实PASS；CLOSED |
| 首轮4项断言/夹具错误 | run-1793786114274-tests.json，17/21 | unknownProvider实际AGENT_START；item错误文案per-call cap；isError在data.message；显式jobs.wait消费终态会抑制通知。按真实分支修复并保留行为断言；CLOSED |
| 并发共用child脚本可能调换任务身份；JSON转义断言错误 | 旧X trace及run-1793786188789-tests.json | 每角色独立Mock model键；解析真实rendered JSON并deepEqual完整字段；核C开始晚于A/B终边。旧错结果不充当正确证据；CLOSED |
| 取消后只立刻检查Promise不足以证明排空 | 作者复审C1/C2 | 先等受管子进程done，再过事件循环确认result仍等门闩；晚到句柄释放一次。最终完整重跑通过；CLOSED |
| name/phase描述比实际校验严格；args复制不等JSON | meta/runtime/start源码及A4/C4 | 建议命名与实际非空校验、声明标签与执行依赖分别讲；CLOSED |
| Host不传maxDepth，不能引用H21工具默认1 | host.startChild + H21 resolveMaxDepth | 主线、衔接表及S20显式说明；CLOSED |

原始run包含失败stdout/stderr、当时程序hash与scratch；每次trace另有时间戳文件。最终指针见lab-results.rawRun，不累计旧重跑计数。source-lock的9625文件身份核对不代替语义审读；上游Vitest仅选读，没有执行其递归清理。未确认当前有开放P0/P1。

提交前暂存曾因临时使用autocrlf=false保留CRLF而触发空白检查；仅H22按仓库规范重新暂存，并修正source-checklist生成器多余文件尾空行。行为程序与用户文件不因此改写，最后默认git diff --cached --check通过；记录见evidence/staging-normalization.json。

W01 P2仍开放：蓝图130–180分钟，正式稿作者估210–290，尚无学员耗时/错误分布。Windows partial、真实模型/外部Agent、完整E、独立外审是明确未验证范围，不以条件通过豁免后来确认的P0/P1。
