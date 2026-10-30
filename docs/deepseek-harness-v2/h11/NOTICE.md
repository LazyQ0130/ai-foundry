# H11来源与许可证

课程研究对象为官方DeepSeek Harness固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。官方源码和测试位置见source-checklist；课程讲解、作者测试与教学图为本次研发产物。

`course-content/internal/deepseek-harness/h11/lab/official-mock.ts`逐字节复制该Commit的 `packages/core/agent-loop/tests/mock-adapter.ts`，用于局部测试，不访问供应商网络。[SOURCE-LICENSE.txt](SOURCE-LICENSE.txt)保留上游MIT许可。源码缓存保持只读，完整应用及上游测试套件未执行。

运行使用真实Cordis `4.0.6-alpha.1`，许可见[CORDIS-LICENSE.txt](CORDIS-LICENSE.txt)；Zod `4.4.3`许可见[ZOD-LICENSE.txt](ZOD-LICENSE.txt)。依赖包在仓库外隔离缓存，本包只保存版本/integrity证据，不重新打包node_modules。官方Mock来自上游，其他固定Provider、工具、输入均为教学夹具；不将其称为真实用户或真实模型行为。
