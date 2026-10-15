# AI 网页阅读与知识整理助手：P1 Student Starter

本项目只创建Chrome原生侧栏和React基础页面；不读取网页、不调用模型、无需API Key或数据库。本课配套正文会带你完成工具栏连线和欢迎页。

环境：本课验证Node24.16.0 / npm11.13.0，.nvmrc记录Node版本。package的Node>=22是安装下限，不等于所有版本都已测。先在本项目根目录检查`node --version`和`npm --version`；使用独立项目环境，不沿用其他课程的启动命令。

在解压后的项目根目录运行：

```powershell
npm ci
npm run typecheck
npm run dev
```

终端应显示127.0.0.1:3080及开发构建完成。Chrome地址栏打开chrome://extensions，开启开发者模式，加载项目内`.output/chrome-mv3-dev`。这是开发扩展目录，不能加载项目父目录，也不把终端URL当成扩展安装入口。停止dev时在终端按Ctrl+C。

**起点状态：**依赖、类型检查和构建应成功；工具栏连线尚未实现，直接点击图标没有侧栏属于本课起点。请按正文完成background.ts与App.tsx，不要把这个起点误记为本课终点通过。

完成本课后，在普通网页亲自点击本扩展工具栏图标，应打开原生Side Panel；页面标题和说明正确，点击确认按钮有反馈。本课未声明activeTab，不显示“已授权当前页”或伪造网页内容。

发布构建与打包：

```powershell
npm run build
npm run zip
```

生产构建加载`.output/chrome-mv3`，WXT ZIP也写在`.output`。开发构建依赖dev服务器；生产构建不依赖3080。关闭dev后用生产目录在新的Chrome Profile重新加载与复验；不要同时把同名开发版/生产版当成同一安装。

开发模式下WXT为热更新自动加入tabs/scripting和开发服务器权限；产品源码只声明sidePanel。生产manifest应只有sidePanel、无host_permissions/content_scripts/popup，CSP不允许外连。manifest下限116尚未实机验证；本课Chrome155结果不能代替其他版本兼容测试。

目录：`extension/wxt.config.ts`负责构建/manifest；`extension/entrypoints/background.ts`是MV3事件入口；`extension/entrypoints/sidepanel/`含HTML、React和CSS。`.wxt`、`.output`和`node_modules`是生成目录，不在其中修改课程代码。

排错：ENOENT先确认终端所在目录有package.json；Unsupported engine先核对Node；EADDRINUSE先停自己的旧dev或确认3080占用；缺manifest先检查加载的是生成目录；图标无反应先看background练习是否完成、是否有popup或自动侧栏设置；侧栏空白检查root节点、main.tsx引用及扩展错误；修改后若未更新，确认dev仍运行并在扩展卡片重新加载。

本包只含学生起点，核心练习由你与AI协作完成。
