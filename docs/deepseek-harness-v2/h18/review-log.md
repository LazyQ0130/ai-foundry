# H18 问题与修订台账

同一作者的技术、教学与视觉分轮审读，非独立外审。先登记问题再修，不改官方源码或弱化断言。

| ID | 等级 | 发现、修改与复核 |
|---|---|---|
| R01 | P1 / 环境 | 首次真实JSONL运行发现catalog依赖@js-temporal/polyfill缺失。新隔离目录精确安装0.5.1及jsbi4.3.2，连同p-limit/yocto-queue与全部传递包核上游integrity；原失败run保留 |
| R02 | P1 / 实践夹具 | 首版真实resume夹具无受保护system首Surface，恢复本身可读，但继续Loop首次加system后持久校验拒绝。为该Loop夹具补合法首节点并重编号；原agent源码与原失败run保留，没有放宽格式验证 |
| R03 | P2 / 运行器 | 初版总入口沿用旧session.test.ts文件名，找不到测试。改为persistence.test.ts，原失败run保留，最终24项通过 |
| R04 | P1 / 图示 | 实际看图发现图二“Session提交→路由缓冲”箭头误标排空。保存前SVG/PNG，改为入队，并在缓冲→批次位置单独标批写，重导/三宽度/实际看图 |
| R05 | P1 / 上游差异 | session子系统692声称拒绝开放Turn前缀，与690/实现/官方测试冲突。正文和断言明确采用已验证forked闭合，保留原文来源；不回写上游或旧课 |
| R06 | P2 / 辅助脚本 | 首次图生成未预建figures/source，首次sync仍列旧文件名。增加目录创建，按本课marker发现13程序；不改旧脚本或旧输出 |

当前无未决确认P0/P1。图二前件在evidence/revisions；resume前件来自原失败scratch的实际文件。lab每次保留program hash、args/exit/stdout/stderr，不将失败记录改成当时已通过。辅助脚本最初错误在本次工具轨迹中，未虚构其已有单独raw run。

复核重点：三flush入口、无writer布尔反例、空close不物化、两类尾部、Fork含切点/marker/closer、parentSession缺省、未知结果不执行工具、物理V3与逻辑V4。写迁移/断电/其他平台/完整E与学员限制不靠“测试全绿”解除。
