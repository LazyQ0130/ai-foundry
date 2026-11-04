# H19 内部研发交付

《Context Compaction：长对话如何控制 Token 预算？》。官方固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；研发前基线 `a8fe4fb5a97b9d1237fe61a090f0188db5db24a2`。仅内部作者交付；完成本节后停止。

- [正式教材](../../../course-content/internal/deepseek-harness/h19/lesson.md)、[HTML 阅读预览](reading-preview.html)、[四项实践与综合实验](../../../course-content/internal/deepseek-harness/h19/lab/README.md)
- [教学质量报告](quality-review.md)、[覆盖矩阵](coverage-matrix.md)、[源码 54 断言](source-checklist.md)、[差异与研发修订](discrepancies.md)
- [前置阅读与知识衔接](knowledge-bridge.md)、[H20 前置与边界](h20-handoff.md)、[Renderer 与三宽度](renderer-regression.md)
- [原始执行记录](evidence/)、[最终保护验收](evidence/validation.json)、[临时材料登记](evidence/temporary-artifacts.json)

## 复验

仓库根使用 Node 24、Python 与隔离依赖：

```powershell
node docs/deepseek-harness-v2/h19/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h19/scripts/final-audit.py
```

脚本依次核固定源码、同步完整程序、执行真实组件与 Loop 测试、导图、使用实际 LessonMarkdown 生成预览、运行 H19 内容检查与既有 12 项 Renderer 回归、检查三宽度交互。实际看图单独记录；改图或正文后不能复用旧 hash 冒充已看最终稿。final-audit 检查保护基线、H18 保留文件和空目录、最终证据与暂存范围；已有 baseline 不可重建。

| 环境变量 | 本机锚点 |
|---|---|
| HARNESS_SOURCE_CACHE | C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3 |
| HARNESS_GIT_CACHE | C:/Users/QYF/.codex/research/deepseek-harness-f3803c9 |
| H19_DEPS_ANCHOR | C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js |
| H19_ZOD_ANCHOR | C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js |
| H19_NATIVE_ANCHOR | C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js |
| H19_LIMIT_ANCHOR | C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js |

换机先取得固定 Git 源码与完整 blob，不追 main。在新的隔离研究目录按 H04 的依赖清单准备基础包，另准备精确 Zod4.4.3、Koffi3.1.1、p-limit7.3.3、yocto-queue1.2.2、@js-temporal/polyfill0.5.1、jsbi4.3.2；保持 package-lock，runner 会逐项核上游 pnpm integrity，缺失或漂移拒绝。不要升级旧缓存或往业务项目安装。46 条依赖记录包含其他平台可选包，未安装包不代表运行过。

浏览器默认使用本机 Chrome 与既有 Playwright runtime；可覆盖 AIFOUNDRY_QA_CHROME、AIFOUNDRY_QA_NODE_MODULES。Windows Koffi 对应 win32-x64 预编译件；其他平台 native 路径本轮未验。

静态 HTML 使用实际 parser、LessonMarkdown 与编译后的平台 CSS，图片只在本地映射。静态页以原生折叠和选择复制阅读，完整复制按钮在真实 React 作者夹具中另验。没有新增产品路由、课程注册、权限、价格、数据库、发布状态或公开素材。

源码引用均为固定行锚，实验代码是本课装配与断言，未大段复制官方实现；官方许可见锁定源码 LICENSE。本课没有把 H18 结论折算成 H19 本轮验证，也未开发 H20。
