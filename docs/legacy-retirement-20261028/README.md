# 旧浏览器课程移出记录

2026-10-28，按用户本轮明确指令，将旧《AI 网页阅读与知识整理助手》四个专属目录移到 `C:\Users\QYF\Desktop\delete\AIFoundry-legacy-browser-20261028`，保留仓库相对层级，供用户手动删除。没有执行文件删除，也没有清理其他课程或用户原有的 `output/`。

恢复点：本地标签 `codex/pre-harness-v2-20261028`，指向 `1a52be2c6d48ecd255807083d65a529b0ee1eb24`。移出前工作区只有原有未跟踪 `output/`，没有受跟踪文件的未提交修改。

| 原相对目录 | Git 跟踪文件数 |
| --- | ---: |
| docs/ai-browser-copilot | 261 |
| course-content/internal/ai-browser-copilot | 50 |
| starter/ai-browser-copilot | 32 |
| spikes/ai-browser-copilot-spike | 273 |

清单见 `manifest.json`，逐文件记录移出前 SHA-256 与移出后核验结果。目录内原有的忽略文件随目录移动，没有按文件类型另行清除。若日后要恢复，先检查当前改动，再将所需确切文件从暂存目录复制回原相对路径；不要对整个工作区执行 reset 或覆盖用户后续改动。

检查 `src`、`server`、`scripts`、`tests`、`README.md`、`public` 未发现旧项目名称或技术代号引用。没有为替代课程修改目录、路由、权益、价格、数据库、发布或统计。旧项目移出与 Harness V2 研发分开提交，且不推送。
