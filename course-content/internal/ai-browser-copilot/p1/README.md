# P1 作者交付索引

本目录属于课程研发内稿，未注册课程、资源路由、任务进度或发布状态。本轮只完成P1，原有Stage1–4/Capstone文件不改。

| 交付 | 位置与用途 |
|---|---|
| 冻结蓝图 | `../../../../docs/ai-browser-copilot/blueprint-v1.2.md` |
| 学员起点 | `../../../../starter/ai-browser-copilot/p1`，源码ZIP见本目录deliverables |
| 完整对照 | `reference`，仅P1完成态 |
| 正文 | `lesson.md`，真实Lesson Renderer V2五字段元数据、8个稳定checkKey、4组Prompt |
| 差异/教学设计 | `starter-reference-diff.md` |
| 下一节规格 | `handoff-p2.md`，仅约定无P2实现 |
| 验收/报告 | 仓库`docs/ai-browser-copilot`下的P1矩阵、人工指南和报告 |

交付包是独立源码，包含package/lock/配置及最小扩展；作者脚本、测试、日志和Phase0原型不进入学员包。生产扩展包另提供在deliverables，不能混淆源码ZIP与Chrome安装目录。

后续若获授权接入平台，才添加固定courseAssets资源ID、受控下载映射和项目课程目录。本次正文以附件名描述下载，不伪造不存在的resource ID，不放public或dist；当前可在私有作者预览检查渲染。已有正式站点全面build/test涉及发布产物或数据库，本轮采用独立工程构建与无数据库的渲染检查，不能声称已做正式站点集成验收。
