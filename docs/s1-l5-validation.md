# 1.5 保存和恢复版本：验证记录

> 以下保留 1.5 发布时的历史验收。Stage 1 收尾已修复 ZIP 缺少 .gitignore 的问题，正文已同步为正常项目先检查、缺少时兜底补齐；新交付 SHA 与验收见 [Stage 1 收尾记录](stage-1-final-validation.md)。旧 ZIP 状态与哈希不再代表当前交付。

日期：2026-09-28。基线：GitHub main `38fff61d22f3119f14c21f4bf980748595c0181b`。已完整读取 0～1.4、1.3/1.4 验证记录、Starter 源码与配置、Stage 1 目录、Renderer V2 规范；锁文件整体解析，ZIP 实际解包检查。未重写前课或改平台基础设施。

## A. 结构

| H2 | H3 |
| --- | --- |
| 先别急着让 AI 继续改 | — |
| 电脑上有没有 Git？ | 项目是不是已经在用 Git |
| 给现在这个好版本留一个保存点 | 先看看哪些文件准备被保存；第一次 commit；确认保存点真的存在 |
| commit 不是把项目上传到网上 | — |
| 现在故意改一点东西 | — |
| Git 知道项目已经变了 | — |
| 回到刚才那个能用的版本 | 先确认要恢复哪个文件；亲手 restore；页面和 Git 都再检查一次 |
| 什么时候值得保存一个版本 | — |
| 自己再做一次 | — |
| 卡住了怎么办 | 命令不存在、不是仓库、身份未知、依赖或环境文件被选入、提交后仍有变化、实验改太多、误 add/commit、pathspec、页面未变、误丢弃、clean/无新变化、LF/CRLF |

五个新 checkKeys，与已发布课不重复。一个实验 Prompt、一个 Concept、一个 Warning、Task/Check/Stuck、两个折叠 DeepDive。四处作者配图注释保留：保存点、status 前后、页面恢复、实验时间线。

## B. 概念和准确性

只解释 Git、仓库、当前修改、保存点/commit、status/log、restore，以及文件保存和版本保存的区别。GitHub 只用一句区分，未教远程操作或版本内部结构。

恢复流程限定为：已确认的 commit + clean 起点 → 实验只修改现有文件 → 不再 add/commit → status 确认为未选入提交的实验变化 → 逐文件 restore。没有把普通 restore 误写成任意历史恢复按钮。误 add、已 commit、新文件、同文件混有要保留修改时均先停下说明情况。

