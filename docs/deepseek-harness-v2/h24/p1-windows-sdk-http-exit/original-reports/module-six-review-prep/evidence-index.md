# 四课测试证据索引

| 课/历史独立提交 | 固定行为项 | 原始身份/报告 | 本轮使用方式 |
| --- | --- | --- | --- |
| H21 / 8ad7786 | 21=C8/D13 | [quality](../../h21/quality-review.md)、[lab-results](../../h21/evidence/lab-results.json)、[test-grades](../../h21/evidence/test-index.json) | 引用原始证据，未在H24重跑全部 |
| H22 / 21ab93a | 23=C19/D4 | [quality](../../h22/quality-review.md)、[lab-results](../../h22/evidence/lab-results.json)、[test-grades](../../h22/evidence/test-grades.json) | 同上，PTC/Job/Goal/Schedule范围分问 |
| H23 / 4d68013 | 25=C7/D18 | [quality](../../h23/quality-review.md)、[lab-results](../../h23/evidence/lab-results.json)、[test-grades](../../h23/evidence/test-grades.json) | 作者prepare核心/Profile局部，不变成发行E |
| H24 / 本次提交 | 23=C9/D14 | [quality](../quality-review.md)、[lab-results](../evidence/lab-results.json)、[test-grades](../evidence/test-grades.json)、[X](../evidence/trace-X.json) | 真实核心YAML/Replay/HTTP/SDK故障；退出测试钩子限定 |

92个TAP身份的算术和不能称92个独立行为场景：跨课重叠、参数化、X复用、重复执行和属性样本逐项保留。每课12项Renderer同样是已有套件重跑，不能合并成48种新Renderer能力。H24另重跑M1–M6原教学24A，不加C/D。

当前H24默认退出原始失败见[default-exit-failure](../evidence/default-exit-failure.json)。绿色最终记录与红色历史必须同时交审，不能只挑最终TAP。所有四课固定官方Commit相同，输入/图hash在上级evidence中。
