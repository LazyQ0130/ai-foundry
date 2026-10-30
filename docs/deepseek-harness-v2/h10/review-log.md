# H10作者修订记录

新课从`e7dc928`新增，不回填历史课文或报告。以下记录实际发现、理由和复验；不是独立外审意见。原失败运行保留，最终正文哈希见content-check/visual-qa/manual-review/validation，必须一致。

| 项目 | 级别 / 初始现象 | 修订与理由 | 当前验证 |
| --- | --- | --- | --- |
| R01 依赖锚点 | P2；从H09改运行器时把默认Zod目录机械改为尚不存在的h10-probe-deps | 复用已有隔离h09-probe-deps中的Zod4.4.3；H10环境覆盖名独立保留；版本/integrity继续核锁，未安装或改项目依赖 | 后续31项真实运行通过；初始环境报错发生在测试前，未伪造该次TAP |
| R02 监听器签名 | P1；D09重试计数首轮30/31，模型请求未开始 | 原`system-prompt/assemble(assembly,next)`错把context当next；改为`(assembly,context,next)`后再next，按真实事件契约计数。未改官方源码或删断言 | 原失败run-1793328693111-tests.json保留；修后pre=1、assemble=1、request=2、模型=2，31/31 |
| R03 工具失败解释 | 源码审读纠正预期风险；不能写成“任何工具throw立刻Turn error” | 真实pipeline把主体异常规范成错误tool/result；正文/图四/答案改用2Step、completed但任务失败解释；批次基础设施异常另列 | D01-tool-error检查isError与FIXTURE_READ_FAILED，工具结果与下一Step真实存在 |
| R04 答案可读性 | P2；首轮320截图的单行JSON需横滚才能看到完整字段 | 参考JSON改分行，保持实际答案字段一致；不修改Renderer | 重新SSR/内容/三宽度QA并实际看最终答案截图 |
| R05 工具归属自动校验 | P2；首版verifyTrace只比调用总数，retry本身又无工具 | 增toolPositions=[callId,turn,step]，CLI允许retry/multi；D02核正确工具归属且要求错归Step失败，负例仍只错Step计数 | 31项保留同样测试数并加强有用断言；两份reference CLI实跑PASS，错误答案非零 |
| R06 引用精度 | P2；逐符号复核发现Phase末行running和clear首条语句不能落在引用范围外 | Phase收敛到53–61；clear到97–100；维护方法199–220；Prompt候选改引实际project/replace而非只引注释 | 40条清单重生成、96引用范围与1592源码字节复核；AST方法定位独立辅助 |
| R07 Git行尾 | P2；暂存时提示后续Windows检出会LF转CRLF，可能破坏官方fixture逐字节与证据哈希 | 两个H10目录各加局部.gitattributes禁止行尾转换，保留实际字节；不改根仓库规则或旧课。另去除运行器末尾多余空行 | 暂存内容与工作文件逐字节对应；diff --cached --check通过 |

R01是环境配置定位失败，原始终端错误在本会话，未生成测试run；R02是实际运行失败，完整stdout/stderr/退出值在evidence。没有把原失败覆盖成通过。后续各次run-*.json全保留；lab-tests/demo/results是最新成功视图。

最终逐图审查未见需修改的箭头/文字边界错误；图源生成和浏览器几何检查只是辅助，作者另看三宽度四图、导入、答案与完整程序21样本。学习负担补了真实停顿及回忆任务，六概念与五核心文件计数如实列出。

未决作者P0=0、P1=0；本表P2均已处理。试读/真实时长/独立外审/完整应用等是尚未取得的独立证据，不写成“已修复缺陷”，也不写已完成。若将来发现明确技术/学习问题，再按NO-GO规则处理。
