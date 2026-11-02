# H15 内部研发交付

《Agent 安全执行：审批、权限、沙箱与文件系统守卫》。固定源码Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。结论：**CONDITIONAL GO**，仅作者研发交付；未发布，未开始H16。

- [正式教材](../../../course-content/internal/deepseek-harness/h15/lesson.md)与[完整lab](../../../course-content/internal/deepseek-harness/h15/lab/)
- [HTML阅读预览](reading-preview.html)：实际LessonMarkdown静态SSR，原生折叠可用；静态页移除未水合复制按钮，复制由真实React夹具另测
- [质量审查](quality-review.md)、[13项验收](acceptance.md)、[修订记录](review-log.md)
- [源码核对52条](source-checklist.md)、[测试及分级](test-evidence.md)、[原生平台覆盖](native-platform-coverage.md)
- [Renderer与三宽度](renderer-regression.md)、[H13–H15衔接](knowledge-bridge.md)、[H16前置交接](h16-handoff.md)
- [原始实验结果](evidence/practice-output.json)、[最终门禁](evidence/validation.json)、[文件hash清单](evidence/artifact-inventory.json)

## 复现

在仓库根目录使用Node 24与Python。先准备固定上游源码缓存及tsconfig，缓存环境变量为HARNESS_SOURCE_CACHE / HARNESS_GIT_CACHE；runner核对Git blob与SHA256。运行 `node docs/deepseek-harness-v2/h15/scripts/run-checks.mjs`，可分别调用同目录各脚本诊断。`prepare.py`仅保留初次脚手架记录，已有lab时会拒绝覆盖，不是日常门禁步骤。

依赖解析入口：H15_DEPS_ANCHOR指向H04隔离依赖中的commander/index.js；H15_ZOD_ANCHOR指向Zod4.4.3的index.js；H15_FS_DEPS_ANCHOR指向隔离依赖chokidar/index.js。第四模块集中审查发现原缓存传递依赖readdirp漂移至5.1.1，原运行器只核直接依赖；现补齐整棵文件依赖树integrity检查，默认改用新建module-four-probe-deps目录，不改历史缓存与报告。固定chokidar5.0.0、koffi3.1.1、yaml2.9.0、readdirp5.0.0，并在隔离package.json加 `overrides: {"readdirp":"5.0.0"}`，执行 `npm install --ignore-scripts --no-audit --no-fund`；再把H15_FS_DEPS_ANCHOR指向该目录的node_modules/chokidar/index.js。完整安装包与本轮日志见[集中审查](../module-four-review/README.md)。不在业务目录安装，不用最新传递依赖代替锁定版本。

Playwright使用AIFOUNDRY_QA_NODE_MODULES与AIFOUNDRY_QA_CHROME可配置入口；私有localhost服务测试后关闭，不新增产品路由、课程目录或public资源。四图由draw_figures.py生成SVG，再由Chrome生成PNG；无需外部图片服务。

只接触新建夹具。用户禁止批量删除，因此每次仅清理一个核验过的明确文件；原子写暂存清理钩子保留空目录，输出给出目录位置。没有执行上游包含递归清理的测试套件，也没有启动原生进程沙箱runner、真实模型或完整应用E。
