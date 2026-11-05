# 四课测试证据索引

| 课/历史独立提交 | 固定行为项 | 原始身份/报告 | 本轮使用方式 |
| --- | --- | --- | --- |
| H21 / 8ad7786 | 21=C8/D13 | [quality](../../h21/quality-review.md)、[lab-results](../../h21/evidence/lab-results.json)、[test-grades](../../h21/evidence/test-index.json) | 引用原始证据，未在H24重跑全部 |
| H22 / 21ab93a | 23=C19/D4 | [quality](../../h22/quality-review.md)、[lab-results](../../h22/evidence/lab-results.json)、[test-grades](../../h22/evidence/test-grades.json) | 同上，PTC/Job/Goal/Schedule范围分问 |
| H23 / 4d68013 | 25=C7/D18 | [quality](../../h23/quality-review.md)、[lab-results](../../h23/evidence/lab-results.json)、[test-grades](../../h23/evidence/test-grades.json) | 作者prepare核心/Profile局部，不变成发行E |
| H24 / 本次提交 | 23=C9/D14 | [quality](../quality-review.md)、[lab-results](../evidence/lab-results.json)、[test-grades](../evidence/test-grades.json)、[X](../evidence/trace-X.json) | 真实核心YAML/Replay/HTTP/SDK故障；退出测试钩子限定 |

92个TAP身份的算术和不能称92个独立行为场景：跨课重叠、参数化、X复用、重复执行和属性样本逐项保留。每课12项Renderer同样是已有套件重跑，不能合并成48种新Renderer能力。H24另重跑M1–M6原教学24A，不加C/D。

当前H24默认退出原始失败见[default-exit-failure](../evidence/default-exit-failure.json)。绿色最终记录与红色历史必须同时交审，不能只挑最终TAP。所有四课固定官方Commit相同，输入/图hash在上级evidence中。

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](../p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](../p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](../p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](../p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
