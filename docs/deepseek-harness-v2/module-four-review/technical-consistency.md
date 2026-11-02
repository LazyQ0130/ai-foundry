# 跨课程技术一致性裁决

以正式正文的章节名为定位，精确源码定位见[断言索引](source-assertion-index.md)；代码和旧报告保持历史身份。C01候选逐条核对后，未发现需要改四课正文/图的确定技术P0/P1；确认的既有P1是依赖运行器R01。

| 课程对/正式位置 | 易混淆处与固定实现 | 实际核验证据 | 裁决 |
|---|---|---|---|
| H13“一份ToolDefinition”“Executor决定怎样描述” ↔ H14“四层职责” | Registry持完整定义/Scope路由；Executor describe/execute，Pipeline单项三阶段；Definition.execute是主体包装 | H13 C08/C27，H14 C-flow-normal；tools index/contracts/executor、Native入口 | 一致；不是四个独立进程；Native与PTC描述分开 |
| H13“when”“四个问题” ↔ H14“准备阶段” | set是Step准入身份，条件翻转不重算；注销同对象重登仍失效；dispatch再核当前资格 | H13 C13–19/C28–30与D remove/replace/restrict；H14 dispatchToolBody | 一致；Schema不等于永久许可证 |
| H13“七步定义” ↔ H14“解析、物化与验证” | helper返回诊断；defineTool执行包装晚于pre/guard；共享Pipeline校规范输出 | H13 C02–07/C27，H14 parse/args/output对照 | 一致；raw ToolDefinition不因已register自动拥有defineTool输入包装 |
| H14“前置Waterfall与守卫” ↔ H15“pre的allow以后” | pre外层可改deny；ask实际应答后最终allow才checkGuards；guard不能被批准放宽 | H14 C-policy，H15 approved-guard/override-guard；新增D-A全Loop body0 | 一致，新增完整调用/结果/后续请求补足跨课证据 |
| H14“一个规范值”“两种result” ↔ H15审批审计 | tools/result运行时通知；tool/result需log；asked/decided是独立log-only审计；无AgentLoop不造工具Session记录 | H14 D系列；H15 B明确无log sink；A无有效Turn拒绝 | 一致；Approval audit接受也不是存储flush |
| H15“六层机制”“文件观察” ↔ H16 File/Shell | File消费者发观察/意图、fs后端检查版本/围栏；Shell直接子进程不走同一观察事件；模式不保证网络 | H15 filesystem.ts真实适配器，H16 file.ts真实消费者；新增D-B外改/重读成功 | 一致；H16才补真实tool-fs链，不把H15夹具叫File工具 |
| H15“SandboxMode”“runner选择” ↔ H16 Shell实验 | full/partial是文件效果维度；Windows ACL partial，三平台runner均未启动；FixtureShell不是pwsh-local实测 | H15 simulated probe；H16 shell.ts白名单替身；native标NOT_RUN | 一致；真实Windows文件替换不补齐进程sandbox |
| H15信任/权限 ↔ H16 Web/MCP | 文件模式不管网络；Web清洗/标签不授权；stdio命令与环境是宿主执行边界；远端声明不能加本地allow | HTTP policy/provider+官方web文档；H16 combined blocked writes0 | 一致；未夸大内网拒绝或注入防御 |
| H13“注册/准入” ↔ H16 Web ready | 配置决定稳定注册；ready=false排除本Step；选择失败ready=true，执行报码 | H16八变体；新增D-C同一Agent四请求ready/不可用转变 | 一致；提供方可用与注册不能用一个“可用”替代 |
| H13 Scope/生命周期 ↔ H16 MCP | 发现适配后按Scope注册；断连禁重连可保留；资源按调用Agent查server；dispose才撤贡献 | SDK两Server、工具变更、失败刷新、隐藏资源、两种断连/重连；Scope-only资源为替身 | 一致；MCP资源/指令/Prompt模板三者不同 |
| H14错误/有序结果 ↔ H16四家族 | 全部模型调用走Tools入口；FS/Web有码；Shell非零可正常；MCP远端isError归一化失败；transport失败另层 | H16两条真实Loop5/7call，H14普通失败/内部失败，新增A/B/C | 一致；Runtime error.info.code与Session data.error.code不能混用 |
| H14取消/drain ↔ H16 Jobs/MCP | 取消要看实际操作结算；Jobs生命周期可超出本批；SDK请求取消不证明远端副作用撤回 | H14门闩系列；H16Mock Shell/真实SDK生命周期；更广provider取消仅静态/未测 | 一致且保留限制；没有由取消标记推出OS进程已停 |

H16蓝图中“只做Mock接线”是早期研发规格，正式稿已按用户后续任务增补真实本地File/SDK stdio，正文明确差异。蓝图没有被回写为已经包含这些证据；本审查也不改受保护旧蓝图。

图H13-02与正文实践B的过滤名单不完全相同：图还deny继承style，但A的自身style仍豁免，二者都得到analyze/style。图内完整列题设，不是两个相同输入算出不同结果；本轮作为P2阅读提示记录，不改正确图。依赖表和综合题要求逐层重算，避免靠记结果作答。
