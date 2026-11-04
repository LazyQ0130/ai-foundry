# 事件、保存、压缩与恢复流程图

以下图保留实际分支和回环，固定 `f3803c9`。它们表达源码条件与责任，不代表所有节点每次都执行；await之间可能并发收到取消、维护或新事件。新图的[SVG源文件](figures/source/)及[四图导出](figures/qa/module-diagrams-contact.png)提供纵向职责导航，不能把导航卡片的排列当作唯一时间顺序。源码范围见[断言索引](evidence/source-assertion-index.json)及专项报告。

## Event Log、读模型与Agent执行

```mermaid
flowchart TD
  A[Factory准备Scope与Session] --> B[接纳输入并开始Turn]
  B --> C[Step准备及请求封装]
  C --> D[当前前缀的Surface / Header / toolHistory]
  D --> E[Runtime单次请求]
  E -->|成功| F[assistant/message]
  E -->|规范失败| G[assistant/attempt与request-error]
  G -->|策略retry且未取消| C
  G -->|未恢复或取消| Z[Step / Turn结束]
  F --> H{成功消息提议工具?}
  H -->|是| I[call登记 / prepare / dispatch]
  I --> J[等待已启动主体结算并按模型序记录result]
  J -->|尚可继续| C
  H -->|否| Z
  B -. 各阶段提交 .-> K[Session append:归属 / 快照冻结 / 验证替换计划]
  F -.-> K
  G -.-> K
  J -.-> K
  K -->|检查失败| N[不push该事件]
  K -->|检查通过| L[push后通知; 已提交内存事实]
  L --> M[Surface与内置缓存按需推进]
  L --> P[Registry驱动业务Projection]
  M --> D
  L -. 有writer才路由 .-> Q[持久化缓冲; 非自动耐久证明]
```

只有五类合格消息来源按Surface读；retry、attempt、compaction/*等日志不会因为被append就进入普通请求。某个Projection观察器失败也不撤销已push事实。实际受控整链事件0–42见[统一模型](unified-reliability-model.md)。

## Persistence、Resume与普通Fork

```mermaid
flowchart TD
  A[内存Session已提交事实] --> B{是否有持权writer?}
  B -->|否| C[内存可增长; flush true不证明已保存]
  B -->|是| D[路由buffer / 串行修改链]
  D --> E[Session或服务flush先drainLive]
  E --> F[handle.append / handle.flush]
  F -->|成功| G[按后端契约确认耐久前缀]
  F -->|失败| H[观察错误; 未确认尾保留供显式重试]
  G --> I[close排空 / 等chain / 释放writer]
  H --> E
  I --> J[新后端实例open write取得所有权]
  J --> K[读物理有效记录前缀]
  K -->|完整记录结构坏| L[拒绝; 不随意删最后一行]
  K -->|合法前缀| M[修复开放语义尾并append闭合]
  M --> N[prepare / 构造marker / 发布Agent]
  N --> O[新输入开始后续Turn]
  K -. 独立分支选择 .-> P[普通Fork:核切点并含切点复制]
  P --> Q[子end-seed marker]
  Q --> R[如有开放尾追加forked结果与closers]
  R --> S[子内存Session; 不重执行历史工具]
  S -. 另行显式工厂保存 .-> D
```

图中Resume语义修复在构造marker前，普通Fork的marker在子合成closer前，顺序不同。JSONL实现的批次write+sync比通用append承诺更强。物理尾的处理取决于raw/Zstd和读取/首次写入阶段；不是一律删尾。外部工具效果不沿箭头回滚。

## Compaction的日志与Surface双层

```mermaid
flowchart TD
  A[每次测当前Surface及请求封装] --> B{入口条件成立?}
  B -->|未达压力 / 不适用| C[继续当前历史]
  B -->|压力 / 路由变化 / 手动 / 合格overflow| D[选平衡区间;保护首system与工具对]
  D -->|无有效进展| C
  D -->|合法选区| E[append compaction/start并锁定]
  E --> F[辅助摘要请求;观察取消]
  F -->|结果可用| G[重验原选区与工具配对]
  G -->|仍合法| H[append compaction/summary审计事实]
  H --> I[append user消息:承载摘要与Surface replace]
  I --> J[append compaction/end]
  J --> K[当前Surface使用摘要;原始日志保留]
  K --> A
  F -->|失败 / 取消| L[尝试记录失败end并释放相应控制]
  G -->|重验失败| L
  H -->|提交异常| L
  I -->|提交异常| L
  J -->|提交异常| M[保留已成功提交前缀;不伪造end]
  L --> M
```

T=`floor(min(W×ratio,W−O−B))`，保留目标R=`floor((W−O)×retainRatio)`，另受配置合法性/选区条件约束。summary和end本身不是模型摘要；替换也可能已成功而end未成功，不能称全部原子回滚。下一请求必须重新derive，不复用压缩前消息数组。

## Retry、Waterfall与取消

```mermaid
flowchart TD
  A[当前Step请求发生规范失败] --> B[结算assistant/attempt]
  B --> C{Agent已取消?}
  C -->|是| Z[按取消路径结束Step / Turn]
  C -->|否| D[request-error Waterfall按登记链运行]
  D --> E{当前处理者与策略}
  E -->|normal资格及本地预算可用| F[append llm/retry计划]
  E -->|Basic overflow满足预算且能取得进展| G[实际压缩并验证输入已改变]
  E -->|always| H[先await下游策略]
  E -->|不接手| I[继续下游或最终未恢复]
  H -->|下游已有恢复| J[采用其决定]
  H -->|下游未恢复| F
  F --> K[可取消退避等待]
  K -->|取消 / lifetime退出| Z
  K -->|等待完成| L[append llm/retry-started]
  G -->|有进展| J
  G -->|失败 / 无进展| I
  J --> M{仍未取消且决定retry?}
  L --> M
  M -->|是| N[同Step重新prepare并从当前前缀derive]
  N --> A
  N -->|成功| O[assistant/message及正常后续]
  I -->|最终未恢复| P[Step / Turn error]
  M -->|已取消| Z
```

N→A只在下一Attempt也失败时发生。normal与Basic各自预算，注册顺序决定谁先接手，不能画成固定“先重试N次再压缩M次”。计划事件与started都没有通用自动flush保证；旧日志不能重建已消失的退避timer。工具批次取消的独立轨迹及未动态验证的物理sync竞态见[取消专项](cancel-and-side-effects.md)。
