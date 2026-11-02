# 修订处置与前后依据

先登记见[issues-initial.md](issues-initial.md)。原有文件仅改H15/H16各README及run-labs.mjs四件；正式正文、lab、16源图/PNG和历史报告/预览保持字节。本轮未确认正文/图有技术P0/P1，不能为了审查显得有改动而重写。

| ID | 原位置→问题证据 | 修改与依据 | 回归结果/状态 |
|---|---|---|---|
| R01 P1 | 两运行器只核直接FS依赖；旧缓存readdirp5.1.1与固定上游5.0.0不符 | 加整棵FS依赖integrity guard；默认指向新隔离module-four树；README说明固定readdirp/override和安装范围；旧缓存不改 | 严格拒绝旧树，新树所有integrity匹配；H15 31/H16 23及136总项通过，两个demo通过；CLOSED |
| R02 P1 模块缺口 | 原准备包声明PREPARATION ONLY，缺正式模型/矩阵/综合题 | 本目录统一23站、五对跨课裁决、安全与家族矩阵、逐项测试映射、新A/B/C、复用D、18题与H17–20交接 | 3新增D通过、110AST/218源码断言、15宽度挂载、完整材料门禁；CLOSED |
| R03 P2 | 正式稿860–1150分钟显著高于蓝图，缺模块节奏 | 新增负担统计、分段产出/检查点、Q17阶梯迁移；不压掉关键边界 | Fresh metrics与原值一致；未施测，效果仍PENDING；作者材料CLOSED |
| QA01 P1 新夹具 | 空checklist/checkKeys被实际parser拒绝，退出1 | 测验补明确目标与独立key，保持五字段，不改parser | parser、SSR、三宽度18答案通过；CLOSED |
| QA02 P2 新QA | Windows剪贴板CRLF与DOM LF直接比较失败 | 只规范化行尾，完整代码仍逐字比较 | 29份完整程序×3宽度共87次复制通过；CLOSED |
| QA03 P2 新辅助runner | 多删一项args丢bootstrap URL；demo失败，前两负例为装载失败 | 正确移除3项test参数；负例要求退出1且AssertionError，不再把任意非零当反证 | 4受控负例有效，H15/H16 demo通过；原aux日志保留；CLOSED |
| QA04 P2 新测验排版 | 实际看图见标签原样**，原几何/交互已绿 | 标签后加空格，DOM确认18答案无未渲染星号 | 最新三宽度与人工长答案截图通过；CLOSED |
| QA05 P2 新检查范围 | 扫全仓把既有Capstone正式/内部草稿相同key当本轮失败 | 保留既有多引用，仅核四课/测验key无跨文件冲突 | 当前16课程key各唯一，测验1新key不冲突；无关文件不改；CLOSED |
| QA06 P2 新验收顺序 | 链接检查早于自身patch/validation/acceptance生成，首次final退出1；普通diff空上下文行触发patch文件自身空白检查 | 三个明确自生成件写后核链接；补零上下文精确patch，避免语法空白警告 | 本地链接及cached whitespace最终通过；CLOSED |
| C01 复核候选 | 准备包列的可见/准入、安全总链、Web/MCP/错误路径等 | 实际正文/源图已区分，记录一致性裁决，不修改正确材料 | 没有确认缺陷；RESOLVED NO CHANGE |

确认P0=0；P1三项（一个既有复现缺口、一个模块交付缺口、一个新增测验夹具），全部关闭。P2六项（负担材料及五个新增QA/runner问题）全部按表处理。H13图2输入与正文例子不同但各自成立，已在图审查补解释，非错误图。

R01原件在evidence/before，零上下文精确patch/前后hash由最终验收生成（若应用需git apply --unidiff-zero；本轮不执行回放）。审查目录局部.gitattributes关闭行尾转换以保留原始证据hash，不影响目录外文件。新增夹具失败在时间戳check/aux原记录；QA04原样标签的修改前表达式为`**标准答案：**`直接连接中文，实际看图发现后已改为空格分隔。当前截图保存最终版本，历史失败日志不改写。四课50份历史run记录及原全部证据保持；本轮不追认它们使用过新传递依赖。
