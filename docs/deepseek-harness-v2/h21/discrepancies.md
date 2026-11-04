# H21 版本差异、问题与处置

同一作者的技术/编辑轮次，不冒称独立审稿。以下不重写历史原课或上游源码；原始失败run均留在evidence。

| 编号/级别 | 发现、依据 | 处置与复核 |
| --- | --- | --- |
| B01 范围差异 | 任务暂定“Subagent委派：一个Agent如何创建并管理子Agent？”；正式蓝图是“Subagent、任务委派与多智能体协作” | 采用蓝图标题并保留其唯一目标，H22–H24不改序，未修改蓝图 |
| S01 P1风险已消除 | StartRequest.signal注释称全程取消；ActivationSpec/README称发布前。Manager外部分支移除startup监听，本地Factory成功创建后也不永久保留初始信号 | 教材按启动前、接受后、interrupt、dispose分阶段；B post-accept-abort和C外部句柄控制真实验证，不作“父取消所有子立即停”的保证 |
| S02 注释差异 | descriptor.ts前部注释称descriptor在初始Turn内；实际Manager.setup及C轨迹为Seq12 descriptor早于Seq14子turn/start | 教材按创建setup解释；图2和答案采用实际序列，不按注释造事件 |
| F01 P1已关闭 | 第一夹具在函数插件中new Runtime，漏走类插件的Service.init；目录投影未注册，首轮15项9通过/6失败 | 改为仅提供配置cell的类适配，保留真实Runtime初始化；移除不存在的普通Session.dispose调用，复验13通过/2失败及最终通过；未改官方实现 |
| F02 P1已关闭 | Fork夹具用不同model脚本做历史测试，但已继承request/header令AgentModel.current优先取记录路线，脚本耗尽 | 精读AgentModel.current，C保持继承路线以隔离历史问题；保留诊断trace和原失败；正文不宣称已覆盖任意Fork路线覆盖。S16补实际选择源码 |
| F03 P1已关闭 | 父替换测试在真实JSONL同ID重新create，被既有存储拒绝；异常后受控外部句柄未结算，runner60秒超时 | 用无持久源的C级外部句柄场景隔离精确父实例；finally保证解除门闩并settle句柄。没有绕过JSONL保护或修改断言，最终21项通过 |
| E01 P2已关闭 | 源码清单初稿若干手填范围指到函数前后注释 | 对实际声明/方法逐项重定位，补Host设置、深度和AgentModel选择辅助范围，重核固定字节/行界限。正文引用同步重生 |
| W01 P2开放 | 复杂概念仍多；180–250分钟是作者估计，比蓝图110–150增加70–100 | 三段停点、五核心文件、先预测/运行/解释、九程序和复杂边界折叠。需真实试读校准，不能用字数或绿色测试关闭此项 |

初始run记录依次可从时间戳文件与程序hash追溯；lab-tests.txt只显示最后一次，原run-*.json不覆盖。C fake external handle只验证Manager外部分支的取消、结果及清理，不代表真实外部Provider通过。