依据 [Git 官方 restore 文档](https://git-scm.com/docs/git-restore)：默认普通 restore 从已选入的内容恢复工作文件。因此本节必须明确实验后不 add，并在 Stuck 覆盖偏离主流程的情况。安装链接核对 [官方 Windows 页面](https://git-scm.com/install/windows) 和 [官方 macOS 页面](https://git-scm.com/install/mac)。

## C. 第一次保存命令

学生主线：`git --version` → `git status` → 仅无仓库时 `git init` / `git status` → 检查并必要时补 `.gitignore` → `git add .` → `git status` → `git commit -m "save working version"` → `git log --oneline -n 3` → `git status`。

统一英文 message，Windows Git 2.55.0.windows.5 实际成功；不声称完成 macOS shell/中文 message 实机验证。Windows 作者仓库检查出现 LF/CRLF 提示但命令成功，正文仅解释为通常非阻塞；隔离实验关闭全局配置后没有该提示，没有修改系统换行配置。

## D–E. A/B 保存、实验与恢复

临时项目位于系统 Temp 下，完全独立于作者仓库；内部脚本与原始记录在 `course-content/internal/stage-1/s1-l5/`。不提交临时 `.git`。所有 Git 操作均针对验证副本，作者仓库仅在交付时正常提交本课。

| 环节 | A：无 Git | B：已有 Git |
| --- | --- | --- |
| 代码起点 | 真实 ZIP + 1.4 A 完成态 | 1.4 B 完成态，另有个性化标题和旧提交 |
| 首次 status | 128，not a git repository | 正常，已有历史 |
| 初始化 | 本课流程执行一次 | 只在测试准备阶段创建历史；本课流程不重新 init |
| 保存 | 创建首个保存点 | 创建第二个保存点，保留第一个 |
| 实验文件 | app/page.tsx | app/page.tsx |
| 实验页面 | 版本恢复实验 / 这段修改稍后会恢复 | 同左 |
| 恢复命令 | git restore "app/page.tsx" | 同左 |
| 恢复标题 | 个人知识工作台 | 我的学习资料库 |
| 恢复介绍 | 把我平时收集的资料整理在这里，需要的时候一键找到。 | 把课堂笔记和有用的链接收在一起。 |
| Git 结果 | clean；保存点仍在；提交数仍为 1 | clean；保存点及旧提交仍在；提交数仍为 2 |

当前 Codex 只用文件补丁完成实验 Prompt 的两处文字修改；随后独立验收阶段读取 status 和差异，确认没有新增提交或选入修改，再逐文件恢复。源码归一化换行后与保存前完全一致；实验中未改变数据、依赖、筛选、样式、其他组件。

浏览器用 Edge 实际操作 A 3153、B 3154，均先验证正常，再看到实验文字，然后恢复并重走操作。对照卡片标题与统计，不只检查命令 exit code：默认 9/9、重要 3/9、重要+工具 0/9、关闭重要保留工具 2/9、切全部搜索 Next.js 1/9、清空 9/9。恢复后的标题和介绍按各自原文验证，A/B 浏览器 warn/error 均为空。

## F. 身份配置实测

A 隔离系统/全局身份，并禁止自动猜测署名。首次 commit 真实退出 128，输出 `Author identity unknown`、`Please tell me who you are`。只执行当前项目的 `git config --local user.name` / `user.email` 后，重新执行相同 commit 成功。

隔离脚本中的合成 QA 身份只用于测试，正文要求自己的名字和邮箱；未读取、修改用户全局身份。B 沿用已配置的项目身份，不重复配置。

## G. .gitignore：源码与 ZIP 的真实差异

**Starter 源码有 .gitignore，但交付 ZIP 没有 .gitignore，也没有 .git。** 本课未悄悄更改 ZIP 或打包器。正文明确要求保存前检查；缺少时只在自己的学习项目新建，保留已有规则。

A 按该步骤补齐；B 沿用已有文件。真实 npm install 各安装 102 个包、0 vulnerabilities；dev 正常启动产生 `.next`。另创建无凭证的 `.env`、`.env.local`、`.env.production` 测试文件及依赖/缓存探针，再执行真正的 `git add .`。`git ls-files` 确认这些内容均未加入，`.gitignore` 本身已加入。没有只依靠模式文本作推断。

正文也说明忽略规则不会自动排除已经记录或已选入的文件；异常时不继续 commit。安装引起的锁文件标记变化只存在于学习副本并随可用项目保存，未写回交付 Starter。

## H. 安全边界

学生正文没有破坏性批量恢复或清理命令，没有整项目 restore 主线。Warning 位于 restore 之前，明确整文件丢弃、同文件其他修改也会受影响、从未提交的修改不能保证找回。实验阶段要求 AI 不执行任何 Git 命令，不创建文件或提交。没有批量删除文件或目录。

## I. 工具边界

Codex 已按正文 Prompt 在 A/B 实做并验证；自动测试脚本是验证工具，不能算学生亲手实践或独立跨工具盲测。**尚未完成 WorkBuddy 默认工具实测。** 当前工具上下文禁用原生应用控制，没有用其他途径绕过该限制。

## J. 自动与课程页面验证

| 项目 | 结果 |
| --- | --- |
| 网站 tests | 57/57，通过；新增真实隔离 Git 流程测试 |
| typecheck | 通过，包含在 build 中 |
| build | 通过；原有大包提示保留，未做基础设施优化 |
| db:seed / content | 本地既有流程通过，4 阶段、6 篇已发布正文 |
| bundle | 78 个构建/公开文件、6 篇正文检查通过 |
| starter | ZIP 与源码既有打包规则一致，校验通过 |

权限与任务测试：1.5 匿名 401、无权益 403、有权益 200，新 checkKey 保存并读取成功；1.6 保持未发布 404。自动 Git 测试真实覆盖无仓库、首次身份失败、忽略文件、旧历史保留、两处实验和指定文件恢复。临时测试目录保留，未递归删除。

真实课程页使用 `aifoundry_test` 隔离 schema。桌面 1440×1000、手机 390×844 均检查；唯一 H1，正文 H2/H3 和 Concept/Warning/Stuck 可读，作者配图注释不显示。桌面文档宽 1425、手机 375，均无整页横向溢出。恢复命令与项目身份双行命令可读且复制正确，换行和引号保留。Prompt 188 字符，桌面和手机均复制原文成功。

首次自动读取剪贴板得到旧值，重新点击并等待界面反馈后比对成功；首次任务状态也在保存响应后才变 true，未因此修改 Renderer。首项 checklist 刷新后仍 true，验收后恢复 false。两个 DeepDive 默认关闭，桌面分别展开成功，手机展开也正常。

1.5 发布标记和本地目录已同步；没有执行线上部署，部署环境仍需按原流程同步 seed。GitHub 源码推送与线上部署分别记录，不混为一谈。

## K. Starter 不变

`git diff -- starter` 无变化。网站既有 build 步骤虽重打 ZIP，但前后 SHA256 完全一致：`D4E95406F8E3040C0C8A3E039EAE51C14882EDCBDCA645C02F2C8DC2185484FF`。

没有把 `.git`、内部实验、验证记录或 npm 依赖放进学生下载；没有修改 Starter 源码、忽略规则或打包器。

## L. 未展开

未教 GitHub 操作（只区分概念）、push/pull、branch、merge、reset、tag/release、底层结构或暂存区理论；未写 1.6。未修改 0～1.4 或平台基础设施。既有未跟踪的旧走查文档不纳入本次提交。
