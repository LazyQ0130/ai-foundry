# H17 审读与修订记录

本轮为同一作者的分轮技术、教学、图文与交互自审，不是独立外审。先确认源码与前课，再实现实践和正文，最后实际看图；自动检查不替代语义判断。

| 问题 | 级别/依据 | 修订与复验 |
|---|---|---|
| R01 新Projection夹具把register返回值直接交Node assert.rejects，被当函数调用disposer，未观察预期拒绝 | P1（测试夹具）；首轮14/18，raw run保留 | 对照官方兼容文档与测试，Promise.resolve包成Promise；没有放宽版本断言 |
| R02 新defineTool漏output契约导致三个D在准备期失败 | P1（新夹具不可运行）；同首轮 | 补真实output schema/render，业务返回字符串，沿官方工具约定，不改上游 |
| R03 新实时观察器structuredClone整个事件含Agent对象，回调失败导致缺帧 | P1（新取证）；第二轮15/18 | 仅复制纯frame；第三轮18/18，后补两个有意义C检查为20/20 |
| R04 源码行范围超过request-header末行，tool-history范围也过长 | P2（引用生成） | 保留source-range-initial-failure.json；读实际函数，改63–69与9–75；当前38项、68处引用范围通过 |
| R05 C用step/start先于turn/start演示无关事件，组件虽接受却会误导生命周期 | P1（事件顺序教学）；作者审读发现 | 调整turn/start0→step/start1→step/end2→turn/end3；原程序保留revisions/projection-before.ts及差异patch；重新同步正文、运行20测试与视觉 |
| R06 综合X原先只用同一apply直接reduce，与真实Registry的对应还可加强 | P2（证据增补） | 增traceRegistryPractice，真实Registry对同一seed重算并与独立fold对照；明确附加end-seed切面 |

无未决确认P0/P1。R01–R03属于新作者夹具错误，不是发现官方实现错误。R05必须修，不能以测试绿为由容忍误导顺序。没有降低测试条件、删除失败用例或修改固定源码。

所有run-时间戳JSON保存args、scratch、程序hash、exit、stdout/stderr；最新lab-tests仅是便于阅读的摘要。旧H01–H16的测试、报告、图与output均由baseline hash保护。新增检查runner也逐步保存raw记录。没有执行文件批量删除或自动发布。

保留的静态与动态差别：取消前缀、resume/series分支沿源码及H12历史证据，不计本轮新增D；实时结算拒绝不冒充硬崩溃；内存seed不冒充后端恢复；viewCheckpoint内存行不冒充磁盘缓存。详见源码断言与测试报告。
