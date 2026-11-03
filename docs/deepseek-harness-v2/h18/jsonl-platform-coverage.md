# JSONL 实际验证范围与平台

固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Node24.16.0、Windows win32/x64，Koffi3.1.1调用Windows文件发布和命名内核信号量，Node内置Zstandard。具体程序/平台与执行目录见lab-results及时间戳run，依赖46个精确条目（含未安装的其他平台可选包）见dependencies。没有把其他平台包在lock中出现算成运行。

| 维度 | 状态 | 真实范围 / 限制 |
|---|---|---|
| 真实磁盘后端 | PASS（本机） | JSONL原始与默认压缩、write/flush/close、再read |
| 内存后端测试 | NOT_RUN | C/D使用内存Session对象，但没有本轮Map后端契约套件；H09旧夹具不升级 |
| 同一进程重复打开 | PASS | 同句柄与新句柄读取、关闭后的写权再取得 |
| 独立后端实例 | PASS | 关闭首Context/后端，新Context挂同root再开；空pending差别另验 |
| 独立进程重读 | PASS | B两种编码均启动真实新Node PID，逐事件/Header核对 |
| 真实跨进程写权 | PASS（同Windows登录会话） | 读可并存、write冲突、close释放、持锁测试PID终止后重新取得 |
| 原始JSONL | PASS | Header行+每事件行，不把物理Header算Seq |
| 默认压缩 | PASS | 省略compression、标准Zstd魔数、真实新实例/进程读回 |
| 物理原始尾部 | PASS（指定形式） | 无换行半行读取隐藏，首次新append修复，原已提交字节不变 |
| 物理压缩尾部 | PASS（指定形式） | 缺checksum末字节，可解码完整记录恢复、写时重写；非全Zstd错误矩阵 |
| Agent语义恢复 | PASS（局部D） | 两种tool错误C，真实resume的UNKNOWN/Step/Turn/end-seed与继续Turn2 |
| 真实持久Fork综合 | PASS（局部D） | 官方seed+Agent工厂取得新writer；普通sessions.fork的内存对照另列 |
| 版本拒绝与只读迁移 | PASS（新Fixture） | future/损坏/未知/ignorable及V3读成V4，源不变，无后继发布 |
| 写迁移/Worker | NOT_RUN | 只静态核源码/官方测试；不拿只读通过升级 |
| 真实断电 / OS崩溃 | NOT_RUN | 文件Fixture与单测试进程终止不能代替 |
| POSIX flock / Linux / macOS | NOT_RUN | 原生system入口源码锁定，未执行对应native addon |
| NFS / 网络盘 / 跨Windows登录会话 | NOT_RUN | 咨询锁/Local命名空间限制保留 |
| 完整Harness应用E | NOT_RUN | 没有完整Profile、真实模型、产品GUI/认证/进度/线上服务 |

通用Handle.append承诺接受/有序/本实例可见，flush才是通用耐久屏障。JSONL具体批次已等待write/sync；Windows物化采用同步临时文件和无替换write-through发布。上述真实运行验证指定平台路径与逻辑读回；物理sync/发布分支也静态核读，但不是断电或存储硬件认证。

所有root来自本轮scratch中的mkdtemp，没有读取真实DSH_HOME或用户Session。关闭后removeOne只unlink明确单文件并核根边界；不遍历批量删除，不删空目录。X/resume/buffer、测试快照与失败产物保留用于复核，run记录给绝对路径；工作区禁止批量删除优先，**没有把全部临时目录清理计为PASS**。原始执行与完整事件JSON保留在H18，旧目录与output未碰。

bootstrap拦截递归rm；正常路径使用真实官方实现，没有修改官方源文件。Win32上游错误清理分支若要求递归删除会被拒绝，相关目录竞态/清理失败矩阵未运行；不以移除守卫取得绿灯。
