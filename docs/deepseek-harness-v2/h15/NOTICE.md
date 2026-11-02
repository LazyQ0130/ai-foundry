# H15 来源与许可

受测官方实现来自DeepSeek Harness固定Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。以锁定缓存导入，不打包node_modules。保留[上游MIT](SOURCE-LICENSE.txt)、[Cordis](CORDIS-LICENSE.txt)、[Zod](ZOD-LICENSE.txt)、[Chokidar](CHOKIDAR-LICENSE.txt)、[Koffi](KOFFI-LICENSE.txt)、[YAML](YAML-LICENSE.txt)许可。

四图、讲解、题目与无副作用计算业务为本轮制作。结构性Agent+真实Session的组件夹具参考上游approval.spec.ts；测试钩子属于上游实际提供的边界。effectivePolicy为TS private，显式any读取仅作诊断。文件实验只替换默认递归清理钩子，未替换stat、版本检查、DACL、ReplaceFileW、link或rename等受测原语；消费者为明确教学适配器，不冒充完整tool-fs。
