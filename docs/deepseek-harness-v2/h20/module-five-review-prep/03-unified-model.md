# Event Sourcing → Persistence → Context Management → Recovery

| 层 | 解决的问题 | 不能自动提供 |
|---|---|---|
| Event Sourcing | 已提交事实怎样派生历史/状态 | 磁盘耐久、外部操作恰好一次 |
| Persistence | 指定逻辑历史如何由Handle保存与持权访问 | 活跃Agent对象复活、任意硬件断电保证 |
| Context Management | 当前请求哪些材料被摘要、修剪或省略 | 无限窗口、无损记忆、自动省钱 |
| Recovery | 特定失败边界如何等待、缩减、停止或补齐 | 通用自动回滚、盲重非幂等工具 |

这是职责层，不是每次调用必经的四个串行服务。没有Backend也可以做内存Session/Compaction；有日志但没有活跃Agent也可只读；一次Retry不等于一次Resume。Fork是历史分支，运行时委派又是H21的独立协议。
