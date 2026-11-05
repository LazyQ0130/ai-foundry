# H24 Windows SDK＋HTTP 退出专项

**复验结论：保持 NO-GO，原 P1 未解除。** 已定位可复现的触发条件，并交付独立候选补丁与另一官方 Runtime 的限定证据；没有修改锁定官方源码、全局Node或发布状态。

原版固定f3803c96974ad4a94195fb97e5c637e9c2a3afe3的作者核心Profile，在Windows x64/官方Node24.16.0经SDK协议shutdown仍发生原生断言。全新锁依赖仍失败；纯Node内置模块最小复现3/3失败，Listener已关闭，排除“必须有SDK/三个npm包/产品Webserver才触发”。官方Node24.22.1同最小例3/3正常，原源码默认出口23项通过，均未使用退出钩子。

候选SDK补丁在副本中改变默认出口为记录exitCode、暂停输入后自然退出，保留协议/flush/根清理和真实进程观察；Node24.16.0下23项、H23补丁版25项及协议关闭/活动HTTP取消对照通过。它是修补分支，不能标为固定原版通过。活跃HTTP中的EOF/直接Dispose还有终态证据缺口，全部保留为未通过。

1. [环境与只读基线](baseline.md)
2. [复现步骤](reproduction.md)
3. [确定性对照矩阵](reproduction-matrix.md)
4. [原生断言与阶段](native-assertion.md)
5. [三个包的依赖审计](dependency-audit.md)
6. [根因分类与排除](root-cause.md)
7. [补丁及处置](fix-or-disposition.md)
8. [回归与终态](regression.md)
9. [六项解除门禁](gate-decision.md)

[机器结果索引](evidence/result-index.json)、[原始run](evidence/)、[最小代码](minimal/native-repro.mjs)、[候选补丁](patches/sdk-natural-default-exit.patch)。历史fd4f147报告完整副本在original-reports，原始旧run与Fixture原样保留。此专项不是第六模块正式审查，不开发H25，不发布。
