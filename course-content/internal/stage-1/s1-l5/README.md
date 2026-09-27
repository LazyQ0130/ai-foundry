# 1.5 内部保存与恢复实验

仅供课程验证，不是学生下载资源。复用 1.4 合格项目；不复制 Git 历史到此目录，不修改 Starter。

## 起点

- A：解压真实交付 ZIP，再叠加 1.4 A 完成态。ZIP 无 `.git`，也无 `.gitignore`；按本课步骤，只在临时学生副本中补上与 Starter 源码相同的忽略规则。
- B：使用已有 `.gitignore` 的另一种项目写法，准备一个旧提交，然后进入 1.4 完成态。标题改为“我的学习资料库”，介绍为“把课堂笔记和有用的链接收在一起。”，验证恢复不依赖固定原文。B 的准备阶段会初始化一次；模拟学生进入课程后的流程不再初始化。

## 重跑

在作者仓库运行 `node course-content/internal/stage-1/s1-l5/validation.mjs prepare`，会在系统临时目录生成全新 A/B 项目，输出绝对路径。拒绝在 Starter 或作者仓库运行实验 Git 操作，不删除任何文件。以下 `临时根目录` 替换为真实输出。

1. 可分别在 A/B 中安装依赖、启动开发服务器，验证原页面正常。
2. `node course-content/internal/stage-1/s1-l5/validation.mjs save "临时根目录"`：创建保存点；真实触发 A 首次提交身份缺失，使用仅供自动测试的项目级身份后重试；B 保留旧历史。
3. 将 `prompt.txt` 交给当前 AI，只做两个文字修改。自动测试中的脚本替换不算独立 AI 工具验证。
4. 浏览器确认实验标题和介绍真的出现。
5. `node course-content/internal/stage-1/s1-l5/validation.mjs inspect "临时根目录"`：确认仅首页变了、未被 add，保存点没有变化。
6. `node course-content/internal/stage-1/s1-l5/validation.mjs restore "临时根目录"`：逐份只恢复 `app/page.tsx`，确认 clean、内容一致、旧历史仍在。
7. 浏览器重测标题、介绍、搜索、标签、重要筛选和统计。

脚本模拟学生的 Git 操作以便复测；学生正文要求自己输入这些命令，AI 的实验修改阶段不得操作 Git。自动测试身份 `qa@example.invalid` 只用于隔离副本，正文要求学生使用自己的署名，不要求虚构邮箱。脚本隔离系统/全局 Git 配置，不修改用户全局身份。

## 证据

`git-evidence.json` 来自 2026-09-28 Windows 实测，包含实际命令、退出码、输出、保存点、修改差异与恢复断言。A/B 均已安装依赖、启动 dev 并用浏览器验证；完整结果见 [验证记录](../../../../docs/s1-l5-validation.md)。实验文字由当前 Codex 按正文 Prompt 实际修改，修改阶段没有运行 Git；其余 Git 操作属于课程验证阶段。

临时目录与其中 `.git` 保留在本机，不纳入下载或仓库。未使用 WorkBuddy，不声明 macOS 实机验证。
