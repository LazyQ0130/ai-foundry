# 2.2 内部 A/B 参考实现与验证

这些文件只供课程作者核对，不是学生下载资源。学生应在自己的 2.1 项目上增量修改。A 保留 1.6 的日期排序，B 保留清除筛选、独立统计组件与自选标题。两份 `app/page.tsx` 与各自 2.1 完成页逐字相同；本课只给原有 `ResourcePreview` 增加真实发送能力，并新增同一份 `app/api/resources/route.ts`。原始资料、卡片、依赖与 Starter ZIP 未改。

## 文件与接口

- `common/app/api/resources/route.ts`：Next.js App Router 的 `POST /api/resources`。要求 JSON 对象、字符串 `title`/`desc`/`tag`、去空格后的非空标题与简介、真实分类（不含“全部”），并限制标题 100 字、简介 500 字。
- 成功：HTTP 200，`{ok:true,status:"received",saved:false,resource:{title,desc,tag},message:"服务端已收到，但尚未保存。"}`。`resource` 是校验后去首尾空格的实际请求内容。失败：HTTP 400，`{ok:false,error:"..."}`。
- `common/components/ResourcePreview.tsx`：原预览仍是独立动作；“发送给服务端”用当前输入发真实 `fetch`，等待并读取响应，再显示实际返回的资料与 `saved:false`。API 拒绝、响应格式异常、断网分别显示错误；改动输入时清除旧接收结果。
- `implementation-a/app/page.tsx` 和 `implementation-b/app/page.tsx`：沿用 2.1 版本，各自保留原 1.6 功能。

要独立运行，按 2.1 内部参考的方式从正式 Stage 1 Starter 复制允许的源文件，叠加各自 2.1 完成页、B 的 `ResourceStats`，再叠加本目录的 `common` 文件。不要将内部参考打进学生 Starter ZIP。

## 2026-09-28 真实项目验收

临时 A/B 项目位于 `C:\Users\QYF\AppData\Local\Temp\aifoundry-s2-l2-20260928201845\a` 和 `b`。两者分别执行 `npm install`、`npm run dev`、`npx tsc --noEmit --incremental false`、`npm run build`，均通过；Next.js 15.5.26，安装依赖报告 0 vulnerabilities。开发服务器运行在 3031/3032 端口。

先只叠加 API 文件，分别向真实运行的 A/B Route Handler 发送测试请求；确认服务端行为后才叠加前端组件。每份项目的结果一致：合法 JSON 返回 200 和 `saved:false`；空标题、空简介、不允许的分类、“全部”、错误标题类型、格式错误 JSON 均返回 400 JSON。合法值的首尾空格被服务端去掉。

浏览器在 A/B 中实际填写并点击“发送给服务端”。两次发送不同内容后，页面各自展示最新返回的标题、简介与分类；服务器日志记录 `POST /api/resources 200`。仅预览仍不触发发送。空标题或简介让页面显示服务端 400 错误，旧成功状态消失；停掉 B 的开发服务器再发送，页面显示连接失败，未显示接收成功。刷新后输入和接收结果消失，正式列表仍是原来的 9 条。

A 的日期排序仍可用；B 的搜索、教程分类、重要筛选组合得到 1/9，清除筛选回到 9/9，自选标题仍在。原 `lib/resources.ts`、`package.json` 与卡片源文件和 Starter 相同。没有 Prisma、数据库、localStorage、模块级资料数组或新依赖。此接口仅适用于受控本地教学实验，没有认证或所有权检查，不作为公开写入接口部署。

浏览器页面、真实服务端日志及独立 HTTP 请求共同证明了 POST 和响应链；本次没有直接打开浏览器开发工具的 Network 面板，因此不把 Network 面板检查记为已完成。默认 WorkBuddy 工具也未实测。
