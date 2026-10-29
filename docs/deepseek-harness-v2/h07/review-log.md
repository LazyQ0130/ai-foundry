# H07作者问题与修正记录

2026-10-29。新课从新文件制作，旧课和历史报告未重写。当前无未决P0/P1。记录实际发现、修正与证据，不以最后PASS抹掉早期实验失败。

| 项目 | 发现与风险 | 修正与复验 |
| --- | --- | --- |
| 状态图 | 教程线性箭头不足以解释失败回收、依赖恢复与显式永久释放 | 回读_getState/_reload/_unload及dispose，画三条精选路径，标非完整/非根；A/C真实观察 |
| 首轮实验加载中卸载 | 夹具在await门闩后才ctx.effect，此时显式dispose已清uid，注册抛INACTIVE_EFFECT，原期望clean=1失败（实际0） | 将所有权登记放在await前；另加异步setup先登记再等待用例。不去掉有效性检查；保存原失败输出与修正patch |
| 配置失败用例类型 | apply无配置参数，却传{}，strict报告TS2345 | 给验证夹具apply明确Context/unknown配置参数；不是把API改any，重新通过strict与全部运行 |
| 重复清理 | 文档“重复无效果”不等于重复await加入在途任务 | 读公共wrapper与effectInertia，测试stop和Fiber.dispose在途第二次undefined，owner仍等首次；正文保存首次结果 |
| 异步顺序 | reverse和Promise.all属于不同层次，不能写“全部逆序完成” | 双门闩B/A启动、A/B受控完成；单Disposer顺序及同Effect生成器分支另测 |
| 清理错误 | 默认认为全部错误忽略或dispose拒绝都不准确 | 分手动同步/异步与owner卸载三类，真实读logger记录；损坏logger边界标未执行 |
| 监听撤销 | H06留下的“已选回调会怎样”不能用注销猜取消 | parallel回调开始后卸载，首次工作仍待门闩；后续分发没有旧回调 |
| 父子与依赖 | 都叫卸载却不同原因，Consumer可保留实例 | 父子门闩/兄弟继续、C同uid恢复、显式Consumer不复活，图三分两列 |
| 官方证据行范围 | 初设resource-lifecycle:20–75漏末尾登记移除断言76–77 | 扩到20–78，重新核语句、引用、预览、Renderer内容与三宽度；不是只检查路径存在 |
| 蓝图与真实Agent收尾 | 蓝图概括不能替代实际scope/存储/登记的顺序 | 以initializeAgent真实teardown及catch/finally为准，只辅助例证，不展开后课 |
| Renderer适配 | 沿用H06作者工序，必须改成五完整程序/五思考题 | 自动QA实际逐字复制五文件、开合五题，未只改报告文字 |
| 许可 | Harness与vendor Cordis版权不同 | 分别保存原MIT许可DeepSeek/Shigma，图源原创说明 |

原失败日志：[lab-initial-failure.txt](evidence/lab-initial-failure.txt)；准确修订片段：[lab-revisions.patch](evidence/lab-revisions.patch)。日志只规范行尾空白以便Git diff检查，保留失败、实际/期望、堆栈与退出事实。错误副本的变异日志另保留，不当作未解决产品缺陷。

当前正文与图审查绑定evidence/content-check.json、visual-qa.json、manual-review.json的SHA256；完整五文件逐字同步，八成员AST辅助定位。最终门禁保留包哈希与原文件保护，不改原output或旧课来求绿。

P2待观察：320px图三双列及约12.6px辅助字，作者样本可辨；真实读者舒适性仍需校准。实际学习时长、试读、独立外审均待验证。
