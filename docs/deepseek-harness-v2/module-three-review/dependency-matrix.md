# 跨课知识依赖与阅读节奏

目标读者完成Stage 4与H01–H08，尚未系统阅读核心源码。模块产物是一个带身份、输入/输出与失败边界的执行模型，而非记住四组包名。

| 进入点 | 已有知识及深度 | 本课真正新增 | 离开本课必须能独立交出的东西 | 下一课使用点 |
|---|---|---|---|---|
| H09 | H05服务访问/贡献、H07Fiber/Effect、H08配置Entry；Stage2 ownerId是业务授权 | 活Agent、Registry查询/Factory委托/Handle释放、分阶段发布、五种关系 | P创建A、M持Handle、A父级与历史X的关系图；setup失败资源台账 | H10不用每Turn重新创建实例，维护屏障与公开idle已能解释 |
| H10 | H03导航链；Stage4模型提议/工具反馈；H06Waterfall | Turn/Step/Attempt、Phase/Inbox、候选接纳/准备/提交与恢复位置 | 手画零Step、两Step工具往返、同Step重试的边界；指出claimed和user/message差别 | H11在候选assemble和准备后提交这两个坐标上展开内容 |
| H11 | 系统/用户/工具角色、Schema；H09Scope；H10时间坐标 | Section/Variable/Context/Schema四路；assemble/render/refresh；系统节点协调；请求冻结 | 对同一输入给assembly、渲染文本、公共请求三份证据；解释为何旧变量+新目录同时出现 | H12消费已构造请求，理解prepare能力与代次时不混入Prompt算法 |
| H12 | H10一次尝试一份流、H11已记录输入；基础async/await | AsyncIterable、ContentBlock、StreamChunk、Assembler、紧凑流、Settlement | 按index填状态表；从live end回查对应事实；工具结果何时进入下一请求 | H13工具名字/定义与当前toolSet；H14执行/结果；H15安全边界 |

首次定义并无确认的倒置：H09在复杂所有权表前已经给任务创建者、观察者和关闭管理器的具体反例，Handle先有人话定义；H10先教下载按钮与四单位计数，再进入Phase；H11先给五种材料表再分别求值，不在一个节点塞完；H12提供可运行的三次yield例子、JSON字符串/对象和联合类型补课。每课都有6分钟左右复习，核心限制没有藏在可选答案里。

仍需观察的负担：H09一次接触五种关系，H10从状态转入多层try/finally，H11完整/局部刷新差别，H12绑定代次与紧凑记录校验。没有真实学员数据，不能把这些作者风险写成已证实失败或已解决理解率。

建议连续学习时按以下检查卡停顿，不增加必须通读的源码文件：

1. H09第一段只给三角色分入口；五维表时每次只改变一个条件：只换Handle持有者、只改parentAgent、只改历史parentSession。各回答一次“谁退出会让谁结束”。
2. H10先做direct→one-tool→retry三个计数，能数对再读三Phase/Inbox。读Step时用五个勾标Turn开始、领取、Step开始、消息提交、实际请求；每次取消删掉后面尚未发生的勾。
3. H11先算固定系统文字与一个变量，再加一个required目录，最后加一个工具；分别在assemble前和agent/request里变值。第一次练习只追一条消息，不同时引入in-history与抑制器。
4. H12先只追text index7，再插reasoning2与工具4；将finish分别改为max-tokens和本地取消。会区分blocks/message/事实之后，再读紧凑时间与Replay代次。
5. 完成[综合A](assessment.md#q13)后再跑跨课A；完成B/C/D推导后再看实际JSON。源码定位题接受多条有效路径，禁止只按术语出现给满分。

重复各有增量：H09 cancel/drain解释谁负责退出；H10解释在哪个控制边界退出；H12解释留下什么内容与结算。H10准备时序、H11材料内容、H12绑定能力是同一时刻的三种任务。模块新增模型只承担索引与贯通，未复制四份长程序；保留四课完整教学知识。练习总体由查询/身份→轨迹计数→输入推导→逐片/结算→完整新场景；建议把综合题作为第三模块收束，不挤入H12第一段。

真实试读待安排：先无答案画链和做四道综合题，记录每段用时、提示次数、错误类型，尤其“同Step重试”“Runtime Context=user”“committed非flush”“Schema非授权”。评分分歧与误答再决定是否移动正文练习；此处是未实施建议，没有虚构受试者或学习结果。
