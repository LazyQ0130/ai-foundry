# 来源、许可与运行边界

H09正文和四张SVG为本课程原创教学材料。公开接口短摘录、固定源码引用以及实验的服务装配模式来自DeepSeek Harness固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，MIT许可见SOURCE-LICENSE.txt；Cordis许可另保留CORDIS-LICENSE.txt。没有复制完整上游仓库进入课件，也没有修改缓存源码。

support.ts的harness改编自packages/core/agent-loop/tests/scope-lifecycle.spec.ts:19–29的harnessWithLoop，保留真实服务装配，省去模型适配器与其他无关可选能力。memoryStorageFixture及Node测试为作者夹具，不属于官方后端；没有磁盘、崩溃修复或跨进程承诺。Zod固定4.4.3，仅隔离安装并核固定锁完整性；许可见ZOD-LICENSE.txt。

官方Vitest文件只选读对应setup/action/assertions，没有执行其递归目录删除钩子；本轮运行器只在新临时目录写明确夹具，保留目录不清理。没有读取个人Harness Home、凭据、接入真实模型或登记文件/Shell工具。系统已有的output与其他原文件逐字节保留。

HTML是内部作者预览，不是公开课程页面；静态复制为选择文本，挂载版复制另有真实浏览器测试。图片/course-media映射不表示线上素材已可访问；线上鉴权、授权与发布需另行验收，本轮没有授权或执行发布。
