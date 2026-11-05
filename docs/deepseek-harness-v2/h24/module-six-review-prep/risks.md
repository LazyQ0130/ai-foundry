# 未解决问题与风险清单

| ID/优先级 | 当前事实 | 闭合证据/建议所有者 |
| --- | --- | --- |
| EXIT P1 | 默认SDK+真实HTTP Mock场景两PID原生断言，当前钩子通过未修默认路径 | Runtime/Windows维护者独立最小复现与默认exit0回归；必要时验证兼容Node/发行入口 |
| W01 P2 | 四课作者预计时长高于原蓝图，长单行/多抽象并存 | 教学负责人安排目标学员计时与迁移任务，改稿后再试 |
| E-gap | 四课最高D，无完整发行Profile/built正向 | 应用验收负责人准备独立固定仓库与合法清理，补各真实入口 |
| WEB-gap | H23受控载体、H24仅TestRemote；无产品浏览器 | Web负责人运行官方built/Host/Chromium场景与权限/重连/错误证据 |
| PROVIDER-gap | 全部模型受控，无真实API/计费 | Provider负责人经授权用隔离账户另验，不上传用户Session |
| PERFORMANCE-gap | 无built benchmark/真实分布/成本/缓存收益 | 性能负责人记录环境/预热/样本/原数据，不从功能duration推收益 |
| REVIEW-gap | 当前单作者，模块正式审查未开展 | 独立技术/教学审稿人签署有范围结论 |
| OPS deviation | 新作者缓存内npm曾替换3个漂移传递包 | 已披露，后续新目录精确锁；不重复原地操作，不触碰保护文件 |

P0/P1不得条件通过；其余缺口能否接受要按明确申请范围判断。本文只整理风险，没有擅自指定外部人员或发送消息，也没有开始正式审查。

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](../p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](../p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](../p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](../p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
