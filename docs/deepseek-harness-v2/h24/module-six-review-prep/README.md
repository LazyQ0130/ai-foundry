# 第六模块集中审查准备包

**只准备，未开展正式集中审查。** 四课标题/顺序照30讲蓝图；历史作者结论不等独立模块审查结论。当前H24总体NO-GO，开放P1优先处置，不能被H21–H23条件通过抵消。

1. [知识依赖矩阵](knowledge-dependencies.md)
2. [Subagent / Workflow / Jobs / Goal / Schedule架构](architecture.md)
3. [CLI / Web / SDK及完整链衔接](client-chain.md)
4. [四课测试证据索引](evidence-index.md)
5. [真实/Mock/未验证矩阵](capability-matrix.md)
6. [最高集成等级](integration-level.md)
7. [16张核心图索引](figure-index.md)
8. [术语一致性及待审问题](terminology.md)
9. [学习负担P2](workload.md)
10. [开放问题与风险](risks.md)
11. [H25前置知识](h25-prerequisites.md)
12. [建议议程与场景](review-plan.md)

输入身份在上级evidence/preparation-inputs.json；四课历史报告/测试引用原始路径，不改或重新汇总成“独立N场景”。准备图/议程是作者整理，不是审查执行记录或签署。

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](../p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](../p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](../p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](../p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
