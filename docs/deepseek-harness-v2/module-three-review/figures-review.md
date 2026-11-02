# 16张正式图与阅读预览审查

逐图对照SVG源文本/连线、draw_figures.py生成定义、PNG及正式正文alt/图注，结合固定控制流判断。新三宽度运行实际React LessonMarkdown与当前平台CSS，读取四份已保存HTML；原图交互、全部折叠/答案、整程序复制与代码横滚按原作者断言复验。源码与历史图均未改；重新从SVG导出的16张master与原PNG **逐字节相同**，见[export comparison](evidence/figure-export-comparison.json)。

| 图 | 实际审查重点与结果 |
|---|---|
| H09-01 | 创建箭头Registry→Factory→Handle，查询卡独立，无误画get产生dispose；内部共同所有者另卡，非进程/安全隔离 |
| H09-02 | Session准备/作用域→Session通知→setup/commit→Agent登记/串行通知→ready/维护退出，明确不保证调用方先于首轮，符合实作 |
| H09-03 | caller、Handle持有者、parentAgent、历史父级、归因五卡并列，无默认级联/Scope继承箭头；不会把历史X当活父A |
| H09-04 | 正常/初始化失败汇入同teardown，先等工作再Scope/write/Agent/Session；失败通知配对按已开始的边，不删除历史 |
| H10-01 | 五卡是独立Turn例子，零Step、同Step retry、同输出多工具边界明确；attempt事实非所有尝试清单 |
| H10-02 | Phase非Fiber/非公开status；两队列与唤醒/领取顺序准确；abort转投由正文限定，无无条件排队即历史箭头 |
| H10-03 | 一Turn三Step，候选准备→Step→请求准备/提交/历史→Assistant→Tools→call/result→Step结束；无工具才停止复查 |
| H10-04 | 各行为独立路径，pre-step与request取消的零Step/零请求不同，stream部分文本interrupted，retry留在Step；completed非业务成功 |
| H11-01 | 并列来源非时序；Section+Variable系统文本、Context带来源user、Schema独立tools，Session历史派生汇入请求 |
| H11-02 | 登记不定序，变量求值→规范排序/段求值→render；complete是独立另一轮，保留变量/工具/Waterfall边界 |
| H11-03 | 三种视图非阶段，A/B同名覆盖不改全局；A限制audit，匿名Provider叠加与具体Tools层区分；Scope非沙箱 |
| H11-04 | pre-step前assemble、正式Step先系统render后prepare、再动态refresh/render、提交、derive/freeze；重试返回请求准备，不重走候选 |
| H12-01 | 职责卡非执行轴，Runtime/Provider/Model/Adapter分层；DeepSeek Messages与PiAi库事件各自翻译；终止顺序是合约，正文明确坏Adapter不自动校正 |
| H12-02 | 7/2/4首次出现顺序、增量参数与权威block-end；live交付index另义；max-tokens去全部工具 |
| H12-03 | 外层句柄→start、片快照→Assembler→实时帧；append成功才committed seq，失败abandoned；非逐片Session，不代表磁盘flush |
| H12-04 | 正常、失败/提供方aborted、本地取消、上限、结算拒绝为独立分支；安全前缀message与空/工具attempt分开；retry显式 |

跨课图中箭头有文字说明：关系/并列视图不是时间，时间图自上而下，独立分支不串成同一次调用。H09的创建/退出与H10工作开始无矛盾；H10的准备卡由H11细分两种render；H12再细分流与结算，未改变因果。四课沿用深蓝文字/青色轮廓、蓝绿内容、琥珀强调/决策、红色失败的相同调色板，但**填充色不是全局的实时/持久类型系统**。统一模型另用R/S/M/T/C/J文字标注，避免把绿色卡一律读成持久事件。

| 检查 | 实际结果 / 证据 |
|---|---|
| SVG源/图形几何 | 16图中文字体可用、文本无边界越界/互相重叠；宽640、字体最小28；原图与新导出hash相同 |
| 1440 / 390 / 320 | 四课各三宽度共12次挂载，无页面横溢、图片失载或JS异常；16×3图截图与课页/程序/答案截图保留 |
| 默认与交互 | 4份正式HTML与当前SSR内容相符；答案默认关闭；完整代码复制逐文件LF规范后相同；键盘折叠、原图新页均通过 |
| 代码横滚 | 手机长程序在代码块内可横滚，不把整页撑宽；如H12 320下pre client251/scroll1852，实际scrollLeft1601 |
| 手机图字 | 320实际最小约12.6px，作者样本可辨；不能据尺寸宣布低视力或所有设备舒适 |
| 新测验预览 | 16答案初始折叠、键盘、展开/收起、四综合题筛选、自评限值/总分，在三宽度通过；已修390页脚长Commit溢出1px，原失败另存 |

原始记录在`evidence/baseline/h09…h12/evidence/visual-qa.json`与各自`visual/`。实际看图为本次集中自审：四张mobile-contact覆盖16图及图注；H09/H12 master-contact看未缩放字形；H10/H11其他宽度样本及新测验截图另列[manual-review.json](evidence/manual-review.json)。没有伪称独立视觉外审或真实学员测试。联系表是审查拼图，正式课仍用原单图；没有新增正式教学图或需同步修订的图源。

逐图源码文本清单与hash见[figure-texts.json](evidence/figure-texts.json)，实际截图不是只校SVG文字或几何的替代。未运行线上鉴权媒体、登录阅读页、进度API、移动真机/辅助技术用户测试。
