# P1 最后一轮真实 Chrome 验收（Windows）

状态：2026-10-14已由用户逐项完成，P1-16～19人工PASS，最终P1 GO。以下步骤保留用于以后复验，本轮不必重做。以下针对**新的P1交付**，不复测Phase0网页/选区/模型。预计10–15分钟，合并为A/B两组。已有自动检查不能代替这两组原生操作。

当前工具在读取Chrome窗口时返回“could not determine the current browser URL on Windows with enough confidence to enforce policy”，已停止本轮电脑界面操作。未模拟工具栏点击，没有把普通扩展tab截图算作原生Side Panel。

## 准备

Node24.16.0 / npm11.13.0 / Chrome155.0.8059.41。无需启动Phase0 API，无需Key。以下路径是作者本机的验收便利路径，未写入学员ZIP。

最终源码ZIP已经独立解压、安装和构建到：

```text
C:\Users\QYF\Desktop\AIFoundry\.runtime\p1-final-package-recheck-20261014\starter
C:\Users\QYF\Desktop\AIFoundry\.runtime\p1-final-package-recheck-20261014\reference
```

若使用另一台机器，解压`course-content/internal/ai-browser-copilot/p1/deliverables/ai-web-reader-p1-reference.zip`到新目录，在包含package.json那层运行`npm ci`、`npm run typecheck`、`npm run build`，后续路径换成自己的目录。

不要加载Phase0扩展当作P1。新扩展名称是“AI 网页阅读与知识整理助手 · P1”，开发版额外带“开发”。固定它自己的工具栏图标；默认图标可能是字母A。

## A：开发扩展的原生入口、React与修改反馈

1. 新PowerShell中运行：

```powershell
$p1Root = 'C:\Users\QYF\Desktop\AIFoundry\.runtime\p1-final-package-recheck-20261014\reference'
Set-Location -LiteralPath $p1Root
npm run dev
```

2. 等待`http://127.0.0.1:3080`和“Built extension”。打开`chrome://extensions`、开启开发者模式、点“加载已解压的扩展程序”。先选择`$p1Root`根目录一次：应提示没有Manifest。截下这个故障，再改选 **`$p1Root\.output\chrome-mv3-dev`**，应正常出现P1开发扩展卡片，无新错误。这个失败与恢复仅针对本课目录。
3. 用拼图菜单固定P1开发扩展图标。打开`https://example.com/`。亲手点击**P1图标**，应打开Chrome右侧原生侧栏，页面显示“AI 网页阅读与知识整理助手”，边界说明不读取网页。
4. 点击侧栏内“确认已看到侧栏”，应出现“确认成功：这是扩展的 React 页面。”。保存完整窗口截图`p1-A-native-panel.png`，包含网页地址、工具栏、侧栏和确认结果。
5. 保持dev终端运行，编辑`$p1Root\extension\entrypoints\sidepanel\App.tsx`，把“这是我的阅读入口。”改为“我的 P1 开发修改已生效。”，保存。当前侧栏应更新；截图`p1-A-native-update.png`。**把这句话恢复原文并保存**，确认侧栏也恢复。只改这个用于验收的副本，不编辑正式源码或生成文件。
6. 关闭侧栏，再亲点P1工具栏图标，仍应打开。侧栏右键“检查”看Console、扩展卡片点Service Worker看后台Console，记录是否有本课未处理错误；然后关闭检查窗口。
7. 回到dev终端按`Ctrl+C`，确保服务停止。此后不以开发版打开失败判断生产版失败。

通过条件：选错目录得到预期拒绝并恢复；从工具栏打开原生面板、React按钮、页面修改/恢复、侧栏关闭重开均符合预期。只打开`chrome-extension://.../sidepanel.html`标签页不算这组通过。

## B：生产版脱离服务、全新Profile安装与重开

1. 在Chrome扩展管理页**仅移除P1开发版**，其他扩展不动。在同一Profile加载下方生产目录，固定图标，再去example.com亲点图标、点确认按钮。dev已停止仍应成功。

```text
C:\Users\QYF\Desktop\AIFoundry\.runtime\p1-final-package-recheck-20261014\reference\.output\chrome-mv3
```

2. 记录生产扩展卡片名称/版本/ID和该加载路径。打开这里的`manifest.json`确认`manifest_version:3`、permissions只有sidePanel、无host_permissions/content_scripts/default_popup。保存`p1-B-production.png`，应含侧栏确认成功结果。
3. 用下面命令创建**本次专用的新Chrome资料目录**并打开独立窗口。若目录已存在，用新的时间后缀；不删除日常Profile。

```powershell
$p1Profile = Join-Path $env:USERPROFILE ('Desktop\p1-chrome-acceptance-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$p1Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
& $p1Chrome "--user-data-dir=$p1Profile" '--no-first-run' '--no-default-browser-check' 'chrome://extensions'
```

4. **在命令新打开的窗口**开启开发者模式，加载同一个P1生产目录，固定图标，打开example.com，点击P1图标和确认按钮。应成功，没有网页正文、选区、摘要、API按钮或权限提示。保存`p1-B-new-profile.png`。ID是否相同不是通过依据。
5. 关闭这个专用窗口的全部标签和DevTools，再用同一条`& $p1Chrome "--user-data-dir=$p1Profile" ...`命令重新打开该Profile，去example.com，再点P1图标和确认按钮。应成功，扩展管理页无本课新增错误。保存`p1-B-reopen.png`。

通过条件：生产模式不依赖3080；新Profile确实加载并实际点击成功；同一新Profile关闭再开成功。未亲自执行某步就保留该步BLOCKED。Chrome116不在本组中，仍未验证。

## 统一反馈与日志

请一次反馈以下结果，并注明Chrome版本、时间及最终Profile目录；可直接回复：

```text
A：错目录拒绝并恢复 / 工具栏打开 / React确认 / 修改及恢复 / 侧栏重开：逐项成功或失败
B：停dev后生产成功 / 全新Profile安装点击成功 / 关闭重开成功：逐项结果
Chrome版本：
最终Profile目录：
Console/扩展卡片新增错误：无，或完整错误文本
```

若失败，先保存原始错误，不反复重装：扩展卡片“错误”、Service Worker Console、侧栏右键检查的Console分别截图，附加载路径与具体点击步骤。只点击侧栏通用按钮、点击到Phase0图标、或只看到普通扩展tab都需要重做对应步骤。截图可放在本报告同级`artifacts/p1-20261014/manual/`下或通过会话提供；本轮不要求HAR或个人浏览记录。

Starter的初始TODO没有工具栏监听、按钮禁用是预期，不按Reference的完整功能验收。教学正文已经给出完成TODO后相同的学员验收流程；若要验证整节跟做体验，另用Starter按正文完成后再执行A/B，不能把原始Starter当成完整产品。
