# H12作者审查与修订

2026-10-30，固定Commit不变。记录实际发现和验证，不虚构行为测试先失败后成功。

| 项目 | 类型与处理 | 最终证据 |
| --- | --- | --- |
| 三处官方测试引用末行越界 | P1引用缺陷，已关闭：assistant-stream的504改486、DeepSeek prepared-call的100改59、pi-ai sdk-options的100改75；按实际文件核完整对应段 | [原始失败](evidence/source-range-initial-failure.json)、[实际patch](evidence/source-range-revision.patch)，125引用范围最终通过 |
| max-tokens工具保留 | 源码澄清：不是仅去掉未完成工具，而是全部tool-call；正文/图2/图4/答案一致 | C04与D-max-tokens；错误答案负例非零 |
| Runtime终止保证 | 源码澄清：异常规范化与Adapter合约不同；Runtime不修正任意正常yield的结束顺序 | C25真实坏生成器反例；源码adapterStream逐项转发 |
| 取消与提供方aborted | 源码澄清：本地信号决定中断catch；仅in-band aborted可写失败attempt并Turn error | D四取消场景与D-in-band-aborted |
| 配置回调与失败细节 | 新增/增强覆盖：首轮48通过；补C29后49；再核延后漂移码与LlmFailure完整字段后49 | run时间戳记录保留；没有失败的行为测试被改断言求绿 |

最终看图21样本、9Renderer与三宽度真实交互均通过；47断言、源码字节与程序同步检查通过。当前无已知未关闭作者P0/P1。独立外审、学员试读、实际时长、完整应用与性能仍未验证，不因作者自审改变等级。
