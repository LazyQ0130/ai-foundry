# H11作者审查与修订记录

2026-10-30，官方Commit固定为f3803c96974ad4a94195fb97e5c637e9c2a3afe3。本表区分实际发现的缺陷、源码澄清及新增覆盖，不制造“先失败后修复”的测试记录。

| 项目 | 严重度/性质 | 发现与处理 | 复核 |
| --- | --- | --- | --- |
| 图2求值位置与complete箭头 | P1，已关闭 | 草稿把变量求值放在排序后，且render连到complete，易误认同一轮串行分支；调整为assemble先取变量，complete另轮独立卡片且无误导连线 | [实际修订patch](evidence/figure-sequence-revision.patch)；重生成SVG/PNG、三宽度几何检查、作者看最终图2三宽度 |
| 具名与匿名贡献不同 | 源码澄清 | 不机械照搬README的笼统作用域表述：Section/Context/Variable同名覆盖，匿名Tool Provider按层叠加；Tools的具名定义另由Tools服务管理 | C15–18、D09；正文与图3一致 |
| assemble与render失败阶段 | 源码澄清 | 文档“组装失败”作为统称不证明具体Loop时点；正文逐项区分Section render已有Step、Context候选可无Step、toolOrder组装失败 | D06三分支原始事件/请求，零模型调用 |
| refresh恢复范围 | 源码澄清 | 解除抑制后刷新原accepted对象能找回原optional；刷新已过滤对象不会凭空再收集optional；required可补回 | C09–14，不声称重跑全部组装 |
| 初始空Prompt | 新增覆盖 | 首轮39项全部通过，后补D11验证空系统头保留/模型无空消息/后续替换，为40项 | run文件保留两个阶段，最终40/40 |
| 分级标签 | 证据表达修订 | B不是另跑专项；明确写NOT_RUN standalone，真实Cordis包含于C/D且不重复计数 | run-labs与报告一致，重新执行40项 |

最终已核：48条断言的源码范围与分级、完整程序/答案、122固定引用、四图真实顺序、9Renderer和三宽度交互、21张定点截图、保护快照与H11专属提交范围。没有已知未关闭作者P0/P1。未把上述作者检查称作独立外审、学员试读、完整应用测试或性能测量。
