# H24 NO-GO解除门禁

**新作者侧结论：NO-GO，未解除原P1。** 不是自动CONDITIONAL GO。根因定位与分支通过不能替代原基线真实出口通过。

| 门禁 | 结果 | 依据 |
| --- | --- | --- |
| 1 | PASS | trigger localized to old Windows Node runtime forced-exit scheduling; builtins-only reproduction and official-binary controls |
| 2 | FAIL | unchanged fixed SDK default exit on original Node24.16.0 still aborts 0xC0000409 in fresh locked environment |
| 3 | PASS | unfiltered stderr, external actual process close; exit hooks/observer/patch/new runtime never substituted for original |
| 4 | PASS | eight fresh exact-lock installs, locks unchanged, no original cache replacement; forensic before-version candidate separately tagged |
| 5 | PARTIAL | 23 hook / 23 patched / 23 official newer runtime, H23 original and patched25, Renderer12 and3width pass; original exit and active EOF/direct-dispose terminal checks not passed |
| 6 | PASS | E/productWeb/realProvider/performance/cost/learners/measuredtime/externalreview remain unverified; P2 retained |

门禁二失败，门禁五部分通过，因此不具备解除条件。原版24.16失败、补丁24.16通过、新官方24.22.1通过及测试钩子通过分别登记，不做平均通过率，也不改A–E定义。活跃EOF/Dispose无领域闭合证据又独立保留。

E、产品Web、真实Provider、性能成本、学员/实测时长/独立外审、P2继续开放。此次交付是完成专项调查、最小候选修补与重新验收，非完成原版修复；没有改发布状态、正式模块审查或下一课。下一次解除申请须明确目标Runtime/原版或修补版身份、默认出口和实际资源/领域终态，重新提交相应证据。
