# 最终自动验收与范围保护

PASS。基线 `2ba063f27d0a6c3cdb5ff4ae2d37d627878c95b6`；3768份原文件中4件R01必要配套修改有before原件/精确patch/hash，其他3764份逐字节保留，其中output共21份。四课正式正文、lab、源图/PNG与历史报告未变；H01–H12、前三集中审查及用户已有修改保留。

| 门禁 | 最终结果 |
|---|---|
| 固定源码完整性/引用 | 9552文件Git blob+SHA256，218断言、90正文链接范围PASS |
| 内容/源码辅助 | 实际parser/SSR、四课元数据/嵌入完整程序、任务key、110AST PASS |
| 实际行为 | 原136项+新3D =139执行项PASS；20语义主题，非独立安全场景数 |
| 负例/依赖 | 4个AssertionError受控预期失败；旧传递依赖树拒绝，新树锁核验PASS；H15/H16 demo PASS |
| Renderer | 既有12项PASS，原始stdout/stderr保留 |
| 视觉与交互 | 16源图重导byte-identical、四课12宽度+测验3宽度挂载PASS；48图截图、原图、87完整程序复制、折叠键盘、代码局部横滚 |
| 综合测验 | 18题100分、四跨课与阶梯任务；完整答案/推导/Rubric/误答/依赖；三宽度互动及长答案PASS |
| 人工作者样本 | 24份最终样本含16源/320图对照和最终长答案，hash锁定；不是独立外审 |
| 范围 | 只新增本目录+H15/H16两README/两runner；当前暂存207件，最终提交前再查cached scope/whitespace |

`evidence/validation.json`为最终机器报告，`necessary-revisions.patch`是4件必要修改的原diff；各次check/aux/run时间戳raw保留失败。源片段/AST/几何是辅助，不能替代语义、安全审计或真实教学效果。

原生Shell与三平台进程sandbox、真实Web/MCP HTTP、完整E、跨进程持久恢复、学员效果/实测耗时、独立外审继续NOT_RUN/PENDING。结论CONDITIONAL GO不构成发布许可。不开发H17、不修改课程价格/权限/数据库/发布/线上业务，无批量删除。

提交后用 `python docs/deepseek-harness-v2/module-four-review/scripts/final-audit.py --verify` 只读复核；不重写已提交证据。
