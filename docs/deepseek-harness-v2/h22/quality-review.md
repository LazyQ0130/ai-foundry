# H22 作者侧质量审查

结论：**CONDITIONAL GO**。固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；适用正式H22《Workflow、Jobs、Goal 与任务调度》的作者内容与本地C/D证据。当前未确认开放P0/P1；初始打包、测试夹具及任务身份问题已修复复验。真实教学效果、独立外审和E级应用仍未验证，不能据本结论发布。

## 分维度判定

| 维度 | 结论 | 证据与限制 |
| --- | --- | --- |
| Workflow行为 | GO（列明组件） | A/B/C真实Engine，meta/JS解析/args/JSON/组合器/普通与fatal/结构化输出；23项C19/D4的逐项边界另表 |
| PTC执行 | GO（Windows局部） | 正式Node PTC与Windows ACL runner从固定源码打包，read-only/partial，真实独立子进程；无unrestricted fallback |
| 并发/顺序 | GO（门闩场景） | B先结束仍按A/B输出；A2可先于B1结束；X的C必须晚于A/B终边；三种规模cap与Subagent容量互动 |
| 取消/释放 | GO（合作受管资源） | published/late-start、进程done后result仍等门闩、shared dispose、busy guest运行级取消与后台kill；非任意外部后端停稳认证 |
| 文件边界 | GO（单点拒写） | VM可逃逸后由正式read-only令牌拒写新fixture，内容保持；缺confinement在spawn前拒绝。网络/读取/硬链接和其他OS未认证 |
| Session记录 | GO（限定根调用） | D1四类日志共8条，经显式flush/真实JSONL读回；父下一请求含聚合；并非所有runtime事件持久化或断电耐久 |
| Jobs后台 | GO（列明路径） | D3真实回执、环/模型过滤、quiet通知、终态只读一次；D4 job_kill后stopping→killed并清理；默认wakeup/failed/ring截断/全owner矩阵未动态测 |
| Goal | GO（服务层） | create/pause/CAS/resume/disarm与0模型请求；轮次driver、预算耗尽/重启授权只静态，未宣称自动持续工作已测 |
| Schedule | GO（未来任务保存） | 真实JSON backend、新Context读回、selector拒绝且0模型/Workflow；未触发到期、recurrence或跨进程恢复 |
| 真实外部Provider/Agent | NOT_RUN | 没有付费请求、供应商质量/性能/成本或外部Agent协议验证 |
| E级完整Harness | NOT_RUN | 未使用完整profile、产品载体与端到端真实环境；真实子进程和文件不自动升E |
| 学员试读 | PENDING | 无目标学员无提示独立完成/迁移数据 |
| 实测学习时长 | PENDING | 210–290分钟仅作者估计 |
| 独立技术/教学外审 | PENDING | 同一作者分轮自审，不冒称第二审稿人 |

## 技术证据与修订

23有效执行=C19/D4，12既有Renderer回归通过；X复用D1，demo/历史重跑不叠加，必要Cordis依赖不另算B。完整TAP、每次run的参数/exit/stdout/stderr/程序hash/scratch与分次trace保留。最新lab-results指针对应当前受测程序；[coverage-matrix.md](coverage-matrix.md)逐项列真实对象、替身、边界及未覆盖分支。

46条源码断言均有固定Commit、真实文件、准确行范围、函数/类型/控制分支、上游测试位置与本轮等级。9625份Git blob/SHA256核对仅证明身份；五棵隔离依赖的直接和传递版本/integrity均对固定pnpm锁核验。官方Vitest仅选读，不执行其递归清理；不将定位测试写成官方套件通过。pipeline引用范围已扩至包含完整catch/return null分支。

关键误解在正文、图与答案交叉纠正：Engine不是Provider表；JS脚本不是任意TS；phase不是屏障；pipeline逐项而非批次阶段锁；null与fatal分开；start前抛错与Run结果结算分开；Host的caller归属与父Turn分开；五层预算各自独立；前台等聚合，后台Job先回ID；runtime/log-only/模型输入分路；cancel不等停稳；持久事实不等脚本检查点。Host未传maxDepth，不能套H21工具默认深度1。文件策略不冒称网络隔离。

初始依赖/打包、async误包spawn、koffi解析、工具结果层级、Job wait抑制通知、并发Mock身份分配及JSON比较问题均有[失败修订记录](discrepancies.md)，失败raw保留。前两次build错误仅工具文本存在，未伪造补录原始日志。所有修复不改官方源码、不降低文件模式、不移除核心断言。

## 教学负担与视觉

当前默认正文6560汉字、全部9546汉字（均去代码/URL），16代码块426行、29折叠区，4图、4实践+1综合、12思考题，其中8题含代码/轨迹推导。精读5文件，Realm/PTC和长程序折叠；决定正确性与安全的限制在默认主线可见。

预估210–290分钟，蓝图130–180增加80–110，前课180–250增加30–40。以55–75/65–90/90–125三个可交付停点控制同时引入概念的数量。正文文字较H21少，但原生环境与编排/后台/长期任务仍增加实践负担；W01 P2保留，不能宣布实测减负成功。环境安装另计，真实试读可能改变估时。

1440/390/320实际组件/CSS交互检查通过；33次完整复制一致、全部折叠键盘操作、四图原图、代码横滚和静态HTML均核。作者实际看9个样本，未见裁切/重叠；辅助图字约12.6px，不代替更多设备、无障碍或学员体验研究。

## 范围保护与停止

四张原创图保留SVG/生成脚本/PNG，正文与11执行程序同步；预览仅作者本地映射，不把私有正文/图复制public。H21衔接审查与H23前置另交，未开发后课或开展模块审查。

研发前4963文件（含output、H01–H21、五模块审查、历史证据与用户改动）逐文件保护，最终结果见[evidence/validation.json](evidence/validation.json)。仅暂存并独立提交H22两个目录；未改线上课程、价格、权益、数据库、发布状态或真实用户数据，无批量删除。全部临时根保留。作者侧技术在限定范围可进入后续独立研发，学员效果/外审仍待补；若后续确认P0/P1必须阻断复审。本轮完成H22即停止，不自动开发H23，不发布。
