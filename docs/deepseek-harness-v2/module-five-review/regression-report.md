# 修订后的回归验证报告

环境为本机Windows x64、Node v24.16.0、固定`f3803c9`源码及既有精确依赖。所有新运行使用mkdtemp隔离目录、受控Adapter/门闩/虚拟时间；临时产物保留，没有递归删除、真实付费Provider或业务资源变更。每次child run记录args、scratch、exit、stdout/stderr及程序hash，wrapper记录重定向；原课目录的旧run没有覆盖。

|检查|最终结果|证据/边界|
|---|---|---|
|固定源码身份|9619文件Git blob+SHA256一致|[source-check](evidence/source-check.json)，不是9619文件语义全覆盖|
|源码断言|198引用/范围/hash通过，38/50/54/56|[逐条索引](evidence/source-assertion-index.json)，语义另见源码审读/专项|
|H17行为|20/20，正文修订后再次通过|[当前TAP](evidence/h17/evidence/lab-tests.txt)，demo成功、故意错答案exit1为预期|
|H18行为|24/24|[当前TAP](evidence/h18/evidence/lab-tests.txt)，真实JSONL/PID子测试及两项D|
|H19行为|34/34|[当前TAP](evidence/h19/evidence/lab-tests.txt)，实际Basic/Pruner/JSONL|
|H20行为|45/45|[当前TAP](evidence/h20/evidence/lab-tests.txt)，虚拟clock/门闩与保守修复|
|新增跨课|5/5 D|[当前TAP](evidence/cross/evidence/lab-tests.txt)，两种顺序/独立预算/前缀/whole|
|逐项证据分级|123原+5新=128；复核C65/D63，无E|H20 raw-stream由原D降C，原标签保留；不计独立故障数|
|Renderer共享回归|12/12|[TAP](evidence/renderer-tests.tap)，使用用户当前未提交Renderer，不擅自回退|
|四课内容|4/4 PASS|各evidence/hNN/evidence/content-check.json；正文嵌入程序/任务键/引用/预览一致|
|原16图重新导出|16/16字节相同|[hash对照](evidence/figure-rerender.json)，原SVG/PNG未改|
|四课真实Renderer界面|12/12视口PASS|各evidence/hNN/visual/evidence/visual-qa.json，1440/390/320|
|完整代码复制|39程序×3宽度=117次精确LF规范化对照|H17=8、H18=13、H19=9、H20=9；并验代码横向滚动/展开原图/折叠键盘/静态预览|
|18题交互预览|3/3视口PASS|[assessment-qa](evidence/assessment-qa.json)，18答案、筛选/笔记/自评、无文档溢出|
|新4图|字体/文本边界与完整SVG导出PASS|PNG由sharp/librsvg生成；[实际人工审读记录](evidence/manual-review.json)|
|用户文件/输出保护|基线hash与文件集合一致|[protection-check](evidence/protection-check.json)、[最终核验](evidence/final-audit.json)|

## 最小复现命令

在仓库根目录依次运行以下命令；每课wrapper按原runner参数约定，H17/H18无参数即包含测试/demo/预期负例，H19/H20无参数执行其默认测试。不要给H17传`tests`。这些命令不清理目录或接触个人Session。

```text
python docs/deepseek-harness-v2/module-five-review/scripts/evidence.py source
node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs h17
node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs h18
node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs h19
node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs h20
node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs cross
python docs/deepseek-harness-v2/module-five-review/scripts/build-matrix.py
node node_modules/tsx/dist/cli.mjs --test --test-reporter=tap tests/lesson-renderer.test.ts
node docs/deepseek-harness-v2/module-five-review/scripts/run-content.mjs h17
node docs/deepseek-harness-v2/module-five-review/scripts/run-visual.mjs h17
node docs/deepseek-harness-v2/module-five-review/scripts/qa-assessment.mjs
python docs/deepseek-harness-v2/module-five-review/scripts/final-audit.py
```

content/visual分别以h18/h19/h20参数重复；程序化测验可由build-assessment.py、build-preview.tsx生成，新图由build-diagrams.py生成。重新生成内容/图片后需重新审图并更新人工观察的文件hash，不应把旧人工PASS沿用到新产物。

官方Vitest全套未运行。首次ENOENT、cross夹具1/4、H17错误参数、故意失败答案及旧课历史失败全部保留并在修订表区分。最终当前TAP fail0不意味着旧失败从未发生，也不意味着所有平台/物理故障/真实应用分支已验证。
