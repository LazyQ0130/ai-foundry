# H05 验收记录

2026-10-29。当前结论以 [validation.json](evidence/validation.json) 与正文/图/受测文件哈希为准，不以作者口头保证代替证据。

| 验收项 | 实际结果 | 范围限制 |
| --- | --- | --- |
| 正文与预览 | 实际 parser 与 LessonMarkdown SSR；五字段、4个新且全局唯一任务键；预览全文同步 | 未接产品路由、权益或进度 |
| 实践 A/B | 9项行为测试通过；两种挂载顺序、缺失/遗漏依赖、真实调用、替换、初始化与重复注册均核 | A是普通教学程序；B使用真实固定 Cordis，不是整个 Harness |
| 错误答案/类型 | 删除 inject 的子进程非零；缺服务退出0且无问候；TS2345负例及声明擦除 | 类型通过不代替运行，未跑完整上游构建 |
| 源码 | 28正文固定范围、24断言、37文件匹配固定Git blob，4项AST身份辅助 | 官方测试为选读；语义由作者分支审读，不靠关键词证明 |
| Renderer | 已有9项回归通过 | 无产品 Renderer/CSS 改动 |
| 视觉/交互 | 3图 SVG+PNG+生成器；1440/390/320各图解码与图注、15折叠键盘开合、6完整文件复制、代码横滚、原图弹页及无页面横溢 | 本机作者夹具，非线上媒体/鉴权；非所有辅助技术组合 |
| 衔接与边界 | H04→H05及H05→H08逐项作者审读；H06交接另存 | 没开发H06，不把作者审读叫外审 |
| 范围保护 | 初始2027个跟踪文件及915个output文件逐哈希保留；新增仅两个h05目录 | 不暂存output，不运行发布构建或数据库工序 |
| 真实教学效果 | PENDING | 学员试读、真实时长、评分一致性与独立外审没有执行 |

自动化日志：[实验](evidence/lab-tests.txt)、[正常](evidence/lab-demo.txt)、[缺失](evidence/lab-missing.txt)、[错误答案](evidence/lab-mutation.txt)、[Renderer TAP](evidence/renderer-tests.tap)、[三宽度](evidence/visual-qa.json)、[实际看图范围](evidence/manual-review.json)。

初版夹具的包编译边界、Windows路径/换行与TS脚本解析失败均已记录在 [review-log.md](review-log.md)。未通过的尝试没有被描述成成功；修正的是作者夹具，没有放宽业务断言、改上游或改产品。

未验证：完整官方Vitest/构建、Loader/Profile/完整Agent、真实模型/协议、OS沙箱、持久恢复、线上素材鉴权与进度。该版本未安全审计；本轮完成H05后停止，不推送、不发布。
