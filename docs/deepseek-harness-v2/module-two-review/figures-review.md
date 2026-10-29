# 13张教学配图审查

逐张核对 SVG、生成脚本、PNG、正文 alt/图注及对应固定实现。所有图本轮重新导出到 evidence/masters；除修订的h07-01外，其余12图导出与正式 PNG 的SHA256逐字节相同，见 [figure-export.json](evidence/figure-export.json)。h07-01 修改生成源后生成SVG再导出PNG，未只改图注掩盖图内问题。

| 图 | 主要核对项与源码关系 | 结果/处置 |
|---|---|---|
| h05-01 | 左包含是代码职责，右边是能力依赖；非进程/真实完整依赖图；接口兼容才缩小替换影响 | 通过；与后课实际运行图任务不同 |
| h05-02 | 编译声明无注册箭头；Provider经Service构造登记，Consumer按inject调用；实/虚线图例 | 通过；Context不是Service本身；service.ts/registry/reflect互核 |
| h05-03 | 消费者先挂→PENDING→Provider完成可用→Consumer入口；标可交换顺序 | 通过；与真实consumer-first/异步提供方测试一致，不把登记即完成 |
| h06-01 | Service内部可开事件；分支是参与关系，不保证全执行；非消息队列 | 通过；没有把事件归为无返回广播 |
| h06-02 | 五模式等待/返回；parallel allSettled；serial/bail仅三种继续值；Promise对象停止 | 通过；调用/完成顺序分开，条件“无prepend”可见 |
| h06-03 | 实线去程右向、虚线回程左向；2→20→21；B拒绝仍回A | 通过；主体未进入留灰，非跳过所有外层；events.waterfall互核 |
| h07-01 | 精选六状态、显式释放、依赖恢复；失败需先清理；普通非根、非完整状态机 | **M2-01已修**：图内改“加载时：apply / 校验失败”；不外推ACTIVE更新拒绝 |
| h07-02 | on自动归属/原生资源显式配对；逆序启动≠串行完成；未登记退出反例 | 通过；不宣称释放未知资源、取消所有Promise |
| h07-03 | 左父子所有权，右同级依赖；Consumer PENDING保uid；显式dispose不复活 | 通过；兄弟无依赖可继续，无误连所有权边 |
| h08-01 | 四常规模板base→应用；minimal独立完整树；Bundle可多文件/多插件 | 通过；贡献顺序非初始化时序/继承 |
| h08-02 | surface/CLI整个config替换；retry/temperature消失；深合并反例与外层ID保留 | 通过；与官方Patch探针一致，不把Schema默认值当合并 |
| h08-03 | Bundle文件→Profile→Home→启动CLI→遥测特例→最终树→Include/Loader→运行核对 | 通过；未求值表达式和禁用行保留提示可见 |
| h08-04 | 配置协调、模块替换、重启分路；同Fiber普通更新/新Fiber重启用；失败阶段不同 | 通过；HMR恢复尽力、非外部回滚，不以此图宣称watch已实测 |

## 三宽度与人工观察

实际平台 LessonMarkdown+React+PostCSS/Tailwind，在1440/390/320均检查13图解码、alt/图注、单H1、无页面水平溢出；SVG中文字体、文字边界和重叠均通过。源最小字号28；课内图宽分别760/358/288，对应最小字约33.25/15.66/12.6px。代码溢出在代码块内横滚。

作者本轮实际查看13张完整导出图及13张320课内图（四张原尺寸拼接联系表），核中文、标签、边方向、执行顺序和手机图注；1440/390的布局还以自动截图/几何与各课静态开头样本复核。不是独立外审，也不把最小字号数值当低视力/所有设备舒适证明。

颜色沿用浅青背景、深蓝文字、浅蓝操作/结构、青绿有效运行/能力、琥珀条件、红色反例；未发现跨课色义冲突。所有简化范围均在图内或图注可见。H05“关系/等待”、H06“调用/返回”、H07“所有权/退出”、H08“配置/协调”回答不同问题，没有须删除的重复图。

当前正式素材仍在各课 figures/source 和 figures/rendered；本轮截图只在审查目录，不写public。机器记录：

- [H05](evidence/h05/evidence/visual-qa.json)、[H06](evidence/h06/evidence/visual-qa.json)、[H07最终](evidence/only-h07-final/h07/evidence/visual-qa.json)、[H08](evidence/h08/evidence/visual-qa.json)。
- 全宽/单图/展开代码截图在相应 evidence/hNN/visual；H07最终在 evidence/only-h07-final/h07/visual。
- 最小宽度逐图联系表：[H05](evidence/contact/h05-320.png)、[H06](evidence/contact/h06-320.png)、[H07](evidence/contact/h07-320.png)、[H08](evidence/contact/h08-320.png)。

低视力、更多手机字体环境与实际连续阅读负担保留 P2 跟踪；重要规则有正文等价解释和可打开原图。线上鉴权媒体/路由/进度未验证，研发视觉通过不等于发布通过。
