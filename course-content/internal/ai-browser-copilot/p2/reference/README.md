# P2 Reference · 内容提取与扩展通信

本课结束态，基于P1 Reference增量开发。尚未发布，不含模型、选区、问答或笔记功能。先做Starter练习，再用本项目对照。

独立安装Node.js24.16.0、npm11.13.0；engines下限22.12，未逐版本实测。WXT0.21.4 / React18.3.1 / TypeScript5.9.3 / Zod4.6.5及锁文件固定。Chrome155为研发验证版本，116仅声明下限，未实测。

在包含本文件及package.json的目录打开终端：

```powershell
npm ci
npm run typecheck
npm run dev
```

保持dev终端运行。在Chrome的chrome://extensions开启开发者模式，加载当前项目的`.output\chrome-mv3-dev`目录。不是项目根目录，也不是`extension`目录。工具栏固定本扩展图标。

新开终端在同一项目目录执行`npm run fixtures`，打开`http://127.0.0.1:8002/article-a`。点击Chrome工具栏的本扩展图标，再在侧栏点“读取当前网页”。应显示文章A的来源、标题和编号块。仅从Chrome侧栏列表打开不会新增activeTab授权。点击“核对来源与页面代次”可查看元数据。

其他练习页：`/article-b`、`/privacy`、`/long`、`/scan`、`/empty`、`/not-html`。它们是本地普通网页夹具，不是API服务；不需要API Key。网页可以访问这些测试端口，并不意味着扩展产品申请了host权限。

生产复验：Ctrl+C停止dev，执行`npm run typecheck`、`npm run build`。Chrome加载`.output\chrome-mv3`。开发构建含WXT专用回环权限，生产权限严格为sidePanel、activeTab、scripting、storage，无host权限和常驻Content Script；CSP禁止网络连接。本课只能读取普通顶层HTTP/HTTPS HTML，PDF/内置页/WebStore/iframe/Shadow DOM等不在支持范围。

模块职责：contracts是严格协议，context-tokens只保存匿名代次；extract是可序列化只读函数，coordinator负责sender/当前页面/代次/documentId/时限检查，read-client负责侧栏异步结果提交，App接Chrome事件并展示纯文本。不能用`document.body.innerText`代替排除与限长，也不能用tabId+URL代替页面代次。

刷新会使旧快照失效；同源grant可能仍在，重读可以成功。跨源后重新点击工具栏授权。关闭侧栏丢弃正文；worker重启保留匿名session代次。SPA同URL局部变动需用户主动重读，本课不实现通用DOM变更监控。

错误恢复：未授权先点工具栏；受限页面换普通HTML；无内容改用article-a；TIMEOUT重试；TAB_CHANGED重读。端口被占用先在自己的终端停止原服务，不盲目结束其他进程。改权限或后台代码后在扩展页点重新加载，再重开侧栏。不要把Chrome报错通过扩大为全站权限“修好”。

源码包不包含node_modules、.wxt、.output、Profile、密钥或作者测试工具。`npm run zip`生成Chrome产物ZIP，解压才可加载；它与包含package.json的源码ZIP不同。完整任务和证据标准见随附P2课程正文。
